"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Loader2, Sparkles, Globe } from "lucide-react";

interface LinksPageHeaderProps {
  isGenerating: boolean;
  onAutoGenerate: () => void;
}

export function LinksPageHeader({ isGenerating, onAutoGenerate }: LinksPageHeaderProps) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Internal Links
          </h2>
          <p className="text-muted-foreground mt-1">
            Keyword → URL pairs automatically inserted into AI-generated content
          </p>
        </div>
        <Button onClick={onAutoGenerate} disabled={isGenerating} className="gap-2 shrink-0">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? "Scanning…" : "Auto-generate with AI"}
        </Button>
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="flex items-start gap-3 p-4">
          <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Only links from your actual website</p>
            <p className="text-muted-foreground mt-0.5">
              We crawl your website directly to discover real pages, then map keywords to those URLs.
              No invented or external links — only URLs that actually exist on your site.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
