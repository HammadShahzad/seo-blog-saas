"use client";

import type { Dispatch, SetStateAction } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Image as ImageIcon } from "lucide-react";
import { type Post } from "./types";

interface ImageSocialTabsProps {
  post: Partial<Post>;
  updateField: (field: string, value: unknown) => void;
  isNew: boolean;
  isRegeneratingImage: boolean;
  imageCacheBust: number;
  imagePromptInput: string;
  setImagePromptInput: (v: string) => void;
  onRegenerateImage: (customPrompt?: string) => void;
  onRegenerateInlineImage: (index: number, customPrompt?: string) => void;
  regeneratingInlineIdx: number | null;
  inlinePrompts: Record<number, string>;
  setInlinePrompts: Dispatch<SetStateAction<Record<number, string>>>;
}

export function ImageSocialTabs({
  post, updateField, isNew, isRegeneratingImage, imageCacheBust,
  imagePromptInput, setImagePromptInput, onRegenerateImage,
  onRegenerateInlineImage, regeneratingInlineIdx, inlinePrompts, setInlinePrompts,
}: ImageSocialTabsProps) {
  const inlineImages = (post.content || "").match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
  const parsedInlineImages = inlineImages
    .map((m: string) => {
      const match = m.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      return match ? { alt: match[1], url: match[2] } : null;
    })
    .filter(Boolean) as { alt: string; url: string }[];

  return (
    <>
      {/* Image Tab */}
      <TabsContent value="image" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Featured Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {post.featuredImage ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${post.featuredImage}?v=${imageCacheBust}`}
                  alt={post.featuredImageAlt || "Featured image"}
                  className="w-full rounded-lg aspect-video object-cover"
                />
                {isRegeneratingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-xs">Generating…</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 ${isRegeneratingImage ? "border-primary/50 bg-primary/5 text-primary" : "border-amber-300 bg-amber-50 text-amber-700 cursor-pointer hover:bg-amber-100 transition-colors"}`}
                onClick={() => !isRegeneratingImage && !isNew && onRegenerateImage()}>
                {isRegeneratingImage
                  ? <><Loader2 className="h-6 w-6 animate-spin text-primary" /><p className="text-xs font-medium">Generating…</p></>
                  : <>
                      <Sparkles className="h-6 w-6" />
                      <p className="text-xs font-semibold">No featured image</p>
                      {!isNew && <p className="text-xs opacity-75">Click to generate with AI</p>}
                    </>}
              </div>
            )}

            {!isNew && (
              <div className="space-y-2">
                <Button size="sm" className="w-full" variant={post.featuredImage ? "outline" : "default"}
                  onClick={() => onRegenerateImage()} disabled={isRegeneratingImage}>
                  {isRegeneratingImage
                    ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                  {post.featuredImage ? "Regenerate with AI" : "Generate Featured Image"}
                </Button>
                <div className="flex gap-1.5">
                  <input type="text" placeholder="Custom prompt (optional)…"
                    value={imagePromptInput}
                    onChange={(e) => setImagePromptInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && imagePromptInput.trim()) onRegenerateImage(imagePromptInput.trim()); }}
                    className="flex-1 h-7 text-xs px-2 border rounded-md bg-background"
                    disabled={isRegeneratingImage} />
                  <Button size="sm" variant="ghost" className="h-7 px-2"
                    onClick={() => imagePromptInput.trim() && onRegenerateImage(imagePromptInput.trim())}
                    disabled={isRegeneratingImage || !imagePromptInput.trim()}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Manual URL override</Label>
              <Input placeholder="Paste image URL…" value={post.featuredImage || ""}
                onChange={(e) => updateField("featuredImage", e.target.value)}
                className="text-xs h-8" />
              <Input placeholder="Alt text" value={post.featuredImageAlt || ""}
                onChange={(e) => updateField("featuredImageAlt", e.target.value)}
                className="text-xs h-8" />
            </div>
          </CardContent>
        </Card>

        {/* Inline Images */}
        {parsedInlineImages.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Inline Images ({parsedInlineImages.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground">Images embedded within the article content</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {parsedInlineImages.map((img, i) => (
                <div key={i} className="space-y-2 pb-3 border-b last:border-0 last:pb-0">
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${img.url}${img.url.includes("?") ? "&" : "?"}v=${imageCacheBust}`}
                      alt={img.alt || `Inline image ${i + 1}`}
                      className="w-full rounded-md aspect-video object-cover border"
                    />
                    {regeneratingInlineIdx === i && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                        <div className="text-center text-white">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                          <p className="text-[10px]">Generating…</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{img.alt || `Image ${i + 1}`}</p>
                  {!isNew && (
                    <div className="space-y-1.5">
                      <Button size="sm" variant="outline" className="w-full h-7 text-[11px]"
                        disabled={regeneratingInlineIdx !== null}
                        onClick={() => onRegenerateInlineImage(i)}>
                        {regeneratingInlineIdx === i
                          ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          : <Sparkles className="mr-1.5 h-3 w-3" />}
                        Regenerate
                      </Button>
                      <div className="flex gap-1">
                        <input type="text" placeholder="Custom prompt…"
                          value={inlinePrompts[i] || ""}
                          onChange={(e) => setInlinePrompts((p) => ({ ...p, [i]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter" && (inlinePrompts[i] || "").trim()) onRegenerateInlineImage(i, inlinePrompts[i].trim()); }}
                          className="flex-1 h-6 text-[10px] px-2 border rounded-md bg-background"
                          disabled={regeneratingInlineIdx !== null} />
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0"
                          onClick={() => (inlinePrompts[i] || "").trim() && onRegenerateInlineImage(i, inlinePrompts[i].trim())}
                          disabled={regeneratingInlineIdx !== null || !(inlinePrompts[i] || "").trim()}>
                          <RefreshCw className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Social Tab */}
      <TabsContent value="social" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Twitter / X Caption</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Tweet caption with hashtags…"
              value={(post.socialCaptions as { twitter?: string })?.twitter || ""}
              onChange={(e) => updateField("socialCaptions", { ...(post.socialCaptions || {}), twitter: e.target.value })}
              rows={3} className="text-sm resize-none" />
            <p className={`text-xs mt-1 ${((post.socialCaptions as { twitter?: string })?.twitter || "").length > 280 ? "text-destructive" : "text-muted-foreground"}`}>
              {((post.socialCaptions as { twitter?: string })?.twitter || "").length}/280
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">LinkedIn Caption</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="LinkedIn post caption…"
              value={(post.socialCaptions as { linkedin?: string })?.linkedin || ""}
              onChange={(e) => updateField("socialCaptions", { ...(post.socialCaptions || {}), linkedin: e.target.value })}
              rows={4} className="text-sm resize-none" />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
