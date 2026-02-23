"use client";

import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEOScore } from "@/components/editor/seo-score";
import { type Post } from "./types";

interface SEOMetaTabsProps {
  post: Partial<Post>;
  updateField: (field: string, value: unknown) => void;
  wordCount: number;
  isNew: boolean;
  isFixingSEO: boolean;
  onAutoFixSEO: (() => Promise<void>) | undefined;
  tagInput: string;
  setTagInput: (v: string) => void;
  onAddTag: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
}

export function SEOMetaTabs({
  post, updateField, wordCount, isNew, isFixingSEO,
  onAutoFixSEO, tagInput, setTagInput, onAddTag, onRemoveTag,
}: SEOMetaTabsProps) {
  return (
    <>
      {/* SEO Tab */}
      <TabsContent value="seo" className="space-y-4 mt-4">
        <Card>
          <CardContent className="pt-4">
            <SEOScore
              title={post.title || ""} content={post.content || ""}
              metaTitle={post.metaTitle || ""} metaDescription={post.metaDescription || ""}
              focusKeyword={post.focusKeyword || ""} wordCount={wordCount}
              featuredImage={post.featuredImage} featuredImageAlt={post.featuredImageAlt}
              onAutoFix={onAutoFixSEO}
              isFixing={isFixingSEO}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Focus Keyword</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="e.g., invoicing software"
              value={post.focusKeyword || ""}
              onChange={(e) => updateField("focusKeyword", e.target.value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Publish Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={post.status || "DRAFT"}
                onValueChange={(v) => updateField("status", v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                  {post.status === "SCHEDULED" && (
                    <SelectItem value="SCHEDULED" disabled>
                      Scheduled (use toolbar to change)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Input placeholder="e.g., Invoicing Tips"
                value={post.category || ""}
                onChange={(e) => updateField("category", e.target.value)}
                className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (press Enter)</Label>
              <Input placeholder="Add tag…" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onAddTag} className="h-8 text-sm" />
              {(post.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive/10"
                      onClick={() => onRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Meta Tab */}
      <TabsContent value="meta" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Meta Title</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="SEO title (≤60 chars)" value={post.metaTitle || ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              rows={2} className="text-sm resize-none" />
            <p className={`text-xs mt-1 ${(post.metaTitle || "").length > 60 ? "text-destructive" : "text-muted-foreground"}`}>
              {(post.metaTitle || "").length}/60
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Meta Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Meta description (≤155 chars)" value={post.metaDescription || ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              rows={3} className="text-sm resize-none" />
            <p className={`text-xs mt-1 ${(post.metaDescription || "").length > 155 ? "text-destructive" : "text-muted-foreground"}`}>
              {(post.metaDescription || "").length}/155
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Excerpt</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Short post summary…" value={post.excerpt || ""}
              onChange={(e) => updateField("excerpt", e.target.value)}
              rows={3} className="text-sm resize-none" />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
