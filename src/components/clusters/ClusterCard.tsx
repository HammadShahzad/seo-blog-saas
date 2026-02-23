"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Network,
  Plus,
  Trash2,
  Loader2,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TopicCluster } from "./types";
import { STATUS_COLORS } from "./types";

interface ClusterCardProps {
  cluster: TopicCluster;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  keywordSelection: Set<string> | undefined;
  onToggleKeyword: (kw: string) => void;
  onToggleAllKeywords: () => void;
  isAddingToQueue: boolean;
  onAddToQueue: () => void;
}

export function ClusterCard({
  cluster,
  isExpanded,
  onToggleExpand,
  onDelete,
  keywordSelection,
  onToggleKeyword,
  onToggleAllKeywords,
  isAddingToQueue,
  onAddToQueue,
}: ClusterCardProps) {
  const allKws = [cluster.pillarKeyword, ...cluster.supportingKeywords];
  const allSelected = keywordSelection && allKws.every((kw) => keywordSelection.has(kw));
  const selectedCount = keywordSelection && keywordSelection.size > 0
    ? keywordSelection.size
    : allKws.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <Network className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{cluster.name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-0.5">
                <KeyRound className="h-3 w-3" />
                Pillar:{" "}
                <span className="font-medium text-foreground">{cluster.pillarKeyword}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${STATUS_COLORS[cluster.status] || ""}`}>
              {cluster.status.charAt(0) + cluster.status.slice(1).toLowerCase()}
            </Badge>
            <Button variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"
              onClick={onToggleExpand}>
              {isExpanded
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-4">
          <div className="pl-12">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                Keywords ({allKws.length})
              </p>
              <button
                className="text-xs text-primary hover:underline"
                onClick={onToggleAllKeywords}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="space-y-1.5">
              {allKws.map((kw) => {
                const checked = keywordSelection?.has(kw) ?? false;
                return (
                  <label key={kw} className="flex items-center gap-2 cursor-pointer group">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => onToggleKeyword(kw)}
                      className="shrink-0"
                    />
                    <span className={`text-sm ${kw === cluster.pillarKeyword ? "font-medium" : ""}`}>
                      {kw}
                      {kw === cluster.pillarKeyword && (
                        <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4">pillar</Badge>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
              disabled={isAddingToQueue}
              onClick={onAddToQueue}
            >
              {isAddingToQueue
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Plus className="h-3.5 w-3.5" />}
              Add {selectedCount} to Keyword Queue
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
