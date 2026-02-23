import { CheckCircle2, AlertCircle } from "lucide-react";
import type { StepStatus } from "./types";

export function ResultStatusBanner({ steps }: { steps: StepStatus }) {
  if (steps.crawl === "ok" && steps.ai === "ok") {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-800">Research completed successfully</p>
          <p className="text-green-700 text-xs mt-0.5">
            Crawled your website and designed the clusters below
          </p>
        </div>
      </div>
    );
  }

  if (steps.crawl !== "ok" && steps.ai === "ok") {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">
            Couldn&apos;t crawl your website directly
          </p>
          <p className="text-amber-700 text-xs mt-0.5">
            Used your brand description instead — clusters may be less precise than usual
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
          AI generation returned an error — this is usually temporary. Try again in a moment.
          If it keeps failing, check that your API keys are valid in your environment.
          {steps.error && <span className="block mt-1 bg-red-100 p-1.5 rounded text-red-800 font-mono text-[10px] break-all">{steps.error}</span>}
        </p>
      </div>
    </div>
  );
}
