"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Network,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface TopicCluster {
  id: string;
  name: string;
  pillarKeyword: string;
  supportingKeywords: string[];
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
};

export default function ClustersPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const [clusters, setClusters] = useState<TopicCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCluster, setNewCluster] = useState({
    name: "",
    pillarKeyword: "",
    supportingKeywords: "",
  });

  const fetchClusters = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/clusters`);
      if (res.ok) setClusters(await res.json());
    } catch {
      toast.error("Failed to load clusters");
    } finally {
      setIsLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate: true }),
      });

      if (res.ok) {
        toast.success("5 topic clusters generated with AI");
        fetchClusters();
      } else {
        const data = await res.json();
        toast.error(data.error || "Generation failed");
      }
    } catch {
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManual = async () => {
    if (!newCluster.name || !newCluster.pillarKeyword) return;
    setIsAdding(true);
    try {
      const keywords = newCluster.supportingKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await fetch(`/api/websites/${websiteId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCluster.name,
          pillarKeyword: newCluster.pillarKeyword,
          supportingKeywords: keywords,
        }),
      });

      if (res.ok) {
        toast.success("Cluster added");
        setShowAddDialog(false);
        setNewCluster({ name: "", pillarKeyword: "", supportingKeywords: "" });
        fetchClusters();
      } else {
        toast.error("Failed to add cluster");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (clusterId: string) => {
    try {
      const res = await fetch(
        `/api/websites/${websiteId}/clusters?id=${clusterId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Cluster deleted");
        setClusters((prev) => prev.filter((c) => c.id !== clusterId));
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Topic Clusters
          </h2>
          <p className="text-muted-foreground mt-1">
            Organize content around pillar topics to dominate search rankings
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Topic Cluster</DialogTitle>
                <DialogDescription>
                  Define a pillar topic and its supporting keywords
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Cluster Name</Label>
                  <Input
                    placeholder="e.g., Invoicing & Billing"
                    value={newCluster.name}
                    onChange={(e) =>
                      setNewCluster((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pillar Keyword</Label>
                  <Input
                    placeholder="e.g., invoicing software"
                    value={newCluster.pillarKeyword}
                    onChange={(e) =>
                      setNewCluster((p) => ({
                        ...p,
                        pillarKeyword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supporting Keywords</Label>
                  <Input
                    placeholder="keyword1, keyword2, keyword3"
                    value={newCluster.supportingKeywords}
                    onChange={(e) =>
                      setNewCluster((p) => ({
                        ...p,
                        supportingKeywords: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of related long-tail keywords
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddManual}
                    disabled={
                      isAdding ||
                      !newCluster.name ||
                      !newCluster.pillarKeyword
                    }
                  >
                    {isAdding && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Cluster
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleAIGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? "Generating…" : "Generate with AI"}
          </Button>
        </div>
      </div>

      {/* Info card */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="flex items-start gap-3 p-4">
          <Network className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">What are topic clusters?</p>
            <p className="text-muted-foreground mt-0.5">
              A pillar page covers a broad topic, while supporting pages cover
              related subtopics. Internal linking between them tells Google your
              site is an authority on the subject — boosting rankings for all
              pages in the cluster.
            </p>
          </div>
        </CardContent>
      </Card>

      {clusters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Network className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No topic clusters yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Let AI generate 5 topic clusters based on your niche, or add
              them manually.
            </p>
            <Button onClick={handleAIGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate with AI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clusters.map((cluster) => (
            <Card key={cluster.id} className="overflow-hidden">
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
                        Pillar: <span className="font-medium text-foreground">{cluster.pillarKeyword}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_COLORS[cluster.status] || ""}`}
                    >
                      {cluster.status.charAt(0) +
                        cluster.status.slice(1).toLowerCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(cluster.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setExpandedId(
                          expandedId === cluster.id ? null : cluster.id
                        )
                      }
                    >
                      {expandedId === cluster.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedId === cluster.id && (
                <CardContent className="pt-0 pb-4">
                  <div className="pl-12">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Supporting Keywords ({cluster.supportingKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cluster.supportingKeywords.map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {clusters.length > 0 && (
        <div className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            {clusters.length} cluster{clusters.length !== 1 ? "s" : ""} ·{" "}
            {clusters.reduce(
              (acc, c) => acc + c.supportingKeywords.length,
              0
            )}{" "}
            supporting keywords total
          </p>
        </div>
      )}
    </div>
  );
}
