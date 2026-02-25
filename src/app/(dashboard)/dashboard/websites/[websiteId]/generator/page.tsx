"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  ArrowRight,
  Network,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useGlobalJobs } from "@/components/dashboard/global-jobs-context";
import { JobCard, PIPELINE_STEPS } from "@/components/generator/job-card";
import { ClusterCard } from "@/components/generator/cluster-card";
import { ClusterDialog } from "@/components/generator/cluster-dialog";

import type { JobStatus } from "@/components/generator/job-card";
import type { ClusterData } from "@/components/generator/cluster-card";
import type { ClusterPreviewData } from "@/components/generator/cluster-dialog";

/* ──────────────────────────── Types ──────────────────────────── */

interface Keyword {
  id: string;
  keyword: string;
  status: string;
  priority: number;
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function GeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.websiteId as string;

  // Keyword queue
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [activeJobs, setActiveJobs] = useState<JobStatus[]>([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string>("");
  const [contentLength, setContentLength] = useState("MEDIUM");
  const [includeImages, setIncludeImages] = useState(true);
  const [imageSource, setImageSource] = useState<"AI_GENERATED" | "WEB_IMAGES" | "ILLUSTRATION">("AI_GENERATED");
  const [includeFAQ, setIncludeFAQ] = useState(true);
  const [includeProTips, setIncludeProTips] = useState(true);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [customDirection, setCustomDirection] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-pro-preview");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Cluster feature
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [showClusterDialog, setShowClusterDialog] = useState(false);
  const [seedTopic, setSeedTopic] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const researchAbortRef = useRef<AbortController | null>(null);
  const [clusterPreview, setClusterPreview] = useState<ClusterPreviewData | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<number>>(new Set());
  const [isSavingCluster, setIsSavingCluster] = useState(false);
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  // Load saved model + image source preference
  useEffect(() => {
    fetch(`/api/websites/${websiteId}/blog-settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.preferredModel) setSelectedModel(data.preferredModel);
        if (data.imageSource && ["AI_GENERATED", "WEB_IMAGES", "ILLUSTRATION"].includes(data.imageSource)) {
          setImageSource(data.imageSource);
        }
      })
      .catch(() => {});
  }, [websiteId]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    fetch(`/api/websites/${websiteId}/blog-settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferredModel: model }),
    }).catch(() => {});
  };

