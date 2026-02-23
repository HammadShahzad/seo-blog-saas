"use client";

import { useState } from "react";
import { Link2, ChevronDown, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InternalLinksSettingsProps {
  websiteId: string;
}

export function InternalLinksSettings({ websiteId }: InternalLinksSettingsProps) {
  const [linksOpen, setLinksOpen] = useState(false);
  const [internalLinks, setInternalLinks] = useState<{ id: string; keyword: string; url: string; usageCount: number }[]>([]);
  const [linksLoaded, setLinksLoaded] = useState(false);

  const toggleLinks = async () => {
    if (!linksOpen && !linksLoaded) {
      try {
        const res = await fetch(`/api/websites/${websiteId}/links`);
        if (res.ok) {
          setInternalLinks(await res.json());
          setLinksLoaded(true);
        }
      } catch { /* silent */ }
    }
    setLinksOpen((v) => !v);
  };

  const deleteLink = async (id: string) => {
    try {
      await fetch(`/api/websites/${websiteId}/links?id=${id}`, { method: "DELETE" });
      setInternalLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      toast.error("Failed to delete link");
    }
  };

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={toggleLinks}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Internal Links</span>
          {linksLoaded && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {internalLinks.length}
            </span>
          )}
        </div>
        {linksOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {linksOpen && (
        <div className="px-4 pb-4 space-y-2 border-t">
          <p className="text-xs text-muted-foreground pt-3">
            AI uses these keyword → URL pairs to add internal links in every generated article.
            Manage the full list in the <a href={`/dashboard/websites/${websiteId}/links`} className="text-primary hover:underline">Internal Links page</a>.
          </p>
          {!linksLoaded ? (
            <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </div>
          ) : internalLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No internal links yet.</p>
          ) : (
            <div className="divide-y rounded-lg border overflow-hidden mt-2">
              {internalLinks.slice(0, 20).map((link) => (
                <div key={link.id} className="flex items-center justify-between px-3 py-2 bg-background hover:bg-muted/20 text-sm gap-2">
                  <span className="font-medium text-foreground min-w-0 truncate">{link.keyword}</span>
                  <span className="text-muted-foreground truncate flex-1 min-w-0 text-xs">{link.url}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{link.usageCount}x</span>
                    <button
                      type="button"
                      onClick={() => deleteLink(link.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {internalLinks.length > 20 && (
                <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30">
                  +{internalLinks.length - 20} more —{" "}
                  <a href={`/dashboard/websites/${websiteId}/links`} className="text-primary hover:underline">
                    view all
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
