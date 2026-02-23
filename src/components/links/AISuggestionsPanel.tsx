"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Loader2,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";
import type { SuggestedLink, StepStatus } from "./types";
import { ResultStatusBanner } from "./ResultStatusBanner";

interface AISuggestionsPanelProps {
  isGenerating: boolean;
  suggestions: SuggestedLink[];
  stepStatus: StepStatus | null;
  selectedSuggestions: Set<number>;
  isSavingSuggestions: boolean;
  generateSteps: string[];
  onToggleSuggestion: (idx: number) => void;
  onSetSelectedSuggestions: React.Dispatch<React.SetStateAction<Set<number>>>;
  onSaveSuggestions: () => void;
  onDismissSuggestions: () => void;
  onCancelGenerate: () => void;
  onRemoveSuggestion: (idx: number) => void;
}

export function AISuggestionsPanel({
  isGenerating,
  suggestions,
  stepStatus,
  selectedSuggestions,
  isSavingSuggestions,
  generateSteps,
  onToggleSuggestion,
  onSetSelectedSuggestions,
  onSaveSuggestions,
  onDismissSuggestions,
  onCancelGenerate,
  onRemoveSuggestion,
}: AISuggestionsPanelProps) {
  if (!isGenerating && suggestions.length === 0) return null;

  return (
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
                    onSetSelectedSuggestions(new Set());
                  else
                    onSetSelectedSuggestions(new Set(suggestions.map((_, i) => i)));
                }}>
                {selectedSuggestions.size === suggestions.length ? "Deselect All" : "Select All"}
              </Button>
              <Button size="sm" className="h-7 text-xs"
                disabled={isSavingSuggestions || selectedSuggestions.size === 0}
                onClick={onSaveSuggestions}>
                {isSavingSuggestions
                  ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  : <Plus className="mr-1.5 h-3 w-3" />}
                Save {selectedSuggestions.size} to Links
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground"
                title="Dismiss suggestions"
                onClick={onDismissSuggestions}>
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
                onClick={onCancelGenerate}>
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
                onClick={() => onToggleSuggestion(i)}
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
                  onClick={(e) => { e.stopPropagation(); onRemoveSuggestion(i); }}
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
  );
}
