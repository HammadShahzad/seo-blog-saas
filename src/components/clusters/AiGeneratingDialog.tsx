"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Sparkles } from "lucide-react";

const STEPS = [
  { icon: Globe,    label: "Crawling your website…",       detail: "Fetching pages and sitemap directly" },
  { icon: Globe,    label: "Identifying core topics…",     detail: "Analyzing what your business offers" },
  { icon: Globe,    label: "Mapping content themes…",      detail: "Finding what your customers search for" },
  { icon: Sparkles, label: "Designing cluster structure…", detail: "AI is grouping topics into pillars" },
  { icon: Sparkles, label: "Writing supporting keywords…", detail: "Generating long-tail keyword variations" },
  { icon: Sparkles, label: "Almost done…",                 detail: "Finalizing your topic clusters" },
];

export function AiGeneratingDialog({ open }: { open: boolean }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!open) { setStepIdx(0); return; }
    const t = setInterval(() => setStepIdx((i) => (i + 1) % STEPS.length), 3200);
    return () => clearInterval(t);
  }, [open]);

  const current = STEPS[stepIdx];
  const Icon = current.icon;

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-sm text-center"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-4 pt-2">
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/20 animate-ping" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/30">
                <Icon className="h-6 w-6 text-primary animate-pulse" />
              </span>
            </div>
            <span className="text-base font-semibold">{current.label}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {current.detail}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`inline-block rounded-full transition-all duration-500 ${
                i === stepIdx
                  ? "w-5 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground pb-2">
          This usually takes 15–30 seconds
        </p>
      </DialogContent>
    </Dialog>
  );
}
