"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Network,
  CheckCircle2,
  Loader2,
  XCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface ClusterData {
  id: string;
  name: string;
  pillarKeyword: string;
  status: string;
  totalPosts: number;
  publishedPosts: number;
  keywords: { id: string; keyword: string; status: string; blogPostId: string | null }[];
  stats: { pending: number; generating: number; done: number; failed: number; total: number };
}

interface ClusterCardProps {
  cluster: ClusterData;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}

export function ClusterCard({ cluster, expanded, onToggle, onDelete }: ClusterCardProps) {
  const { stats } = cluster;
  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const isActive = stats.generating > 0;

  return (
    <Card className={isActive ? "border-primary/30" : ""}>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-primary shrink-0" />
              <p className="font-semibold text-sm truncate">{cluster.name}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{cluster.pillarKeyword}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={progress === 100 ? "default" : "outline"} className="text-xs">
              {progress}%
            </Badge>
            <button
              onClick={() => onDelete(cluster.id)}
              className="text-muted-foreground/40 hover:text-red-500 transition-colors p-1"
              aria-label="Delete cluster"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <Progress value={progress} className="h-1.5" />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {stats.done > 0 && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              {stats.done} done
            </span>
          )}
          {stats.generating > 0 && (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              {stats.generating} active
            </span>
          )}
          {stats.pending > 0 && (
            <span>{stats.pending} pending</span>
          )}
          {stats.failed > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <XCircle className="h-3 w-3" />
              {stats.failed} failed
            </span>
          )}
          <span className="ml-auto">{stats.total} total</span>
        </div>

        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide" : "Show"} keywords
        </button>

        {expanded && (
          <div className="space-y-1 pt-1 border-t">
            {cluster.keywords.map(kw => (
              <div key={kw.id} className="flex items-center justify-between text-xs py-1">
                <span className="truncate mr-2">{kw.keyword}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 ${
                    kw.status === "COMPLETED" ? "border-green-300 text-green-700" :
                    kw.status === "FAILED" ? "border-red-300 text-red-700" :
                    ["RESEARCHING", "GENERATING"].includes(kw.status) ? "border-primary/30 text-primary" :
                    ""
                  }`}
                >
                  {kw.status === "COMPLETED" && kw.blogPostId ? "Published" : kw.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
