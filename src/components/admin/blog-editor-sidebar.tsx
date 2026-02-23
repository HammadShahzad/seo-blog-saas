import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEOScore } from "@/components/editor/seo-score";
import type { PostFormData } from "./blog-editor";

interface BlogEditorSidebarProps {
  form: PostFormData;
  updateField: (field: keyof PostFormData, value: unknown) => void;
  wordCount: number;
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: (e: React.KeyboardEvent) => void;
}

export function BlogEditorSidebar({
  form,
  updateField,
  wordCount,
  tagInput,
  onTagInputChange,
  onAddTag,
}: BlogEditorSidebarProps) {
  return (
    <Tabs defaultValue="seo">
      <TabsList className="w-full">
        <TabsTrigger value="seo" className="flex-1 text-xs">SEO</TabsTrigger>
        <TabsTrigger value="meta" className="flex-1 text-xs">Meta</TabsTrigger>
        <TabsTrigger value="details" className="flex-1 text-xs">Details</TabsTrigger>
      </TabsList>

      <TabsContent value="seo" className="space-y-4 mt-4">
        <Card>
          <CardContent className="pt-4">
            <SEOScore
              title={form.title}
              content={form.content}
              metaTitle={form.metaTitle}
              metaDescription={form.metaDescription}
              focusKeyword={form.focusKeyword}
              wordCount={wordCount}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Focus Keyword</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g., AI blog generator"
              value={form.focusKeyword}
              onChange={(e) => updateField("focusKeyword", e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Publish Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Input
                placeholder="e.g., SEO Tips"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (press Enter)</Label>
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyDown={onAddTag}
                className="h-8 text-sm"
              />
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      onClick={() => updateField("tags", form.tags.filter(t => t !== tag))}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="meta" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Meta Title</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="SEO title (under 60 chars)"
              value={form.metaTitle}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{form.metaTitle.length}/60</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Meta Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Meta description (under 155 chars)"
              value={form.metaDescription}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{form.metaDescription.length}/155</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Excerpt</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Short post summary..."
              value={form.excerpt}
              onChange={(e) => updateField("excerpt", e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="details" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Featured Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.featuredImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={form.featuredImage}
                alt={form.featuredImageAlt || "Featured image"}
                className="w-full rounded-lg aspect-video object-cover"
              />
            )}
            <Input
              placeholder="Image URL"
              value={form.featuredImage}
              onChange={(e) => updateField("featuredImage", e.target.value)}
              className="text-xs h-8"
            />
            <Input
              placeholder="Alt text"
              value={form.featuredImageAlt}
              onChange={(e) => updateField("featuredImageAlt", e.target.value)}
              className="text-xs h-8"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
