"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Palette, X, Plus } from "lucide-react";
import type { WebsiteData, UpdateFieldFn } from "./settings-types";

interface BrandSettingsProps {
  website: WebsiteData;
  updateField: UpdateFieldFn;
  isAdmin: boolean;
  competitorInput: string;
  setCompetitorInput: (v: string) => void;
  keyProductInput: string;
  setKeyProductInput: (v: string) => void;
}

export function BrandSettings({
  website, updateField, isAdmin,
  competitorInput, setCompetitorInput,
  keyProductInput, setKeyProductInput,
}: BrandSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Brand &amp; Identity
        </CardTitle>
        <CardDescription>
          AI uses this to match your voice, differentiate content, and write targeted CTAs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input value={website.brandName} onChange={(e) => updateField("brandName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Brand URL</Label>
            <Input value={website.brandUrl} onChange={(e) => updateField("brandUrl", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Writing Tone</Label>
            <Input value={website.tone} onChange={(e) => updateField("tone", e.target.value)} placeholder="e.g., Friendly, authoritative, witty" />
          </div>
          <div className="space-y-2">
            <Label>Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={website.primaryColor || "#4F46E5"}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="h-10 w-10 rounded border cursor-pointer"
              />
              <Input
                value={website.primaryColor || "#4F46E5"}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Unique Value Proposition</Label>
          <Textarea
            placeholder="What makes your business different from competitors?"
            value={website.uniqueValueProp || ""}
            onChange={(e) => updateField("uniqueValueProp", e.target.value)}
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            AI uses this to write differentiating CTAs and unique angles in every article.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Geographic Focus</Label>
            <Input
              placeholder="e.g., United States, Global, Pakistan"
              value={website.targetLocation || ""}
              onChange={(e) => updateField("targetLocation", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used for pricing, examples, and market references.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Hosting Mode</Label>
            <Select value={website.hostingMode} onValueChange={(v) => updateField("hostingMode", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="HOSTED">Self-Hosted</SelectItem>}
                <SelectItem value="WORDPRESS">WordPress</SelectItem>
                <SelectItem value="WEBHOOK">Webhook</SelectItem>
                <SelectItem value="API">API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Key Products / Features</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Type and press Enter to add"
              value={keyProductInput}
              onChange={(e) => setKeyProductInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const val = keyProductInput.trim().replace(/,$/, "");
                  if (val && !(website.keyProducts || []).includes(val)) {
                    updateField("keyProducts", [...(website.keyProducts || []), val]);
                  }
                  setKeyProductInput("");
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const val = keyProductInput.trim();
              if (val && !(website.keyProducts || []).includes(val)) {
                updateField("keyProducts", [...(website.keyProducts || []), val]);
              }
              setKeyProductInput("");
            }}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {(website.keyProducts || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(website.keyProducts || []).map((p) => (
                <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {p}
                  <button type="button" onClick={() => updateField("keyProducts", (website.keyProducts || []).filter((x) => x !== p))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Top Competitors</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Type and press Enter to add"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const val = competitorInput.trim().replace(/,$/, "");
                  if (val && !(website.competitors || []).includes(val)) {
                    updateField("competitors", [...(website.competitors || []), val]);
                  }
                  setCompetitorInput("");
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const val = competitorInput.trim();
              if (val && !(website.competitors || []).includes(val)) {
                updateField("competitors", [...(website.competitors || []), val]);
              }
              setCompetitorInput("");
            }}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {(website.competitors || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(website.competitors || []).map((c) => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium">
                  {c}
                  <button type="button" onClick={() => updateField("competitors", (website.competitors || []).filter((x) => x !== c))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
