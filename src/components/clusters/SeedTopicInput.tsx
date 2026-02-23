"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

interface SeedTopicInputProps {
  seedTopic: string;
  onSeedTopicChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function SeedTopicInput({
  seedTopic,
  onSeedTopicChange,
  onGenerate,
  isGenerating,
}: SeedTopicInputProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="seedTopic" className="text-sm font-medium">Topic / Keyword</Label>
            <Input
              id="seedTopic"
              placeholder="e.g., email marketing, invoicing software, SEO tools…"
              value={seedTopic}
              onChange={(e) => onSeedTopicChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isGenerating && onGenerate()}
            />
            <p className="text-xs text-muted-foreground">
              Enter a topic to generate clusters around it, or leave empty to auto-detect from your niche
            </p>
          </div>
          <Button onClick={onGenerate} disabled={isGenerating} className="shrink-0">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isGenerating ? "Researching…" : "Generate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
