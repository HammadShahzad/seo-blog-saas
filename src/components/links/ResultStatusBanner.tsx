"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import type { StepStatus } from "./types";

export function ResultStatusBanner({ steps }: { steps: StepStatus }) {
  const allGood = steps.crawl === "ok" && steps.ai === "ok";
  const aiOnly = steps.crawl !== "ok" && steps.ai === "ok";

  if (allGood) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-800">
            Found {steps.pagesFound} pages on your website
          </p>
          <p className="text-green-700 text-xs mt-0.5">
            Mapped them to keyword→URL pairs below
          </p>
        </div>
      </div>
    );
  }

  if (aiOnly) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">
            Couldn&apos;t crawl your website
          </p>
          <p className="text-amber-700 text-xs mt-0.5">
            Make sure your website URL is correct and publicly accessible, then try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm">
      <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-red-800">AI generation failed</p>
        <p className="text-red-700 text-xs mt-0.5">
          {steps.ai === "failed" ? (
            <>
              AI generation returned an error — this is usually temporary. Try again in a moment. If it keeps failing, verify your API keys are valid.
              {steps.error && <span className="block mt-1 bg-red-100 p-1.5 rounded text-red-800 font-mono text-[10px] break-all">{steps.error}</span>}
            </>
          ) : (
            "Both crawl and AI generation failed — check your website URL and API keys"
          )}
        </p>
      </div>
    </div>
  );
}
