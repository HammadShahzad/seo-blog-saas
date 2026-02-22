"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Link2,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  Sparkles,
  CheckCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useGlobalJobs } from "@/components/dashboard/global-jobs-context";

interface InternalLink {
  id: string;
  keyword: string;
  url: string;
  createdAt: string;
}

interface SuggestedLink {
  keyword: string;
  url: string;
  reason: string;
}

interface StepStatus {
  crawl: "ok" | "failed";
  ai: "ok" | "failed";
  error?: string;
  pagesFound: number;
}

function ResultStatusBanner({ steps }: { steps: StepStatus }) {
  const allGood = steps.crawl === "ok" && steps.ai === "ok";
  const aiOnly = steps.crawl !== "ok" && steps.ai === "ok";

  if (allGood) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-800">
            Found {steps.pagesFound} pages on your website
          </p>
          <p className="text-green-700 text-xs mt-0.5">
            Mapped them to keyword→URL pairs below
          </p>
        </div>
      </div>
    );
  }

  if (aiOnly) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">
            Couldn&apos;t crawl your website
          </p>
          <p className="text-amber-700 text-xs mt-0.5">
            Make sure your website URL is correct and publicly accessible, then try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm">
      <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-red-800">AI generation failed</p>
        <p className="text-red-700 text-xs mt-0.5">
          {steps.ai === "failed" ? (
            <>
              AI generation returned an error — this is usually temporary. Try again in a moment. If it keeps failing, verify your API keys are valid.
              {steps.error && <span className="block mt-1 bg-red-100 p-1.5 rounded text-red-800 font-mono text-[10px] break-all">{steps.error}</span>}
            </>
          ) : (
            "Both crawl and AI generation failed — check your website URL and API keys"
          )}
        </p>
      </div>
    </div>
  );
}

export default function InternalLinksPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const [links, setLinks] = useState<InternalLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ keyword: "", url: "" });
  const [search, setSearch] = useState("");

  // AI suggestion state
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedLink[]>([]);
  const [stepStatus, setStepStatus] = useState<StepStatus | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [isSavingSuggestions, setIsSavingSuggestions] = useState(false);

  const { addJob, updateJob, removeJob, getJob } = useGlobalJobs();
  const linksJobId = `links-gen-${websiteId}`;
  const linksAbortRef = useRef<AbortController | null>(null);

  // Restore suggestions from global job context on mount (survives navigation)
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
      {/* Inline AI Suggestions panel (non-blocking — like keywords page) */}
      {(isGenerating || suggestions.length > 0) && (
        <Card className={isGenerating ? "border-blue-200 bg-blue-50" : "border-primary/20 bg-primary/5"}>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
                {isGenerating
                  ? "Generating internal link suggestions…"
                  : `AI Suggestions — ${suggestions.length} link pairs`}
              </CardTitle>
              {!isGenerating && suggestions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs h-7"
                    onClick={() => {
                      if (selectedSuggestions.size === suggestions.length)
                        setSelectedSuggestions(new Set());
                      else
                        setSelectedSuggestions(new Set(suggestions.map((_, i) => i)));
                    }}>
                    {selectedSuggestions.size === suggestions.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button size="sm" className="h-7 text-xs"
                    disabled={isSavingSuggestions || selectedSuggestions.size === 0}
                    onClick={handleSaveSuggestions}>
                    {isSavingSuggestions
                      ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      : <Plus className="mr-1.5 h-3 w-3" />}
                    Save {selectedSuggestions.size} to Links
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground"
                    title="Dismiss suggestions"
                    onClick={handleDismissSuggestions}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {isGenerating && (
              <>
                <Progress value={50} className="h-1 mt-2" />
                <div className="flex items-center gap-1 mt-1">
                  {generateSteps.map((s) => {
                    const labels: Record<string, string> = { crawling: "Crawling", analyzing: "Analyzing", generating: "Generating" };
                    return (
                      <span key={s} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-800">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        {labels[s]}
                      </span>
                    );
                  })}
                  <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleCancelGenerate}>
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardHeader>

          {!isGenerating && suggestions.length > 0 && (
            <CardContent className="px-4 pb-4 pt-0">
              {stepStatus && <div className="mb-3"><ResultStatusBanner steps={stepStatus} /></div>}
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions.map((s, i) => (
                  <div
                    key={`${s.keyword}-${s.url}`}
                    onClick={() => toggleSuggestion(i)}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSuggestions.has(i)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:bg-muted/40"
                    }`}
                  >
                    <Checkbox checked={selectedSuggestions.has(i)} className="mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">{s.keyword}</Badge>
                        <span className="text-muted-foreground text-xs">→</span>
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate max-w-[240px] flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}>
                          {s.url.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      </div>
                      {s.reason && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.reason}</p>}
                    </div>
                    <button
                      className="shrink-0 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleRemoveSuggestion(i); }}
                      title="Remove suggestion"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Internal Links
          </h2>
          <p className="text-muted-foreground mt-1">
            Keyword → URL pairs automatically inserted into AI-generated content
          </p>
        </div>
        <Button onClick={handleAutoGenerate} disabled={isGenerating} className="gap-2 shrink-0">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? "Scanning…" : "Auto-generate with AI"}
        </Button>
      </div>

      {/* Info */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="flex items-start gap-3 p-4">
          <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Only links from your actual website</p>
            <p className="text-muted-foreground mt-0.5">
              We crawl your website directly to discover real pages, then map keywords to those URLs.
              No invented or external links — only URLs that actually exist on your site.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual add */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Manually
          </CardTitle>
          <CardDescription>
            When the keyword appears in generated content, it will be linked to the URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Keyword (e.g., invoicing software)"
                value={newLink.keyword}
                onChange={(e) => setNewLink((p) => ({ ...p, keyword: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="URL (e.g., https://example.com/features)"
                value={newLink.url}
                onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} disabled={isAdding || !newLink.keyword.trim() || !newLink.url.trim()}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Link Pairs
              <Badge variant="secondary">{links.length}</Badge>
            </CardTitle>
            {links.length > 5 && (
              <Input
                placeholder="Search keywords or URLs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm mb-4">
                {links.length === 0 ? "No link pairs yet" : "No matches found"}
              </p>
              {links.length === 0 && (
                <Button variant="outline" size="sm" className="gap-2" onClick={handleAutoGenerate} disabled={isGenerating}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-generate with AI
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {filtered.map((link, i) => (
                <div key={link.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs shrink-0 font-mono">{link.keyword}</Badge>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <a href={link.url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate flex items-center gap-1">
                          {link.url}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive ml-2 shrink-0"
                      onClick={() => handleDelete(link.id)} disabled={deletingId === link.id}>
                      {deletingId === link.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
