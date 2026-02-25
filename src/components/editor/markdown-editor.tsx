"use client";

import dynamic from "next/dynamic";
import rehypeSanitize from "rehype-sanitize";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

export function MarkdownEditor({ value, onChange, height = 500 }: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v || "")}
        height={height}
        preview="live"
        style={{ borderRadius: "0.5rem" }}
        previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
      />
    </div>
  );
}
