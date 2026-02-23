"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import type { WebsiteData, UpdateFieldFn } from "./settings-types";

interface AnalyticsSettingsProps {
  website: WebsiteData;
  updateField: UpdateFieldFn;
}

export function AnalyticsSettings({ website, updateField }: AnalyticsSettingsProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Google Analytics ID</Label>
            <Input placeholder="G-XXXXXXXXXX" value={website.googleAnalyticsId || ""} onChange={(e) => updateField("googleAnalyticsId", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Search Console URL</Label>
            <Input placeholder="https://yourdomain.com" value={website.gscPropertyUrl || ""} onChange={(e) => updateField("gscPropertyUrl", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-primary" /> IndexNow API Key</Label>
          <Input placeholder="Auto-submit to Google & Bing on publish" value={website.indexNowKey || ""} onChange={(e) => updateField("indexNowKey", e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
}
