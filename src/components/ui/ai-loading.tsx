"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiLoadingProps {
  steps: string[];
  /** ms each step stays before advancing (default 2800) */
  stepDuration?: number;
  className?: string;
  /** Show as a full-area overlay inside its parent container */
  overlay?: boolean;
}

/**
 * Animated AI loading state with sequential step messages.
 * Steps cycle through while the parent is loading.
 */
export function AiLoading({
  steps,
  stepDuration = 2800,
  className,
  overlay = false,
}: AiLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setCurrentStep(0);
  }, [steps]);

  useEffect(() => {
    const advance = () => {
      setVisible(false);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
        setVisible(true);
      }, 300);
    };

    const timer = setInterval(advance, stepDuration);
    return () => clearInterval(timer);
  }, [steps, stepDuration]);

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-10 px-6 text-center",
        overlay &&
          "absolute inset-0 z-10 bg-background/80 backdrop-blur-sm rounded-xl",
        className
      )}
    >
      {/* Animated orb */}
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-14 w-14 rounded-full bg-primary/20 animate-ping" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </span>
      </div>

      {/* Step message */}
      <div className="space-y-1 min-h-[3rem]">
        <p
          className={cn(
            "text-sm font-medium text-foreground transition-all duration-300",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          )}
        >
          {steps[currentStep]}
        </p>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "inline-block rounded-full transition-all duration-300",
                i === currentStep
                  ? "w-4 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground max-w-xs">
        This may take 15–30 seconds while AI researches your website
      </p>
    </div>
  );

  return overlay ? <div className="relative">{content}</div> : content;
}

// ─── Preset step sequences for each feature ────────────────────────────────

export const AI_STEPS = {
  analyze: [
    "Fetching your website…",
    "Reading brand & content details…",
    "Analyzing with Perplexity AI…",
    "Understanding your niche & audience…",
    "Finalizing brand profile…",
  ],

  clusters: [
    "Visiting your website with Perplexity…",
    "Identifying your core topics & services…",
    "Mapping competitor content gaps…",
    "Designing pillar → supporting structure…",
    "Generating SEO-optimized clusters…",
    "Almost there…",
  ],

  internalLinks: [
    "Crawling your website pages…",
    "Discovering product & feature pages…",
    "Identifying high-value link opportunities…",
    "Mapping keywords to URLs…",
    "Finalizing link pairs…",
  ],

  keywordSuggest: [
    "Analyzing your niche & audience…",
    "Researching search trends…",
    "Finding high-value long-tail keywords…",
    "Filtering by relevance & volume…",
    "Almost done…",
  ],

  generatePost: [
    "Researching the topic…",
    "Scanning top-ranking content…",
    "Building content outline…",
    "Writing first draft…",
    "Optimizing for SEO…",
    "Polishing tone & style…",
    "Adding metadata…",
  ],
} as const;
