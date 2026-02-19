"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Link2,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface InternalLink {
  id: string;
  keyword: string;
  url: string;
  createdAt: string;
}

export default function InternalLinksPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const [links, setLinks] = useState<InternalLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ keyword: "", url: "" });
  const [search, setSearch] = useState("");

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/links`);
      if (res.ok) setLinks(await res.json());
    } catch {
      toast.error("Failed to load links");
    } finally {
      setIsLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleAdd = async () => {
    if (!newLink.keyword.trim() || !newLink.url.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });

      if (res.ok) {
        toast.success("Link pair added");
        setNewLink({ keyword: "", url: "" });
        fetchLinks();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add link");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    setDeletingId(linkId);
    try {
      const res = await fetch(
        `/api/websites/${websiteId}/links?id=${linkId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Link removed");
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = links.filter(
    (l) =>
      l.keyword.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="h-6 w-6" />
          Internal Links
        </h2>
        <p className="text-muted-foreground mt-1">
          Keyword → URL pairs automatically inserted into AI-generated content
        </p>
      </div>

      {/* How it works */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">How internal linking works</p>
            <p className="text-muted-foreground mt-0.5">
              When AI generates a post, it scans for these keywords and
              automatically links them to the URLs you define. This improves
              SEO by distributing page authority across your site.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add new link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Link Pair
          </CardTitle>
          <CardDescription>
            When the keyword appears in generated content, it will be linked to
            the URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Keyword (e.g., invoicing software)"
                value={newLink.keyword}
                onChange={(e) =>
                  setNewLink((p) => ({ ...p, keyword: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Input
                placeholder="URL (e.g., https://invoicecave.com/features)"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink((p) => ({ ...p, url: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={
                isAdding || !newLink.keyword.trim() || !newLink.url.trim()
              }
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Link Pairs
                <Badge variant="secondary">{links.length}</Badge>
              </CardTitle>
            </div>
            {links.length > 5 && (
              <Input
                placeholder="Search keywords or URLs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">
                {links.length === 0
                  ? "No link pairs yet — add one above"
                  : "No matches found"}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filtered.map((link, i) => (
                <div key={link.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0 font-mono"
                      >
                        {link.keyword}
                      </Badge>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate flex items-center gap-1"
                        >
                          {link.url}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive ml-2 shrink-0"
                      onClick={() => handleDelete(link.id)}
                      disabled={deletingId === link.id}
                    >
                      {deletingId === link.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
