"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Network,
  Loader2,
  Search,
  X,
  Plus,
} from "lucide-react";

export interface ClusterKeyword {
  keyword: string;
  role: "pillar" | "supporting";
  searchIntent: "informational" | "transactional" | "commercial";
  suggestedWordCount: number;
  description: string;
}

export interface ClusterPreviewData {
  pillarTitle: string;
  description: string;
  keywords: ClusterKeyword[];
}

interface ClusterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seedTopic: string;
  onSeedTopicChange: (value: string) => void;
  isResearching: boolean;
  clusterPreview: ClusterPreviewData | null;
  selectedKeywords: Set<number>;
  isSavingCluster: boolean;
  onResearch: () => void;
  onCancelResearch: () => void;
  onToggleKeyword: (idx: number) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSave: () => void;
  onBack: () => void;
}

export function ClusterDialog({
  open,
  onOpenChange,
  seedTopic,
  onSeedTopicChange,
  isResearching,
  clusterPreview,
  selectedKeywords,
  isSavingCluster,
  onResearch,
  onCancelResearch,
  onToggleKeyword,
  onSelectAll,
  onSelectNone,
  onSave,
  onBack,
}: ClusterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            {clusterPreview ? "Review & Select Keywords" : "Create Topic Cluster"}
          </DialogTitle>
          <DialogDescription>
            {clusterPreview
              ? `Select the keywords you want to add to your generation queue from the "${clusterPreview.pillarTitle}" cluster.`
              : "Enter a seed topic and AI will research and generate a full content cluster with pillar + supporting keywords."
            }
          </DialogDescription>
        </DialogHeader>

        {!clusterPreview ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Seed Topic</Label>
              <Input
                placeholder='e.g. "Invoice Management for Small Businesses"'
                value={seedTopic}
                onChange={(e) => onSeedTopicChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onResearch()}
                disabled={isResearching}
              />
              <p className="text-xs text-muted-foreground">
                AI will research this topic using deep web analysis + direct website crawl, then generate a cluster of 12-16 optimized keywords.
              </p>
            </div>

            {isResearching && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium text-sm">Researching &quot;{seedTopic}&quot;</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Crawling your website, analyzing competitors, generating keywords...
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={onCancelResearch}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={onResearch}
              disabled={isResearching || !seedTopic.trim()}
            >
              {isResearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Research & Generate Cluster
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col min-h-0 flex-1 gap-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="font-semibold text-sm">{clusterPreview.pillarTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">{clusterPreview.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-xs">
                  {clusterPreview.keywords.length} keywords
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {clusterPreview.keywords.filter(k => k.role === "pillar").length} pillar
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {clusterPreview.keywords.filter(k => k.role === "supporting").length} supporting
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{selectedKeywords.size} of {clusterPreview.keywords.length} selected</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onSelectAll} className="text-xs h-7">Select All</Button>
                <Button variant="ghost" size="sm" onClick={onSelectNone} className="text-xs h-7">Deselect All</Button>
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-1 min-h-0" style={{ maxHeight: "40vh" }}>
              <div className="space-y-1.5 px-1">
                {clusterPreview.keywords.map((kw, idx) => {
                  const checked = selectedKeywords.has(idx);
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                      }`}
                      onClick={() => onToggleKeyword(idx)}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => onToggleKeyword(idx)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{kw.keyword}</span>
                          {kw.role === "pillar" && (
                            <Badge className="text-[10px] h-4 bg-primary/10 text-primary border-primary/20">Pillar</Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] h-4 capitalize">{kw.searchIntent}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{kw.description}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{kw.suggestedWordCount.toLocaleString()} words target</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onBack}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={onSave}
                disabled={isSavingCluster || selectedKeywords.size === 0}
              >
                {isSavingCluster ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {selectedKeywords.size} Keywords to Queue
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
