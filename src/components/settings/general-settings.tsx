"use client";

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe } from "lucide-react";
import type { WebsiteData, UpdateFieldFn } from "./settings-types";

interface GeneralSettingsProps {
  website: WebsiteData;
  updateField: UpdateFieldFn;
}

export function GeneralSettings({ website, updateField }: GeneralSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          General
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Website Name</Label>
            <Input
              value={website.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input
              value={website.domain}
              onChange={(e) => updateField("domain", e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Niche / Industry</Label>
            <Input
              value={website.niche}
              onChange={(e) => updateField("niche", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input
              value={website.targetAudience}
              onChange={(e) => updateField("targetAudience", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={website.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
