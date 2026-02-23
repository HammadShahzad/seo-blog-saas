"use client";

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { WebsiteData } from "./settings-types";

interface DangerZoneSettingsProps {
  website: WebsiteData;
  isPausing: boolean;
  isDeleting: boolean;
  confirmDelete: string;
  setConfirmDelete: (v: string) => void;
  onPause: () => void;
  onDelete: () => void;
}

export function DangerZoneSettings({
  website, isPausing, isDeleting,
  confirmDelete, setConfirmDelete,
  onPause, onDelete,
}: DangerZoneSettingsProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Pause Website</p>
            <p className="text-sm text-muted-foreground">Stop all content generation</p>
          </div>
          <Button variant="outline" onClick={onPause} disabled={isPausing}>
            {isPausing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {website.status === "PAUSED" ? "Resume" : "Pause"}
          </Button>
        </div>
        <Separator />
        <div className="space-y-3">
          <p className="font-medium">Delete Website</p>
          <p className="text-sm text-muted-foreground">Permanently delete this website and all its content</p>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Type <span className="font-mono font-semibold text-foreground">{website.domain}</span> to confirm:
            </p>
            <div className="flex gap-2">
              <Input placeholder={website.domain} value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className="max-w-xs" />
              <Button variant="destructive" onClick={onDelete} disabled={isDeleting || confirmDelete !== website.domain}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
