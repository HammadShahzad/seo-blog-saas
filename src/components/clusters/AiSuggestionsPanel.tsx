"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles,
  Plus,
  Loader2,
  KeyRound,
  CheckCheck,
  X,
} from "lucide-react";
import { ResultStatusBanner } from "./ResultStatusBanner";
import type { SuggestedCluster, StepStatus } from "./types";

interface AiSuggestionsPanelProps {
  isGenerating: boolean;
  suggestions: SuggestedCluster[];
  stepStatus: StepStatus | null;
  selectedSuggestions: Set<number>;
  isSaving: boolean;
  clusterSteps: string[];
  onSaveSuggestions: () => void;
  onToggleSuggestion: (idx: number) => void;
  onSelectAll: () => void;
  onDismiss: () => void;
  onCancelGenerate: () => void;
  onRemoveSuggestion: (idx: number) => void;
}

export function AiSuggestionsPanel({
  isGenerating,
  suggestions,
  stepStatus,
  selectedSuggestions,
  isSaving,
  clusterSteps,
  onSaveSuggestions,
  onToggleSuggestion,
  onSelectAll,
  onDismiss,
  onCancelGenerate,
  onRemoveSuggestion,
}: AiSuggestionsPanelProps) {
  if (!isGenerating && suggestions.length === 0 && !stepStatus) {
    return null;
  }

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
              ? "Generating topic clusters…"
              : suggestions.length > 0
                ? `AI Suggestions — ${suggestions.length} clusters`
                : "Generation complete"}
          </CardTitle>
          {!isGenerating && (
            <div className="flex items-center gap-2">
              {suggestions.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5"
                    onClick={onSelectAll}>
                    <CheckCheck className="h-3.5 w-3.5" /> Select All
                  </Button>
                  <Button size="sm" className="h-7 text-xs"
                    disabled={isSaving || selectedSuggestions.size === 0}
                    onClick={onSaveSuggestions}>
                    {isSaving
                      ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      : <Plus className="mr-1.5 h-3 w-3" />}
                    Save {selectedSuggestions.size} cluster{selectedSuggestions.size !== 1 ? "s" : ""}
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground"
                title="Dismiss"
                onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {isGenerating && (
          <>
            <Progress value={50} className="h-1 mt-2" />
            <div className="flex items-center gap-1 mt-1">
              {clusterSteps.map((s) => {
                const labels: Record<string, string> = { crawling: "Crawling", analyzing: "Analyzing", generating: "Generating", saving: "Saving" };
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

      {!isGenerating && (
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {stepStatus && <ResultStatusBanner steps={stepStatus} />}

          {suggestions.length > 0 && (
            <div className="space-y-2 mt-1">
              {suggestions.map((s, i) => (
                <div key={i}
                  className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedSuggestions.has(i)
                      ? "bg-primary/5 border-primary/20"
                      : "border-border bg-background hover:bg-muted/30"
                  }`}
                  onClick={() => onToggleSuggestion(i)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedSuggestions.has(i)}
                      onCheckedChange={() => onToggleSuggestion(i)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{s.name}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          <KeyRound className="h-2.5 w-2.5 mr-1" />
                          {s.pillarKeyword}
                        </Badge>
                      </div>
                      {s.rationale && (
                        <p className="text-xs text-muted-foreground mb-2">{s.rationale}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {s.supportingKeywords.slice(0, 6).map((kw) => (
                          <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                        ))}
                        {s.supportingKeywords.length > 6 && (
                          <Badge variant="secondary" className="text-xs">+{s.supportingKeywords.length - 6} more</Badge>
                        )}
                      </div>
                    </div>
                    <button
                      className="shrink-0 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSuggestion(i);
                      }}
                      title="Remove suggestion"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
