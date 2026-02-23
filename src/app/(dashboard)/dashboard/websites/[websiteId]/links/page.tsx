"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGlobalJobs } from "@/components/dashboard/global-jobs-context";
import type { InternalLink, SuggestedLink, StepStatus } from "@/components/links/types";
import { AISuggestionsPanel } from "@/components/links/AISuggestionsPanel";
import { LinksPageHeader } from "@/components/links/LinksPageHeader";
import { AddLinkForm } from "@/components/links/AddLinkForm";
import { LinksList } from "@/components/links/LinksList";

export default function InternalLinksPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const [links, setLinks] = useState<InternalLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ keyword: "", url: "" });
  const [search, setSearch] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedLink[]>([]);
  const [stepStatus, setStepStatus] = useState<StepStatus | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [isSavingSuggestions, setIsSavingSuggestions] = useState(false);

  const { addJob, updateJob, removeJob, getJob, registerCancel, unregisterCancel } = useGlobalJobs();
  const linksJobId = `links-gen-${websiteId}`;
  const linksAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const restore = () => {
      const job = getJob(linksJobId);
      if (job?.status === "done" && job.resultData?.suggestions?.length) {
        setSuggestions(job.resultData.suggestions);
        setSelectedSuggestions(new Set(job.resultData.suggestions.map((_: SuggestedLink, i: number) => i)));
        if (job.resultData.steps) setStepStatus(job.resultData.steps);
      }
      if (job?.status === "running") {
        setIsGenerating(true);
      }
    };
    restore();
    const t = setTimeout(restore, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/links`);
      if (res.ok) setLinks(await res.json());
    } catch {
      toast.error("Failed to load links");
    } finally {
      setIsLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleAdd = async () => {
    if (!newLink.keyword.trim() || !newLink.url.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });
      if (res.ok) {
        toast.success("Link pair added");
        setNewLink({ keyword: "", url: "" });
        fetchLinks();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add link");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    setDeletingId(linkId);
    try {
      const res = await fetch(`/api/websites/${websiteId}/links?id=${linkId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Link removed");
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const generateSteps = ["crawling", "analyzing", "generating"];

  const handleAutoGenerate = async () => {
    linksAbortRef.current?.abort();
    const controller = new AbortController();
    linksAbortRef.current = controller;

    setIsGenerating(true);
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    setStepStatus(null);
    registerCancel(linksJobId, () => controller.abort());

    addJob({
      id: linksJobId,
      type: "links",
      label: "Internal link suggestions",
      websiteId,
      href: `/dashboard/websites/${websiteId}/links`,
      status: "running",
      progress: 10,
      currentStep: "crawling",
      steps: generateSteps,
    });

    try {
      updateJob(linksJobId, { progress: 30, currentStep: "analyzing" });
      const res = await fetch(`/api/websites/${websiteId}/links/suggest`, {
        method: "POST",
        signal: controller.signal,
      });
      updateJob(linksJobId, { progress: 80, currentStep: "generating" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to generate suggestions");
        updateJob(linksJobId, { status: "failed", error: data.error || "Generation failed" });
        return;
      }

      setStepStatus(data.steps ?? null);

      const fetched: SuggestedLink[] = data.suggestions || [];
      setSuggestions(fetched);
      setSelectedSuggestions(new Set(fetched.map((_: SuggestedLink, i: number) => i)));

      updateJob(linksJobId, {
        status: "done",
        progress: 100,
        resultData: { suggestions: fetched, steps: data.steps },
      });

      if (fetched.length === 0) {
        toast.warning("No new link pairs found — try adding pages to your website first");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        toast.info("Link generation cancelled");
        removeJob(linksJobId);
        return;
      }
      toast.error("Network error — please try again");
      updateJob(linksJobId, { status: "failed", error: "Network error" });
    } finally {
      linksAbortRef.current = null;
      setIsGenerating(false);
      unregisterCancel(linksJobId);
    }
  };

  const handleCancelGenerate = () => {
    linksAbortRef.current?.abort();
  };

  const toggleSuggestion = (idx: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleSaveSuggestions = async () => {
    const toSave = suggestions.filter((_, i) => selectedSuggestions.has(i));
    if (!toSave.length) { toast.warning("No links selected"); return; }

    setIsSavingSuggestions(true);
    let saved = 0, skipped = 0;

    for (const link of toSave) {
      try {
        const res = await fetch(`/api/websites/${websiteId}/links`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: link.keyword, url: link.url }),
        });
        if (res.ok) saved++; else skipped++;
      } catch { skipped++; }
    }

    await fetchLinks();
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    removeJob(linksJobId);
    setIsSavingSuggestions(false);
    toast.success(skipped > 0 ? `Saved ${saved} link pairs (${skipped} skipped)` : `Added ${saved} internal link pairs`);
  };

  const handleDismissSuggestions = () => {
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    setStepStatus(null);
    removeJob(linksJobId);
  };

  const handleRemoveSuggestion = (idx: number) => {
    const remaining = suggestions.filter((_, i) => i !== idx);
    setSuggestions(remaining);
    setSelectedSuggestions((prev) => {
      const next = new Set<number>();
      for (const v of prev) {
        if (v < idx) next.add(v);
        else if (v > idx) next.add(v - 1);
      }
      return next;
    });
    if (remaining.length === 0) {
      removeJob(linksJobId);
    } else {
      updateJob(linksJobId, { resultData: { suggestions: remaining, steps: stepStatus } });
    }
  };

  const filtered = links.filter(
    (l) =>
      l.keyword.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AISuggestionsPanel
        isGenerating={isGenerating}
        suggestions={suggestions}
        stepStatus={stepStatus}
        selectedSuggestions={selectedSuggestions}
        isSavingSuggestions={isSavingSuggestions}
        generateSteps={generateSteps}
        onToggleSuggestion={toggleSuggestion}
        onSetSelectedSuggestions={setSelectedSuggestions}
        onSaveSuggestions={handleSaveSuggestions}
        onDismissSuggestions={handleDismissSuggestions}
        onCancelGenerate={handleCancelGenerate}
        onRemoveSuggestion={handleRemoveSuggestion}
      />

      <LinksPageHeader
        isGenerating={isGenerating}
        onAutoGenerate={handleAutoGenerate}
      />

      <AddLinkForm
        newLink={newLink}
        isAdding={isAdding}
        onNewLinkChange={setNewLink}
        onAdd={handleAdd}
      />

      <LinksList
        links={links}
        filtered={filtered}
        search={search}
        deletingId={deletingId}
        isGenerating={isGenerating}
        onSearchChange={setSearch}
        onDelete={handleDelete}
        onAutoGenerate={handleAutoGenerate}
      />
    </div>
  );
}
