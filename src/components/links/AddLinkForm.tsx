"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";

interface AddLinkFormProps {
  newLink: { keyword: string; url: string };
  isAdding: boolean;
  onNewLinkChange: React.Dispatch<React.SetStateAction<{ keyword: string; url: string }>>;
  onAdd: () => void;
}

export function AddLinkForm({ newLink, isAdding, onNewLinkChange, onAdd }: AddLinkFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Manually
        </CardTitle>
        <CardDescription>
          When the keyword appears in generated content, it will be linked to the URL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Keyword (e.g., invoicing software)"
              value={newLink.keyword}
              onChange={(e) => onNewLinkChange((p) => ({ ...p, keyword: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && onAdd()}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="URL (e.g., https://example.com/features)"
              value={newLink.url}
              onChange={(e) => onNewLinkChange((p) => ({ ...p, url: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && onAdd()}
            />
          </div>
          <Button onClick={onAdd} disabled={isAdding || !newLink.keyword.trim() || !newLink.url.trim()}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
