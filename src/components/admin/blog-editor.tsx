"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, Save, Send, ArrowLeft,
} from "lucide-react";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { BlogEditorSidebar } from "./blog-editor-sidebar";

export type PostFormData = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  featuredImage: string;
  featuredImageAlt: string;
  tags: string[];
  category: string;
  status: string;
};

export function BlogEditor({ postId, onBack }: { postId: string; onBack: () => void }) {
  const isNew = postId === "new";
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [tagInput, setTagInput] = useState("");
  const [currentId, setCurrentId] = useState(isNew ? null : postId);

  const [form, setForm] = useState<PostFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    secondaryKeywords: [],
    featuredImage: "",
    featuredImageAlt: "",
    tags: [],
    category: "",
    status: "DRAFT",
  });

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/blog/${postId}`)
        .then(r => r.json())
        .then(data => {
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            content: data.content || "",
            excerpt: data.excerpt || "",
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            focusKeyword: data.focusKeyword || "",
            secondaryKeywords: data.secondaryKeywords || [],
            featuredImage: data.featuredImage || "",
            featuredImageAlt: data.featuredImageAlt || "",
            tags: data.tags || [],
            category: data.category || "",
            status: data.status || "DRAFT",
          });
          setAutoSlug(false);
        })
        .catch(() => toast.error("Failed to load post"))
        .finally(() => setIsLoading(false));
    }
  }, [postId, isNew]);

  const updateField = (field: keyof PostFormData, value: unknown) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "title" && autoSlug) {
        next.slug = (value as string)
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 80);
      }
      return next;
    });
  };

  const wordCount = form.content ? form.content.split(/\s+/).filter(Boolean).length : 0;

  const handleSave = async (statusOverride?: string) => {
    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...form, wordCount };
      if (statusOverride) payload.status = statusOverride;

      const isCreating = isNew && !currentId;
      const url = isCreating ? "/api/admin/blog" : `/api/admin/blog/${currentId}`;
      const method = isCreating ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isCreating) setCurrentId(saved.id);
        setForm(prev => ({ ...prev, status: saved.status }));
        toast.success(statusOverride === "PUBLISHED" ? "Post published!" : "Post saved");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      updateField("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">
              {isNew && !currentId ? "New Blog Post" : "Edit Blog Post"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={
                form.status === "PUBLISHED" ? "default" :
                form.status === "REVIEW" ? "outline" : "secondary"
              }>
                {form.status.toLowerCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {wordCount} words
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave()} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave("PUBLISHED")} disabled={isSaving}>
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Input
            placeholder="Post title..."
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="text-2xl font-bold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0">URL slug:</span>
            <Input
              value={form.slug}
              onChange={(e) => { setAutoSlug(false); updateField("slug", e.target.value); }}
              className="h-7 text-sm"
            />
          </div>

          <MarkdownEditor
            value={form.content}
            onChange={(v) => updateField("content", v)}
            height={500}
          />
        </div>

        <div className="space-y-4">
          <BlogEditorSidebar
            form={form}
            updateField={updateField}
            wordCount={wordCount}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAddTag={addTag}
          />
        </div>
      </div>
    </div>
  );
}
