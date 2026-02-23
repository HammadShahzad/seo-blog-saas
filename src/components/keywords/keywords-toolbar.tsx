"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bot,
  FileUp,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { type Keyword } from "./types";

interface KeywordsToolbarProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowBulkDialog: () => void;
  suggestSeedKeyword: string;
  onSuggestSeedKeywordChange: (value: string) => void;
  isLoadingSuggestions: boolean;
  onGetSuggestions: () => void;
  pendingKeywords: Keyword[];
  onShowBulkGenDialog: () => void;
  onShowAddDialog: () => void;
  statusCounts: {
    pending: number;
    generating: number;
    completed: number;
    failed: number;
  };
  selected: Set<string>;
  keywords: Keyword[];
  onClearSelection: () => void;
  onBulkDelete: () => void;
  isBulkDeleting: boolean;
}

export function KeywordsToolbar({
  fileInputRef,
  onCSVUpload,
  onShowBulkDialog,
  suggestSeedKeyword,
  onSuggestSeedKeywordChange,
  isLoadingSuggestions,
  onGetSuggestions,
  pendingKeywords,
  onShowBulkGenDialog,
  onShowAddDialog,
  statusCounts,
  selected,
  keywords,
  onClearSelection,
  onBulkDelete,
  isBulkDeleting,
}: KeywordsToolbarProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Keywords</h2>
          <p className="text-muted-foreground">Manage your content generation queue</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={onCSVUpload} />

          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="mr-2 h-4 w-4" />
            Import CSV
          </Button>

          <Button variant="outline" size="sm" onClick={onShowBulkDialog}>
            <Upload className="mr-2 h-4 w-4" />
            Paste Keywords
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              placeholder="Topic (optional)…"
              value={suggestSeedKeyword}
              onChange={(e) => onSuggestSeedKeywordChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoadingSuggestions && onGetSuggestions()}
              className="h-8 w-40 text-sm"
            />
            <Button variant="outline" size="sm" onClick={onGetSuggestions} disabled={isLoadingSuggestions}>
              {isLoadingSuggestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              AI Suggest
            </Button>
          </div>

          {pendingKeywords.length > 0 && (
            <Button variant="outline" size="sm" onClick={onShowBulkGenDialog}
              className="border-primary text-primary hover:bg-primary/5">
              <Bot className="mr-2 h-4 w-4" />
              Bulk Generate
            </Button>
          )}

          <Button size="sm" onClick={onShowAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Keyword
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: statusCounts.pending, color: "text-yellow-600" },
          { label: "Generating", value: statusCounts.generating, color: "text-blue-600" },
          { label: "Completed", value: statusCounts.completed, color: "text-green-600" },
          { label: "Failed", value: statusCounts.failed, color: "text-red-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium">{selected.size} keyword{selected.size !== 1 ? "s" : ""} selected</p>
          <div className="flex gap-2">
            {keywords.filter(k => selected.has(k.id) && k.status === "PENDING").length > 0 && (
              <Button size="sm" onClick={onShowBulkGenDialog}>
                <Bot className="mr-2 h-3.5 w-3.5" />
                Generate ({keywords.filter(k => selected.has(k.id) && k.status === "PENDING").length})
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={onBulkDelete} disabled={isBulkDeleting}>
              {isBulkDeleting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-2 h-3.5 w-3.5" />}
              Delete ({selected.size})
            </Button>
            <Button size="sm" variant="outline" onClick={onClearSelection}>
              Deselect All
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
