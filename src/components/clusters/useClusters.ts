"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useGlobalJobs } from "@/components/dashboard/global-jobs-context";
import type { TopicCluster, SuggestedCluster, StepStatus, NewClusterForm } from "./types";

const CLUSTER_STEPS = ["crawling", "analyzing", "generating", "saving"];

export function useClusters(websiteId: string) {
  const [clusters, setClusters] = useState<TopicCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clusterKeywordSelection, setClusterKeywordSelection] = useState<Record<string, Set<string>>>({});
  const [addingToQueueId, setAddingToQueueId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedCluster[]>([]);
  const [stepStatus, setStepStatus] = useState<StepStatus | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [seedTopic, setSeedTopic] = useState("");
  const [newCluster, setNewCluster] = useState<NewClusterForm>({
    name: "",
    pillarKeyword: "",
    supportingKeywords: "",
  });

  const fetchClusters = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/clusters`);
      if (res.ok) setClusters(await res.json());
    } catch {
      toast.error("Failed to load clusters");
    } finally {
      setIsLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  const { addJob, updateJob, removeJob, getJob, registerCancel, unregisterCancel } = useGlobalJobs();
  const clusterJobId = `cluster-gen-${websiteId}`;
  const clusterAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const restore = () => {
      const job = getJob(clusterJobId);
      if (job?.status === "done" && job.resultData?.suggestions?.length) {
        setSuggestions(job.resultData.suggestions);
        setSelectedSuggestions(new Set(
          (job.resultData.suggestions as SuggestedCluster[]).map((_, i) => i)
        ));
        if (job.resultData.stepStatus) setStepStatus(job.resultData.stepStatus);
      }
    };
    restore();
    const t = setTimeout(restore, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAIGenerate = async () => {
    clusterAbortRef.current?.abort();
    const controller = new AbortController();
    clusterAbortRef.current = controller;

    setIsGenerating(true);
    setStepStatus(null);
    registerCancel(clusterJobId, () => controller.abort());

    const label = seedTopic.trim()
      ? `Clusters: "${seedTopic.trim()}"`
      : "AI Topic Clusters";

    addJob({
      id: clusterJobId,
      type: "clusters",
      label,
      websiteId,
      href: `/dashboard/websites/${websiteId}/clusters`,
      status: "running",
      progress: 5,
      currentStep: "crawling",
      steps: CLUSTER_STEPS,
    });

    try {
      // Step 1: Enqueue the job (fast — no AI call here)
      const res = await fetch(`/api/websites/${websiteId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate: true, seedTopic: seedTopic.trim() || undefined }),
        signal: controller.signal,
      });

      const enqueueData = await res.json();
      if (!res.ok) {
        toast.error(enqueueData.error || "Generation failed");
        updateJob(clusterJobId, { status: "failed", error: enqueueData.error || "Generation failed" });
        return;
      }

      const { jobId } = enqueueData as { jobId: string };
      updateJob(clusterJobId, { progress: 20, currentStep: "analyzing" });

      // Step 2: Poll the job status until done (worker runs on Droplet — no timeout)
      let done = false;
      while (!done) {
        if (controller.signal.aborted) break;

        await new Promise(r => setTimeout(r, 2000));
        if (controller.signal.aborted) break;

        const pollRes = await fetch(`/api/jobs/${jobId}`, { signal: controller.signal });
        if (!pollRes.ok) continue;

        const pollData = await pollRes.json() as {
          status: string; currentStep?: string;
          output?: { suggestions: SuggestedCluster[]; steps?: StepStatus }; error?: string;
        };

        if (pollData.currentStep === "analyzing") {
          updateJob(clusterJobId, { progress: 40, currentStep: "analyzing" });
        } else if (pollData.currentStep === "generating") {
          updateJob(clusterJobId, { progress: 75, currentStep: "generating" });
        }

        if (pollData.status === "COMPLETED") {
          done = true;
          const newStepStatus = (pollData.output?.steps as StepStatus) ?? null;
          setStepStatus(newStepStatus);

          if (!pollData.output?.suggestions?.length) {
            setSuggestions([]);
            setSelectedSuggestions(new Set());
            updateJob(clusterJobId, { status: "done", progress: 100, resultData: { suggestions: [], stepStatus: newStepStatus } });
          } else {
            setSuggestions(pollData.output.suggestions);
            setSelectedSuggestions(new Set(pollData.output.suggestions.map((_: SuggestedCluster, i: number) => i)));
            updateJob(clusterJobId, {
              status: "done",
              progress: 100,
              resultData: { suggestions: pollData.output.suggestions, stepStatus: newStepStatus },
            });
          }
        } else if (pollData.status === "FAILED") {
          done = true;
          toast.error(pollData.error || "Generation failed");
          updateJob(clusterJobId, { status: "failed", error: pollData.error || "Generation failed" });
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        toast.info("Cluster generation cancelled");
        removeJob(clusterJobId);
        return;
      }
      toast.error("Generation failed — please try again");
      updateJob(clusterJobId, { status: "failed", error: "Request failed" });
    } finally {
      clusterAbortRef.current = null;
      setIsGenerating(false);
      unregisterCancel(clusterJobId);
    }
  };

  const handleCancelGenerate = () => {
    clusterAbortRef.current?.abort();
  };

  const handleSaveSuggestions = async () => {
    const toSave = suggestions.filter((_, i) => selectedSuggestions.has(i));
    if (!toSave.length) { toast.warning("No clusters selected"); return; }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveClusters: true, clusters: toSave }),
      });

      if (!res.ok) throw new Error("Save failed");
      toast.success(`Saved ${toSave.length} topic clusters`);
      setSuggestions([]);
      setSelectedSuggestions(new Set());
      removeJob(clusterJobId);
      fetchClusters();
    } catch {
      toast.error("Failed to save clusters");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSuggestion = (idx: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleRemoveSuggestion = (i: number) => {
    const remaining = suggestions.filter((_, j) => j !== i);
    setSuggestions(remaining);
    setSelectedSuggestions(prev => {
      const next = new Set<number>();
      for (const idx of prev) {
        if (idx < i) next.add(idx);
        else if (idx > i) next.add(idx - 1);
      }
      return next;
    });
    if (remaining.length === 0) { removeJob(clusterJobId); }
    else { updateJob(clusterJobId, { resultData: { suggestions: remaining, stepStatus } }); }
  };

  const selectAllSuggestions = () => {
    setSelectedSuggestions(new Set(suggestions.map((_, i) => i)));
  };

  const dismissSuggestions = () => {
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    setStepStatus(null);
    removeJob(clusterJobId);
  };

  const handleAddManual = async () => {
    if (!newCluster.name || !newCluster.pillarKeyword) return;
    setIsAdding(true);
    try {
      const keywords = newCluster.supportingKeywords
        .split(",").map((k) => k.trim()).filter(Boolean);

      const res = await fetch(`/api/websites/${websiteId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCluster.name,
          pillarKeyword: newCluster.pillarKeyword,
          supportingKeywords: keywords,
        }),
      });

      if (res.ok) {
        toast.success("Cluster added");
        setShowAddDialog(false);
        setNewCluster({ name: "", pillarKeyword: "", supportingKeywords: "" });
        fetchClusters();
      } else {
        toast.error("Failed to add cluster");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (clusterId: string) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/clusters?id=${clusterId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Cluster deleted");
        setClusters((prev) => prev.filter((c) => c.id !== clusterId));
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleClusterKeyword = (clusterId: string, kw: string) => {
    setClusterKeywordSelection((prev) => {
      const current = new Set(prev[clusterId] ?? []);
      if (current.has(kw)) current.delete(kw); else current.add(kw);
      return { ...prev, [clusterId]: current };
    });
  };

  const toggleAllClusterKeywords = (cluster: TopicCluster) => {
    const allKws = [cluster.pillarKeyword, ...cluster.supportingKeywords];
    const current = clusterKeywordSelection[cluster.id];
    const allSelected = current && allKws.every((kw) => current.has(kw));
    setClusterKeywordSelection((prev) => ({
      ...prev,
      [cluster.id]: allSelected ? new Set() : new Set(allKws),
    }));
  };

  const handleAddToQueue = async (cluster: TopicCluster) => {
    const selection = clusterKeywordSelection[cluster.id];
    const toAdd = selection && selection.size > 0
      ? Array.from(selection)
      : [cluster.pillarKeyword, ...cluster.supportingKeywords];

    setAddingToQueueId(cluster.id);
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: toAdd }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Added ${data.imported} keyword${data.imported !== 1 ? "s" : ""} to queue${data.skipped ? ` (${data.skipped} already existed)` : ""}`);
        await fetch(`/api/websites/${websiteId}/clusters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updateStatus: true, clusterId: cluster.id, status: "IN_PROGRESS" }),
        }).catch(() => {});
        setClusters((prev) =>
          prev.map((c) => (c.id === cluster.id ? { ...c, status: "IN_PROGRESS" } : c))
        );
        setClusterKeywordSelection((prev) => ({ ...prev, [cluster.id]: new Set() }));
      } else {
        toast.error(data.error || "Failed to add keywords");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingToQueueId(null);
    }
  };

  return {
    clusters,
    isLoading,
    isGenerating,
    isAdding,
    isSaving,
    expandedId,
    setExpandedId,
    clusterKeywordSelection,
    addingToQueueId,
    showAddDialog,
    setShowAddDialog,
    suggestions,
    stepStatus,
    selectedSuggestions,
    seedTopic,
    setSeedTopic,
    newCluster,
    setNewCluster,
    clusterSteps: CLUSTER_STEPS,
    handleAIGenerate,
    handleCancelGenerate,
    handleSaveSuggestions,
    toggleSuggestion,
    handleRemoveSuggestion,
    selectAllSuggestions,
    dismissSuggestions,
    handleAddManual,
    handleDelete,
    toggleClusterKeyword,
    toggleAllClusterKeywords,
    handleAddToQueue,
  };
}
