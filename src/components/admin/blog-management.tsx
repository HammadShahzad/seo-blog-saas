"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  Loader2, Edit, Plus, Trash2, Eye,
  Save, Send, ArrowLeft, ExternalLink,
} from "lucide-react";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { SEOScore } from "@/components/editor/seo-score";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  category: string | null;
  featuredImage: string | null;
  wordCount: number | null;
  views: number;
  publishedAt: string | null;
  createdAt: string;
};

type PostFormData = {
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

export function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data.posts);
      setWebsiteId(data.websiteId);
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Post deleted");
      fetchPosts();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  if (editingPost) {
    return (
      <BlogEditor
        postId={editingPost}
        onBack={() => { setEditingPost(null); fetchPosts(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage blog posts for stackserp.com
            {websiteId && (
              <a
                href={`${window.location.origin}/blogs`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
              >
                View Blog <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </p>
        </div>
        <Button onClick={() => setEditingPost("new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-muted-foreground">No blog posts yet.</p>
                  <Button variant="link" onClick={() => setEditingPost("new")} className="mt-1">
                    Create your first post
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium max-w-[300px] truncate">{post.title}</div>
                    <div className="text-xs text-muted-foreground">/{post.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      post.status === "PUBLISHED" ? "default" :
                      post.status === "DRAFT" ? "secondary" : "outline"
                    }>
                      {post.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{post.category || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{post.wordCount || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{post.views}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : new Date(post.createdAt).toLocaleDateString()
                      }
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingPost(post.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/blogs/${post.slug}`, "_blank")}
                        disabled={post.status !== "PUBLISHED"}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function BlogEditor({ postId, onBack }: { postId: string; onBack: () => void }) {
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
      {/* Top Bar */}
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
        {/* Main Editor */}
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

        {/* Right Sidebar */}
        <div className="space-y-4">
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
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
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
        </div>
      </div>
    </div>
  );
}
