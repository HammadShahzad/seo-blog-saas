"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  Wand2,
  Sparkles,
  Image,
  Tags,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  currentStep: string | null;
  progress: number;
  error: string | null;
  keyword: string | null;
  createdAt: string;
  blogPostId: string | null;
}

const STEP_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  research: { label: "Research", icon: Search },
  outline: { label: "Outline", icon: Target },
  draft: { label: "Draft", icon: FileText },
  tone: { label: "Tone Rewrite", icon: Wand2 },
  seo: { label: "SEO Optimize", icon: Sparkles },
  metadata: { label: "Metadata", icon: Tags },
  image: { label: "Image", icon: Image },
};

const STEP_ORDER = ["research", "outline", "draft", "tone", "seo", "metadata", "image"];

interface Props {
  websiteId: string;
  initialJobCount: number;
}

export function ActiveJobsBanner({ websiteId, initialJobCount }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [hasJobs, setHasJobs] = useState(initialJobCount > 0);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/jobs`);
      if (!res.ok) return;
      const data: Job[] = await res.json();
      setJobs(data);
      setHasJobs(data.length > 0);

      // Stop polling when no active jobs
      if (data.length === 0 && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch {
      // silent
    }
  }, [websiteId]);

  useEffect(() => {
    if (!hasJobs) return;

    fetchJobs();
    pollRef.current = setInterval(fetchJobs, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchJobs, hasJobs]);

  if (!hasJobs && jobs.length === 0) return null;

  const activeJobs = jobs.filter(
    (j) => j.status === "QUEUED" || j.status === "PROCESSING"
  );

  if (activeJobs.length === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50 overflow-hidden">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
            <div>
              <p className="font-medium text-blue-900 text-sm">
                Content generation in progress
              </p>
              <p className="text-xs text-blue-700">
                {activeJobs.length} active job{activeJobs.length !== 1 ? "s" : ""}
                {activeJobs[0]?.keyword && ` · "${activeJobs[0].keyword}"`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-800 hover:bg-blue-100 text-xs"
            >
              <Link href={`/dashboard/websites/${websiteId}/generator`}>
                View Details
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="p-1 rounded hover:bg-blue-100 text-blue-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded job details */}
        {isExpanded && activeJobs.map((job) => {
          const currentStepIdx = STEP_ORDER.indexOf(job.currentStep || "");

          return (
            <div
              key={job.id}
              className="border-t border-blue-200 px-4 py-3 bg-white/60"
            >
              {/* Progress bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-900">
                  {job.keyword || "Generating…"}
                </span>
                <span className="text-xs text-blue-700 font-medium">
                  {job.progress}%
                </span>
              </div>
              <Progress value={job.progress} className="h-1.5 mb-3" />

              {/* Step pipeline */}
              <div className="flex items-center gap-1 flex-wrap">
                {STEP_ORDER.map((stepId, idx) => {
                  const config = STEP_CONFIG[stepId];
                  const Icon = config.icon;
                  const isDone =
                    job.status === "COMPLETED" || idx < currentStepIdx;
                  const isCurrent = job.currentStep === stepId;
                  const isPending = idx > currentStepIdx && !isDone;

                  return (
                    <div
                      key={stepId}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                        isDone
                          ? "bg-green-100 text-green-700"
                          : isCurrent
                            ? "bg-blue-100 text-blue-800 font-medium ring-1 ring-blue-300"
                            : isPending
                              ? "bg-muted/60 text-muted-foreground"
                              : "bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600" />
                      ) : isCurrent ? (
                        <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                      ) : (
                        <Icon className="h-3 w-3 shrink-0 opacity-50" />
                      )}
                      <span>{config.label}</span>
                    </div>
                  );
                })}

                {job.status === "FAILED" && (
                  <Badge
                    variant="destructive"
                    className="text-xs gap-1 ml-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>

              {job.error && (
                <p className="text-xs text-red-700 mt-2 p-2 bg-red-50 rounded">
                  {job.error}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
