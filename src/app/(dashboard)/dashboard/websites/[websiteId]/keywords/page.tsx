"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGlobalJobs } from "@/components/dashboard/global-jobs-context";
import { type Keyword, type Suggestion } from "@/components/keywords/types";
import { AISuggestionsPanel } from "@/components/keywords/ai-suggestions-panel";
import { KeywordsToolbar } from "@/components/keywords/keywords-toolbar";
import { KeywordsTable } from "@/components/keywords/keywords-table";
import { KeywordDialogs } from "@/components/keywords/keyword-dialogs";

export default function KeywordsPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.websiteId as string;
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showBulkGenDialog, setShowBulkGenDialog] = useState(false);

  const [newKeyword, setNewKeyword] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [bulkText, setBulkText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isAddingSuggestions, setIsAddingSuggestions] = useState(false);
  const [suggestSeedKeyword, setSuggestSeedKeyword] = useState("");

  const { addJob, updateJob, removeJob, getJob, registerCancel, unregisterCancel } = useGlobalJobs();
  const suggestJobId = `kw-suggest-${websiteId}`;
  const suggestAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const restore = () => {
      const job = getJob(suggestJobId);
      if (job?.status === "done" && job.resultData?.suggestions?.length) {
        setSuggestions(job.resultData.suggestions);
        setSelectedSuggestions(new Set(job.resultData.suggestions.map((s: Suggestion) => s.keyword)));
      }
    };
    restore();
    const t = setTimeout(restore, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkCount, setBulkCount] = useState(3);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords`);
      if (res.ok) setKeywords(await res.json());
    } catch {
      toast.error("Failed to load keywords");
    } finally {
      setIsLoading(false);
    }
  }, [websiteId]);

  useEffect(() => { fetchKeywords(); }, [fetchKeywords]);

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword, notes: newNotes }),
      });
      if (res.ok) {
        toast.success("Keyword added");
        setNewKeyword(""); setNewNotes(""); setShowAddDialog(false);
        fetchKeywords();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to add keyword");
      }
    } catch { toast.error("Failed to add keyword"); }
    finally { setIsAdding(false); }
  };

  const handleBulkImport = async (keywordList: string[]) => {
    const clean = keywordList.map(k => k.trim()).filter(Boolean);
    if (!clean.length) return;
    setIsImporting(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: clean }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Imported ${data.imported} keywords${data.skipped ? ` (${data.skipped} skipped — already exist)` : ""}`);
        setBulkText(""); setShowBulkDialog(false);
        fetchKeywords();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch { toast.error("Import failed"); }
    finally { setIsImporting(false); }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/[\r\n,]+/).map(l => l.trim()).filter(Boolean);
      const kws = lines.filter(l => !["keyword", "keywords", "term", "query"].includes(l.toLowerCase()));
      handleBulkImport(kws);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const suggestSteps = ["analyzing", "generating", "filtering"];

  const handleGetSuggestions = async () => {
    suggestAbortRef.current?.abort();
    const controller = new AbortController();
    suggestAbortRef.current = controller;

    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    registerCancel(suggestJobId, () => controller.abort());

    const label = suggestSeedKeyword.trim()
      ? `Keywords: "${suggestSeedKeyword.trim()}"`
      : "AI Keyword Suggestions";

    addJob({
      id: suggestJobId,
      type: "keywords",
      label,
      websiteId,
      href: `/dashboard/websites/${websiteId}/keywords`,
      status: "running",
      progress: 10,
      currentStep: "analyzing",
      steps: suggestSteps,
    });

    try {
      updateJob(suggestJobId, { progress: 30, currentStep: "generating" });
      const res = await fetch(`/api/websites/${websiteId}/keywords/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedKeyword: suggestSeedKeyword.trim() || undefined,
        }),
        signal: controller.signal,
      });
      updateJob(suggestJobId, { progress: 80, currentStep: "filtering" });
      const data = await res.json();
      if (res.ok) {
        const fetched: Suggestion[] = data.suggestions || [];
        setSuggestions(fetched);
        setSelectedSuggestions(new Set(fetched.map((s) => s.keyword)));
        updateJob(suggestJobId, {
          status: "done",
          progress: 100,
          resultData: { suggestions: fetched },
        });
      } else {
        toast.error(data.error || "Failed to generate suggestions");
        updateJob(suggestJobId, { status: "failed", error: data.error || "Generation failed" });
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        toast.info("Keyword suggestion cancelled");
        removeJob(suggestJobId);
        return;
      }
      toast.error("Failed to generate suggestions");
      updateJob(suggestJobId, { status: "failed", error: "Network error" });
    } finally {
      suggestAbortRef.current = null;
      setIsLoadingSuggestions(false);
      unregisterCancel(suggestJobId);
    }
  };

  const handleCancelSuggestions = () => {
    suggestAbortRef.current?.abort();
  };

  const handleAddSuggestions = async () => {
    const toAdd = suggestions.filter(s => selectedSuggestions.has(s.keyword)).map(s => s.keyword);
    if (!toAdd.length) return;
    setIsAddingSuggestions(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: toAdd }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Added ${data.imported} keywords to queue`);
        setSuggestions([]);
        setSelectedSuggestions(new Set());
        removeJob(suggestJobId);
        fetchKeywords();
      }
    } catch { toast.error("Failed to add keywords"); }
    finally { setIsAddingSuggestions(false); }
  };

  const handleDismissSuggestions = () => {
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    removeJob(suggestJobId);
  };

  const handleRemoveSuggestion = (keyword: string) => {
    const remaining = suggestions.filter(x => x.keyword !== keyword);
    setSuggestions(remaining);
    setSelectedSuggestions(prev => { const n = new Set(prev); n.delete(keyword); return n; });
    if (remaining.length === 0) { removeJob(suggestJobId); }
    else { updateJob(suggestJobId, { resultData: { suggestions: remaining } }); }
  };

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true);
    try {
      const keywordIds = selected.size > 0 ? Array.from(selected) : undefined;
      const res = await fetch(`/api/websites/${websiteId}/generate/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordIds, count: bulkCount }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowBulkGenDialog(false);
        setSelected(new Set());
        router.push(`/dashboard/websites/${websiteId}`);
      } else {
        toast.error(data.error || "Bulk generation failed");
      }
    } catch { toast.error("Failed to start bulk generation"); }
    finally { setIsBulkGenerating(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Keyword deleted");
        fetchKeywords();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to delete keyword");
      }
    } catch { toast.error("Failed to delete"); }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} keyword${selected.size !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    setIsBulkDeleting(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Deleted ${data.deleted} keyword${data.deleted !== 1 ? "s" : ""}`);
        setSelected(new Set());
        fetchKeywords();
      } else {
        toast.error(data.error || "Bulk delete failed");
      }
    } catch { toast.error("Bulk delete failed"); }
    finally { setIsBulkDeleting(false); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const pendingKeywords = keywords.filter(k => k.status === "PENDING");
  const statusCounts = {
    pending: keywords.filter(k => k.status === "PENDING").length,
    generating: keywords.filter(k => ["RESEARCHING","GENERATING"].includes(k.status)).length,
    completed: keywords.filter(k => k.status === "COMPLETED").length,
    failed: keywords.filter(k => k.status === "FAILED").length,
  };

  return (
    <div className="space-y-6">
      <AISuggestionsPanel
        isLoadingSuggestions={isLoadingSuggestions}
        suggestions={suggestions}
        selectedSuggestions={selectedSuggestions}
        setSelectedSuggestions={setSelectedSuggestions}
        isAddingSuggestions={isAddingSuggestions}
        suggestSteps={suggestSteps}
        onAddSuggestions={handleAddSuggestions}
        onCancelSuggestions={handleCancelSuggestions}
        onDismiss={handleDismissSuggestions}
        onRemoveSuggestion={handleRemoveSuggestion}
      />

      <KeywordsToolbar
        fileInputRef={fileInputRef}
        onCSVUpload={handleCSVUpload}
        onShowBulkDialog={() => setShowBulkDialog(true)}
        suggestSeedKeyword={suggestSeedKeyword}
        onSuggestSeedKeywordChange={setSuggestSeedKeyword}
        isLoadingSuggestions={isLoadingSuggestions}
        onGetSuggestions={handleGetSuggestions}
        pendingKeywords={pendingKeywords}
        onShowBulkGenDialog={() => setShowBulkGenDialog(true)}
        onShowAddDialog={() => setShowAddDialog(true)}
        statusCounts={statusCounts}
        selected={selected}
        keywords={keywords}
        onClearSelection={() => setSelected(new Set())}
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
      />

      <KeywordsTable
        isLoading={isLoading}
        keywords={keywords}
        selected={selected}
        setSelected={setSelected}
        onToggleSelect={toggleSelect}
        onDelete={handleDelete}
        onGetSuggestions={handleGetSuggestions}
        onShowAddDialog={() => setShowAddDialog(true)}
        websiteId={websiteId}
      />

      <KeywordDialogs
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        newKeyword={newKeyword}
        setNewKeyword={setNewKeyword}
        newNotes={newNotes}
        setNewNotes={setNewNotes}
        onAdd={handleAdd}
        isAdding={isAdding}
        showBulkDialog={showBulkDialog}
        setShowBulkDialog={setShowBulkDialog}
        bulkText={bulkText}
        setBulkText={setBulkText}
        onBulkImport={handleBulkImport}
        isImporting={isImporting}
        showBulkGenDialog={showBulkGenDialog}
        setShowBulkGenDialog={setShowBulkGenDialog}
        selectedCount={selected.size}
        bulkCount={bulkCount}
        setBulkCount={setBulkCount}
        pendingKeywords={pendingKeywords}
        onBulkGenerate={handleBulkGenerate}
        isBulkGenerating={isBulkGenerating}
      />
    </div>
  );
}
