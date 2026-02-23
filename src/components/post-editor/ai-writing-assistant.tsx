"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Wand2,
  ChevronUp,
  ChevronDown,
  ClipboardPaste,
} from "lucide-react";
import { toast } from "sonner";

type AIAction = "rewrite" | "expand" | "shorten" | "improve" | "custom";

interface AIWritingAssistantProps {
  websiteId: string;
  content: string;
  onUpdateContent: (content: string) => void;
}

export function AIWritingAssistant({ websiteId, content, onUpdateContent }: AIWritingAssistantProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [text, setText] = useState("");
  const [action, setAction] = useState<AIAction>("improve");
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);

  const handleRewrite = async () => {
    if (!text.trim()) { toast.error("Paste the text you want to rewrite"); return; }
    setIsRewriting(true);
    setResult("");
    try {
      const res = await fetch(`/api/websites/${websiteId}/ai-rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, action, customPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rewrite failed");
      setResult(data.result);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Rewrite failed");
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => { setShowPanel((p) => !p); setResult(""); }}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 text-sm font-medium text-purple-800 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-purple-600" />
          AI Writing Assistant
          <span className="text-xs font-normal text-purple-500">— rewrite, expand, shorten any section</span>
        </span>
        {showPanel ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>
      {showPanel && (
        <div className="p-4 space-y-3 bg-white border-t">
          <Textarea
            placeholder="Paste the section you want to transform…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="text-sm font-mono"
          />
          <div className="flex flex-wrap items-center gap-2">
            {(["improve", "rewrite", "expand", "shorten", "custom"] as const).map((a) => (
              <button key={a} type="button" onClick={() => setAction(a)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  action === a
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-purple-700 border-purple-300 hover:border-purple-600"
                }`}>
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
            <Button size="sm" onClick={handleRewrite} disabled={isRewriting || !text.trim()}
              className="ml-auto bg-purple-600 hover:bg-purple-700 text-white">
              {isRewriting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Wand2 className="mr-1.5 h-3.5 w-3.5" />}
              {isRewriting ? "Working…" : "Apply"}
            </Button>
          </div>
          {action === "custom" && (
            <input type="text" placeholder="Describe what you want to do…"
              value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          )}
          {result && (
            <div className="space-y-2">
              <div className="border rounded-md p-3 bg-gray-50 text-sm font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                {result}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"
                  className="text-xs border-purple-400 text-purple-700 hover:bg-purple-50"
                  onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied!"); }}>
                  <ClipboardPaste className="mr-1 h-3 w-3" />
                  Copy
                </Button>
                <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    if (text && content?.includes(text)) {
                      onUpdateContent(content.replace(text, result));
                      toast.success("Section replaced");
                    } else {
                      onUpdateContent((content || "") + "\n\n" + result);
                      toast.success("Appended to content");
                    }
                    setText(result);
                    setResult("");
                  }}>
                  Replace in Editor
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
