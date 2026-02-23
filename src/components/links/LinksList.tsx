"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Link2,
  Trash2,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { InternalLink } from "./types";

interface LinksListProps {
  links: InternalLink[];
  filtered: InternalLink[];
  search: string;
  deletingId: string | null;
  isGenerating: boolean;
  onSearchChange: (value: string) => void;
  onDelete: (linkId: string) => void;
  onAutoGenerate: () => void;
}

export function LinksList({
  links,
  filtered,
  search,
  deletingId,
  isGenerating,
  onSearchChange,
  onDelete,
  onAutoGenerate,
}: LinksListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Link Pairs
            <Badge variant="secondary">{links.length}</Badge>
          </CardTitle>
          {links.length > 5 && (
            <Input
              placeholder="Search keywords or URLs…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-56"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm mb-4">
              {links.length === 0 ? "No link pairs yet" : "No matches found"}
            </p>
            {links.length === 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={onAutoGenerate} disabled={isGenerating}>
                <Sparkles className="h-3.5 w-3.5" />
                Auto-generate with AI
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {filtered.map((link, i) => (
              <div key={link.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Badge variant="outline" className="text-xs shrink-0 font-mono">{link.keyword}</Badge>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate flex items-center gap-1">
                        {link.url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive ml-2 shrink-0"
                    onClick={() => onDelete(link.id)} disabled={deletingId === link.id}>
                    {deletingId === link.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
