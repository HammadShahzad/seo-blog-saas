"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  FileText,
  BarChart3,
  Tags,
} from "lucide-react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { type Post, STATUS_CONFIG } from "@/components/post-editor/types";
import { EditorHeader } from "@/components/post-editor/editor-header";
import { AIWritingAssistant } from "@/components/post-editor/ai-writing-assistant";
import { SEOMetaTabs } from "@/components/post-editor/seo-meta-tabs";
import { ImageSocialTabs } from "@/components/post-editor/image-social-tabs";

export default function PostEditorPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.websiteId as string;
  const postId = params.postId as string;
  const isNew = postId === "new";

  const [post, setPost] = useState<Partial<Post>>({
    title: "", slug: "", content: "", excerpt: "",
    metaTitle: "", metaDescription: "", focusKeyword: "",
    secondaryKeywords: [], tags: [], category: "", status: "DRAFT",
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [isFixingSEO, setIsFixingSEO] = useState(false);
  const [imagePromptInput, setImagePromptInput] = useState("");
  const [imageCacheBust, setImageCacheBust] = useState<number>(Date.now());
  const [regeneratingInlineIdx, setRegeneratingInlineIdx] = useState<number | null>(null);
  const [inlinePrompts, setInlinePrompts] = useState<Record<number, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [autoSlug, setAutoSlug] = useState(isNew);

  const [integrations, setIntegrations] = useState<{
    wp: boolean;
    shopify: boolean;
    ghost: boolean;
    webhook: boolean;
    hostingMode: string;
    brandUrl: string;
    customDomain: string | null;
    subdomain: string | null;
  }>({ wp: false, shopify: false, ghost: false, webhook: false, hostingMode: "HOSTED", brandUrl: "", customDomain: null, subdomain: null });

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/websites/${websiteId}/posts/${postId}`)
        .then((r) => r.json())
        .then((data) => { setPost(data); setAutoSlug(false); })
        .catch(() => toast.error("Failed to load post"))
        .finally(() => setIsLoading(false));
    }
  }, [websiteId, postId, isNew]);

  useEffect(() => {
    fetch(`/api/websites/${websiteId}`)
      .then((r) => r.json())
      .then((data) => {
        setIntegrations({
          wp: Boolean(data.cmsApiUrl && data.cmsApiKey),
          shopify: Boolean(data.shopifyConfig),
          ghost: Boolean(data.ghostConfig),
          webhook: Boolean(data.webhookUrl),
          hostingMode: data.hostingMode || "HOSTED",
          brandUrl: data.brandUrl || "",
          customDomain: data.customDomain || null,
          subdomain: data.subdomain || null,
        });
      })
      .catch(() => {});
  }, [websiteId]);

  const updateField = (field: string, value: unknown) => {
    setPost((p) => ({ ...p, [field]: value }));
    if (field === "title" && autoSlug) {
      const slug = (value as string)
        .toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "").slice(0, 80);
      setPost((p) => ({ ...p, title: value as string, slug }));
    }
  };

  const wordCount = post.content ? post.content.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const liveUrl = (() => {
    if (post.externalUrl) return post.externalUrl;
    if (!post.slug || post.status !== "PUBLISHED") return null;
    if (integrations.customDomain) return `https://${integrations.customDomain}/${post.slug}`;
    if (integrations.brandUrl) return `${integrations.brandUrl.replace(/\/$/, "")}/blog/${post.slug}`;
    return null;
  })();

  const savePost = async (statusOverride?: string): Promise<{ ok: boolean; saved?: Post }> => {
    if (!post.title?.trim() || !post.content?.trim()) {
      toast.error("Title and content are required");
      return { ok: false };
    }
    const payload = { ...post, wordCount, readingTime };
    if (statusOverride) payload.status = statusOverride;

    const url = isNew
      ? `/api/websites/${websiteId}/posts`
      : `/api/websites/${websiteId}/posts/${postId}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Failed to save");
      return { ok: false };
    }
    return { ok: true, saved: await res.json() };
  };

  const runSEOFix = (savedPostId: string) => {
    setIsFixingSEO(true);
    const contentAtSave = post.content;
    fetch(`/api/websites/${websiteId}/posts/${savedPostId}/seo-fix`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.content && data.content !== contentAtSave) {
          updateField("content", data.content);
          const fixed = data.issuesFixed ?? {};
          const msgs: string[] = [];
          if (fixed.longParagraphs > 0) msgs.push(`${fixed.longParagraphs} paragraph(s) split`);
          if (fixed.addedH3s) msgs.push("H3s added");
          if (fixed.expandedWords) msgs.push("content expanded");
          if (fixed.addedLinks) msgs.push("links added");
          if (fixed.tocRegenerated) msgs.push("TOC updated");
          if (msgs.length) toast.success(`Auto-optimized: ${msgs.join(", ")}`);
        }
      })
      .catch(() => {})
      .finally(() => setIsFixingSEO(false));
  };

  const handleSave = async (statusOverride?: string) => {
    setIsSaving(true);
    try {
      const { ok, saved } = await savePost(statusOverride);
      if (!ok || !saved) return;
      const msg = statusOverride === "PUBLISHED" ? "Post published!" :
        statusOverride === "DRAFT" ? "Moved to Draft" :
        statusOverride === "REVIEW" ? "Marked as ready for review" : "Post saved";
      toast.success(msg);
      if (isNew) {
        router.replace(`/dashboard/websites/${websiteId}/posts/${saved.id}`);
      } else {
        setPost((p) => ({ ...p, status: saved.status }));
        runSEOFix(saved.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const { ok, saved } = await savePost("PUBLISHED");
      if (!ok || !saved) return;
      toast.success("Post published!");
      setPost((p) => ({ ...p, status: "PUBLISHED" }));
      if (isNew) {
        router.replace(`/dashboard/websites/${websiteId}/posts/${saved.id}`);
      } else {
        runSEOFix(saved.id);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAutoFixSEO = async () => {
    if (isNew) { toast.error("Save the post first"); return; }
    setIsFixingSEO(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/posts/${postId}/seo-fix`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        updateField("content", data.content);
        const fixed = data.issuesFixed;
        const messages = [];
        if (fixed.longParagraphs > 0) messages.push(`${fixed.longParagraphs} long paragraph(s) split`);
        if (fixed.addedH3s) messages.push("H3 subheadings added");
        if (fixed.expandedWords) messages.push("content expanded to 1500+ words");
        if (fixed.addedLinks) messages.push("internal links added");
        if (fixed.tocRegenerated) messages.push("table of contents updated");
        toast.success(`Fixed: ${messages.join(", ") || "content polished"}`);
      } else {
        toast.error(data.error || "Auto-fix failed");
      }
    } catch { toast.error("Auto-fix failed"); }
    finally { setIsFixingSEO(false); }
  };

  const handleRegenerateImage = async (customPrompt?: string) => {
    if (isNew) { toast.error("Save the post first"); return; }
    setIsRegeneratingImage(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/posts/${postId}/regenerate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customPrompt ? { prompt: customPrompt } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        updateField("featuredImage", data.imageUrl);
        setImageCacheBust(Date.now());
        toast.success("New image generated!");
        setImagePromptInput("");
      } else {
        toast.error(data.error || "Failed to generate image");
      }
    } catch { toast.error("Image generation failed"); }
    finally { setIsRegeneratingImage(false); }
  };

  const handleRegenerateInlineImage = async (index: number, customPrompt?: string) => {
    if (isNew) { toast.error("Save the post first"); return; }
    setRegeneratingInlineIdx(index);
    try {
      const res = await fetch(`/api/websites/${websiteId}/posts/${postId}/regenerate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "inline",
          inlineIndex: index,
          ...(customPrompt ? { prompt: customPrompt } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok && data.content) {
        updateField("content", data.content);
        setImageCacheBust(Date.now());
        toast.success(`Inline image ${index + 1} regenerated!`);
        setInlinePrompts((p) => ({ ...p, [index]: "" }));
      } else {
        toast.error(data.error || "Failed to regenerate inline image");
      }
    } catch { toast.error("Inline image regeneration failed"); }
    finally { setRegeneratingInlineIdx(null); }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      updateField("tags", [...(post.tags || []), tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => updateField("tags", (post.tags || []).filter((t) => t !== tag));

  const hasCMSIntegration = integrations.wp || integrations.shopify;
  const statusCfg = STATUS_CONFIG[post.status || "DRAFT"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EditorHeader
        isNew={isNew}
        websiteId={websiteId}
        postId={postId}
        post={post}
        statusCfg={statusCfg}
        wordCount={wordCount}
        readingTime={readingTime}
        liveUrl={liveUrl}
        isSaving={isSaving}
        isPublishing={isPublishing}
        isRegeneratingImage={isRegeneratingImage}
        isFixingSEO={isFixingSEO}
        hasCMSIntegration={hasCMSIntegration}
        integrations={integrations}
        onSave={handleSave}
        onPublish={handlePublish}
        onRegenerateImage={() => handleRegenerateImage()}
        onPostUpdate={(updates) => setPost((p) => ({ ...p, ...updates }))}
      />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Editor */}
        <div className="space-y-4">
          {/* Title */}
          <Input
            placeholder="Post title..."
            value={post.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            className="text-xl font-bold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 text-xs">Slug:</span>
            <Input
              value={post.slug || ""}
              onChange={(e) => { setAutoSlug(false); updateField("slug", e.target.value); }}
              className="h-7 text-xs"
            />
          </div>

          {/* Markdown Editor */}
          <MarkdownEditor
            value={post.content || ""}
            onChange={(v) => updateField("content", v)}
            height={600}
          />

          {/* AI Writing Assistant */}
          <AIWritingAssistant
            websiteId={websiteId}
            content={post.content || ""}
            onUpdateContent={(v) => updateField("content", v)}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <Tabs defaultValue="seo">
            <TabsList className="w-full">
              <TabsTrigger value="seo" className="flex-1 text-xs px-1">
                <BarChart3 className="mr-1 h-3 w-3" />SEO
              </TabsTrigger>
              <TabsTrigger value="meta" className="flex-1 text-xs px-1">
                <FileText className="mr-1 h-3 w-3" />Meta
              </TabsTrigger>
              <TabsTrigger value="image" className="flex-1 text-xs px-1">
                <ImageIcon className="mr-1 h-3 w-3" />Image
              </TabsTrigger>
              <TabsTrigger value="social" className="flex-1 text-xs px-1">
                <Tags className="mr-1 h-3 w-3" />Social
              </TabsTrigger>
            </TabsList>

            <SEOMetaTabs
              post={post}
              updateField={updateField}
              wordCount={wordCount}
              isNew={isNew}
              isFixingSEO={isFixingSEO}
              onAutoFixSEO={!isNew ? handleAutoFixSEO : undefined}
              tagInput={tagInput}
              setTagInput={setTagInput}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />

            <ImageSocialTabs
              post={post}
              updateField={updateField}
              isNew={isNew}
              isRegeneratingImage={isRegeneratingImage}
              imageCacheBust={imageCacheBust}
              imagePromptInput={imagePromptInput}
              setImagePromptInput={setImagePromptInput}
              onRegenerateImage={handleRegenerateImage}
              onRegenerateInlineImage={handleRegenerateInlineImage}
              regeneratingInlineIdx={regeneratingInlineIdx}
              inlinePrompts={inlinePrompts}
              setInlinePrompts={setInlinePrompts}
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
