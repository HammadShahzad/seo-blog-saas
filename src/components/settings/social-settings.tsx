"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Twitter, Linkedin } from "lucide-react";
import type { WebsiteData, UpdateFieldFn } from "./settings-types";

interface SocialSettingsProps {
  website: WebsiteData;
  updateField: UpdateFieldFn;
}

export function SocialSettings({ website, updateField }: SocialSettingsProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <p className="text-sm font-medium flex items-center gap-2 mb-3"><Twitter className="h-4 w-4" /> Twitter / X</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input type="password" placeholder="API Key (Consumer Key)" value={website.twitterApiKey || ""} onChange={(e) => updateField("twitterApiKey", e.target.value)} />
            <Input type="password" placeholder="API Secret (Consumer Secret)" value={website.twitterApiSecret || ""} onChange={(e) => updateField("twitterApiSecret", e.target.value)} />
            <Input type="password" placeholder="Access Token" value={website.twitterAccessToken || ""} onChange={(e) => updateField("twitterAccessToken", e.target.value)} />
            <Input type="password" placeholder="Access Token Secret" value={website.twitterAccessSecret || ""} onChange={(e) => updateField("twitterAccessSecret", e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            All 4 keys needed.{" "}
            <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get API keys →</a>
          </p>
        </div>
        <Separator />
        <div>
          <p className="text-sm font-medium flex items-center gap-2 mb-3"><Linkedin className="h-4 w-4" /> LinkedIn</p>
          <Input type="password" placeholder="LinkedIn OAuth access token" value={website.linkedinAccessToken || ""} onChange={(e) => updateField("linkedinAccessToken", e.target.value)} />
          <p className="text-xs text-muted-foreground mt-2">
            Requires <code className="bg-muted px-1 rounded">w_member_social</code> scope.{" "}
            <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn Developers →</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
