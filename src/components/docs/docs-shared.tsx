import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function CodeBlock({ children, language = "bash" }: { children: ReactNode; language?: string }) {
  return (
    <div className="relative rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden my-4">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <span className="text-xs text-zinc-500 font-mono">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-zinc-200 font-mono leading-relaxed">{children}</code>
      </pre>
    </div>
  );
}

export function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="-mt-24 pt-24 block" />;
}

export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
        {n}
      </div>
      <div className="flex-1 pb-8 border-b border-border last:border-0">
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <div className="text-muted-foreground text-sm space-y-2">{children}</div>
      </div>
    </div>
  );
}

export function Note({ type = "info", children }: { type?: "info" | "warning"; children: ReactNode }) {
  const styles =
    type === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300"
      : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300";
  const Icon = type === "warning" ? AlertCircle : CheckCircle2;
  return (
    <div className={`flex gap-3 rounded-lg border p-4 text-sm my-4 ${styles}`}>
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