  /* ── Fetchers ────────────────────────────────────────────── */

  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords`);
      if (res.ok) {
        const data = await res.json();
        setKeywords(data.filter((k: Keyword) => k.status === "PENDING"));
      }
    } catch {
      toast.error("Failed to load keywords");
    } finally {
      setIsLoading(false);
    }
  }, [websiteId]);

  const { addJob: addGlobalJob, updateJob: updateGlobalJob } = useGlobalJobs();
  const CONTENT_STEPS = useMemo(() => PIPELINE_STEPS.map((s) => s.id), []);

  const addGlobalJobRef = useRef(addGlobalJob);
  addGlobalJobRef.current = addGlobalJob;
  const updateGlobalJobRef = useRef(updateGlobalJob);
  updateGlobalJobRef.current = updateGlobalJob;

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/jobs`);
      if (!res.ok) return;
      const jobs: JobStatus[] = await res.json();
      setActiveJobs(jobs);

      for (const j of jobs) {
        const gid = `content-${j.id}`;
        if (j.status === "QUEUED" || j.status === "PROCESSING") {
          addGlobalJobRef.current({
            id: gid,
            type: "content",
            label: j.input?.keyword || "Content generation",
            websiteId,
            href: `/dashboard/websites/${websiteId}/generator`,
            status: "running",
            progress: j.progress,
            currentStep: j.currentStep || undefined,
            steps: CONTENT_STEPS,
          });
        } else if (j.status === "COMPLETED" || j.status === "FAILED") {
          updateGlobalJobRef.current(gid, {
            status: j.status === "COMPLETED" ? "done" : "failed",
            progress: j.status === "COMPLETED" ? 100 : j.progress,
            error: j.error || undefined,
          });
        }
      }
    } catch {
      // silent
    }
  }, [websiteId, CONTENT_STEPS]);

  const fetchClusters = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/clusters`);
      if (res.ok) {
        const data = await res.json();
        setClusters(data);
      }
    } catch {
      // silent
    }
  }, [websiteId]);

  const fetchJobsRef = useRef(fetchJobs);
  fetchJobsRef.current = fetchJobs;
  const fetchClustersRef = useRef(fetchClusters);
  fetchClustersRef.current = fetchClusters;
  const fetchKeywordsRef = useRef(fetchKeywords);
  fetchKeywordsRef.current = fetchKeywords;

  useEffect(() => {
    fetchKeywordsRef.current();
    fetchJobsRef.current();
    fetchClustersRef.current();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId]);

  useEffect(() => {
    const hasActive = activeJobs.some(j => j.status === "QUEUED" || j.status === "PROCESSING");

    if (hasActive && !pollRef.current) {
      pollRef.current = setInterval(() => {
        fetchJobsRef.current();
        fetchClustersRef.current();
      }, 4000);
    }

    if (!hasActive && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [activeJobs]);

  const prevJobsRef = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    for (const job of activeJobs) {
      const prev = prevJobsRef.current.get(job.id);
      if (prev && prev !== job.status) {
        if (job.status === "COMPLETED") {
          toast.success("Blog post generated successfully!");
          fetchKeywords();
          fetchClusters();
        } else if (job.status === "FAILED") {
          toast.error(`Generation failed: ${job.error}`);
        }
      }
    }
    const newMap = new Map<string, string>();
    for (const job of activeJobs) {
      newMap.set(job.id, job.status);
    }
    prevJobsRef.current = newMap;
  }, [activeJobs, fetchKeywords, fetchClusters]);

  /* ── Job Actions ─────────────────────────────────────────── */

  const handleRetry = async (jobId: string) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Retry failed");
        return;
      }
      toast.success(`Retrying "${data.keyword}"...`);
      await fetchJobs();
      await fetchKeywords();
    } catch {
      toast.error("Failed to retry");
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", jobId }),
      });
      if (res.ok) {
        toast.success("Job cancelled");
        fetchJobs();
      } else {
        toast.error("Failed to cancel job");
      }
    } catch {
      toast.error("Failed to cancel job");
    }
  };

  const handleDismiss = async (jobId: string) => {
    setActiveJobs(prev => prev.filter(j => j.id !== jobId));
    await fetch(`/api/websites/${websiteId}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss", jobId }),
    }).catch(() => {});
  };

  const handleGenerate = async () => {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywordId: selectedKeywordId || undefined,
          contentLength,
          includeImages,
          imageSource,
          includeFAQ,
          includeProTips,
          includeTableOfContents,
          autoPublish,
          customDirection: customDirection.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success(`Generating "${data.keyword}"...`);
      await fetchJobs();
    } catch {
      toast.error("Failed to start generation");
    } finally {
      setIsStarting(false);
    }
  };

  /* ── Cluster Actions ─────────────────────────────────────── */

  const handleClusterResearch = async () => {
    if (!seedTopic.trim()) return;
    researchAbortRef.current?.abort();
    const controller = new AbortController();
    researchAbortRef.current = controller;

    setIsResearching(true);
    setClusterPreview(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preview: true, seedTopic: seedTopic.trim() }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Research failed");
        return;
      }
      const data: ClusterPreviewData & { preview: boolean } = await res.json();
      setClusterPreview(data);
      setSelectedKeywords(new Set(data.keywords.map((_, i) => i)));
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        toast.info("Research cancelled");
        return;
      }
      toast.error("Failed to research cluster");
    } finally {
      researchAbortRef.current = null;
      setIsResearching(false);
    }
  };

  const handleCancelResearch = () => {
    researchAbortRef.current?.abort();
  };

  const toggleKeyword = (idx: number) => {
    setSelectedKeywords(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectAll = () => {
    if (!clusterPreview) return;
    setSelectedKeywords(new Set(clusterPreview.keywords.map((_, i) => i)));
  };

  const selectNone = () => {
    setSelectedKeywords(new Set());
  };

  const handleSaveCluster = async () => {
    if (!clusterPreview || selectedKeywords.size === 0) return;
    setIsSavingCluster(true);
    try {
      const kws = clusterPreview.keywords.filter((_, i) => selectedKeywords.has(i));
      const res = await fetch(`/api/websites/${websiteId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedTopic: seedTopic.trim(),
          pillarTitle: clusterPreview.pillarTitle,
          selectedKeywords: kws,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
        return;
      }
      const data = await res.json();
      toast.success(`Cluster "${data.pillarTitle}" created with ${data.keywordCount} keywords queued!`);
      setShowClusterDialog(false);
      setSeedTopic("");
      setClusterPreview(null);
      setSelectedKeywords(new Set());
      await fetchKeywords();
      await fetchClusters();
    } catch {
      toast.error("Failed to save cluster");
    } finally {
      setIsSavingCluster(false);
    }
  };

  const handleDeleteCluster = async (clusterId: string) => {
    try {
      await fetch(`/api/websites/${websiteId}/clusters?id=${clusterId}`, { method: "DELETE" });
      setClusters(prev => prev.filter(c => c.id !== clusterId));
      toast.success("Cluster deleted");
    } catch {
      toast.error("Failed to delete cluster");
    }
  };

  /* ── Derived State ───────────────────────────────────────── */

  const runningJobs = activeJobs.filter(j => j.status === "QUEUED" || j.status === "PROCESSING");
  const completedJobs = activeJobs.filter(j => j.status === "COMPLETED");
  const failedJobs = activeJobs.filter(j => j.status === "FAILED");

  const nextKeyword = selectedKeywordId
    ? keywords.find((k) => k.id === selectedKeywordId)
    : keywords[0];

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" />
            AI Content Generator
          </h2>
          <p className="text-muted-foreground">
            Generate SEO-optimized blog posts powered by advanced AI
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge variant="outline" className="text-sm">
            {keywords.length} keyword{keywords.length !== 1 ? "s" : ""} in queue
          </Badge>
          <Button onClick={() => setShowClusterDialog(true)} size="sm" className="gap-1.5">
            <Network className="h-4 w-4" />
            New Cluster
          </Button>
        </div>
      </div>

      {/* ─── Topic Clusters ──────────────────────────────────── */}
      {clusters.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Network className="h-4 w-4" />
            Topic Clusters
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {clusters.map(cluster => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                expanded={expandedCluster === cluster.id}
                onToggle={() => setExpandedCluster(expandedCluster === cluster.id ? null : cluster.id)}
                onDelete={handleDeleteCluster}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">

          {/* All Active Jobs */}
          {runningJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {runningJobs.length} active job{runningJobs.length > 1 ? "s" : ""}
              </h3>
              {runningJobs.map(job => (
                <JobCard key={job.id} job={job} websiteId={websiteId} onRetry={handleRetry} onDismiss={handleDismiss} onCancel={handleCancel} />
              ))}
            </div>
          )}

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-green-600 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {completedJobs.length} completed
              </h3>
              {completedJobs.map(job => (
                <JobCard key={job.id} job={job} websiteId={websiteId} onRetry={handleRetry} onDismiss={handleDismiss} onCancel={handleCancel} />
              ))}
            </div>
          )}

          {/* Failed Jobs */}
          {failedJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-600 flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5" />
                {failedJobs.length} failed
              </h3>
              {failedJobs.map(job => (
                <JobCard key={job.id} job={job} websiteId={websiteId} onRetry={handleRetry} onDismiss={handleDismiss} onCancel={handleCancel} />
              ))}
            </div>
          )}

          {/* Queue Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keyword Queue</CardTitle>
              <CardDescription>
                Select which keyword to generate next
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : keywords.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-medium mb-1">No keywords in queue</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add keywords manually or create a topic cluster to get started
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/websites/${websiteId}/keywords`}>
                        Add Keywords
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button onClick={() => setShowClusterDialog(true)} className="gap-1.5">
                      <Network className="h-4 w-4" />
                      New Cluster
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select keyword</Label>
                    <Select
                      value={selectedKeywordId || keywords[0]?.id}
                      onValueChange={setSelectedKeywordId}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {keywords.map((kw, i) => (
                          <SelectItem key={kw.id} value={kw.id}>
                            <span className="text-muted-foreground mr-2">#{i + 1}</span>
                            {kw.keyword}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {nextKeyword && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <p className="font-medium">{nextKeyword.keyword}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Priority: {nextKeyword.priority} · Ready to generate
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Generate Blog Post
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Content Length</Label>
                <Select value={contentLength} onValueChange={setContentLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHORT">Short (600-800 words)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (1000-1500 words)</SelectItem>
                    <SelectItem value="LONG">Long (1800-2500 words)</SelectItem>
                    <SelectItem value="PILLAR">Pillar (2500-3500 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Custom Direction <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea
                  placeholder="Guide the blog's opening and direction, e.g. 'Start by addressing why home care for elderly parents is becoming the top choice over nursing homes in 2026...'"
                  value={customDirection}
                  onChange={(e) => setCustomDirection(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Tell the AI where to take the blog. This text guides the opening and overall angle.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Include Images</Label>
                  <p className="text-xs text-muted-foreground">Featured + 2 inline images</p>
                </div>
                <Switch checked={includeImages} onCheckedChange={setIncludeImages} />
              </div>

              {includeImages && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Image Style</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { value: "AI_GENERATED" as const, label: "AI Images" },
                      { value: "WEB_IMAGES" as const, label: "Web Images" },
                      { value: "ILLUSTRATION" as const, label: "Illustrations" },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setImageSource(opt.value)}
                        className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                          imageSource === opt.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Include FAQ Section</Label>
                  <p className="text-xs text-muted-foreground">4-5 Q&A pairs</p>
                </div>
                <Switch checked={includeFAQ} onCheckedChange={setIncludeFAQ} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Pro Tips</Label>
                  <p className="text-xs text-muted-foreground">Expert callout boxes</p>
                </div>
                <Switch checked={includeProTips} onCheckedChange={setIncludeProTips} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Table of Contents</Label>
                  <p className="text-xs text-muted-foreground">Clickable TOC after intro</p>
                </div>
                <Switch checked={includeTableOfContents} onCheckedChange={setIncludeTableOfContents} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Publish</Label>
                  <p className="text-xs text-muted-foreground">Publish immediately on complete</p>
                </div>
                <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">StackSerp AI Engine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Engine Version</Label>
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-3.1-pro-preview">StackSerp v1.0</SelectItem>
                    <SelectItem value="claude-sonnet-4-6">StackSerp v2.0</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedModel.startsWith("claude-")
                    ? "Latest engine with superior human-like writing and nuanced tone"
                    : "Stable engine with fast, high-quality content generation"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/dashboard/websites/${websiteId}/keywords`}>
              Manage Keywords
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Cluster Dialog ───────────────────────────────────── */}
      <ClusterDialog
        open={showClusterDialog}
        onOpenChange={(open) => {
          setShowClusterDialog(open);
          if (!open) {
            setClusterPreview(null);
            setSeedTopic("");
            setSelectedKeywords(new Set());
          }
        }}
        seedTopic={seedTopic}
        onSeedTopicChange={setSeedTopic}
        isResearching={isResearching}
        clusterPreview={clusterPreview}
        selectedKeywords={selectedKeywords}
        isSavingCluster={isSavingCluster}
        onResearch={handleClusterResearch}
        onCancelResearch={handleCancelResearch}
        onToggleKeyword={toggleKeyword}
        onSelectAll={selectAll}
        onSelectNone={selectNone}
        onSave={handleSaveCluster}
        onBack={() => {
          setClusterPreview(null);
          setSelectedKeywords(new Set());
        }}
      />
    </div>
  );
}
