"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, Sparkles, X } from "lucide-react";
import { type Suggestion, INTENT_COLORS } from "./types";

interface AISuggestionsPanelProps {
  isLoadingSuggestions: boolean;
  suggestions: Suggestion[];
  selectedSuggestions: Set<string>;
  setSelectedSuggestions: React.Dispatch<React.SetStateAction<Set<string>>>;
  isAddingSuggestions: boolean;
  suggestSteps: string[];
  onAddSuggestions: () => void;
  onCancelSuggestions: () => void;
  onDismiss: () => void;
  onRemoveSuggestion: (keyword: string) => void;
}

export function AISuggestionsPanel({
  isLoadingSuggestions,
  suggestions,
  selectedSuggestions,
  setSelectedSuggestions,
  isAddingSuggestions,
  suggestSteps,
  onAddSuggestions,
  onCancelSuggestions,
  onDismiss,
  onRemoveSuggestion,
}: AISuggestionsPanelProps) {
  if (!isLoadingSuggestions && suggestions.length === 0) return null;

  return (
    <Card className={isLoadingSuggestions ? "border-blue-200 bg-blue-50" : "border-primary/20 bg-primary/5"}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {isLoadingSuggestions ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="h-4 w-4 text-primary" />
            )}
            {isLoadingSuggestions
              ? "Generating keyword suggestions…"
              : `AI Suggestions — ${suggestions.length} keywords`}
          </CardTitle>
          {!isLoadingSuggestions && suggestions.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs h-7"
                onClick={() => {
                  if (selectedSuggestions.size === suggestions.length)
                    setSelectedSuggestions(new Set());
                  else
                    setSelectedSuggestions(new Set(suggestions.map(s => s.keyword)));
                }}>
                {selectedSuggestions.size === suggestions.length ? "Deselect All" : "Select All"}
              </Button>
              <Button size="sm" className="h-7 text-xs"
                disabled={isAddingSuggestions || selectedSuggestions.size === 0}
                onClick={onAddSuggestions}>
                {isAddingSuggestions
                  ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  : <Plus className="mr-1.5 h-3 w-3" />}
                Add {selectedSuggestions.size} to Queue
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground"
                title="Dismiss suggestions"
                onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {isLoadingSuggestions && (
          <>
            <Progress value={50} className="h-1 mt-2" />
            <div className="flex items-center gap-1 mt-1">
              {suggestSteps.map((s) => {
                const labels: Record<string, string> = { analyzing: "Analyzing", generating: "Generating", filtering: "Filtering" };
                return (
                  <span key={s} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-800">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    {labels[s]}
                  </span>
                );
              })}
              <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onCancelSuggestions}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardHeader>

      {!isLoadingSuggestions && suggestions.length > 0 && (
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <div
                key={s.keyword}
                onClick={() => setSelectedSuggestions(prev => {
                  const next = new Set(prev);
                  next.has(s.keyword) ? next.delete(s.keyword) : next.add(s.keyword);
                  return next;
                })}
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSuggestions.has(s.keyword)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-muted/40"
                }`}
              >
                <Checkbox checked={selectedSuggestions.has(s.keyword)} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-medium text-sm">{s.keyword}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${INTENT_COLORS[s.intent] || "bg-gray-50 text-gray-700"}`}>
                      {s.intent}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      s.difficulty === "low" ? "bg-green-50 text-green-700" :
                      s.difficulty === "medium" ? "bg-yellow-50 text-yellow-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.rationale}</p>
                </div>
                <button
                  className="shrink-0 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSuggestion(s.keyword);
                  }}
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
