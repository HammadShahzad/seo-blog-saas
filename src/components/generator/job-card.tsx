"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Search,
  Target,
  FileText,
  Wand2,
  Sparkles,
  Tags,
  Image,
} from "lucide-react";
import Link from "next/link";

interface PipelineStep {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: "research",  name: "Research",      icon: Search,    description: "Analyzing competitors & content gaps" },
  { id: "outline",   name: "Outline",       icon: Target,    description: "Structuring content & headings" },
  { id: "draft",     name: "Draft",         icon: FileText,  description: "Writing the full article" },
  { id: "tone",      name: "Tone Rewrite",  icon: Wand2,     description: "Adjusting brand voice & style" },
  { id: "seo",       name: "SEO Optimize",  icon: Sparkles,  description: "Keywords, links & structure" },
  { id: "metadata",  name: "Metadata",      icon: Tags,      description: "Meta tags, schema & captions" },
  { id: "image",     name: "Image",         icon: Image,     description: "Generating featured image" },
];

export interface JobStatus {
  id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  currentStep: string | null;
  progress: number;
  error: string | null;
  input?: { keyword?: string } | null;
  blogPost?: { id: string; title: string; slug: string; websiteId: string } | null;
}

interface JobCardProps {
  job: JobStatus;
  websiteId: string;
  onRetry?: (jobId: string) => void;
  onDismiss?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

export function JobCard({ job, websiteId, onRetry, onDismiss, onCancel }: JobCardProps) {
  const isRunning = job.status === "QUEUED" || job.status === "PROCESSING";
  const isCompleted = job.status === "COMPLETED";
  const isFailed = job.status === "FAILED";
  const keyword = (job.input as { keyword?: string })?.keyword || "Unknown keyword";

  return (
    <Card className={
      isCompleted ? "border-green-200 bg-green-50/50" :
      isFailed ? "border-red-200 bg-red-50/50" :
      "border-primary/20 bg-primary/5"
    }>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {isRunning && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
            {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
            {isFailed && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
            <span className="text-sm font-medium truncate">{keyword}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-sm font-medium tabular-nums">{job.progress}%</span>
            {isRunning && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[11px] px-2 border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => onCancel?.(job.id)}
              >
                Cancel
              </Button>
            )}
            {!isRunning && (
              <button
                onClick={() => onDismiss?.(job.id)}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                aria-label="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <Progress value={job.progress} className="h-1.5" />

        <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
          {PIPELINE_STEPS.map((step) => {
            const stepIdx = PIPELINE_STEPS.findIndex(s => s.id === step.id);
            const currentIdx = PIPELINE_STEPS.findIndex(s => s.id === job.currentStep);
            const isDone = isCompleted || (currentIdx > stepIdx);
            const isCurrent = job.currentStep === step.id;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-1 text-[11px] ${
                  isDone ? "text-green-700" :
                  isCurrent ? "text-primary font-medium" :
                  "text-muted-foreground/60"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600" />
                ) : isCurrent ? (
                  <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />
                )}
                <span className="hidden sm:inline">{step.name}</span>
              </div>
            );
          })}
        </div>

        {isFailed && (
          <div className="space-y-2">
            <p className="text-xs text-red-700 bg-red-100 px-2 py-1.5 rounded">
              {job.error || "Generation failed"}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => onRetry?.(job.id)}
              >
                <RefreshCw className="mr-1.5 h-3 w-3" />
                Retry
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs text-muted-foreground"
                onClick={() => onDismiss?.(job.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {isCompleted && job.blogPost && (
          <div className="flex items-center justify-between gap-2 p-2 bg-green-100 rounded">
            <p className="text-xs font-medium text-green-900 truncate">
              {job.blogPost.title}
            </p>
            <Button asChild size="sm" variant="outline" className="border-green-300 h-7 text-xs shrink-0">
              <Link href={`/dashboard/websites/${websiteId}/posts/${job.blogPost.id}`}>
                Edit <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
