"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Globe, Palette, Bot, Share2, Code, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface WebsiteData {
  id: string;
  name: string;
  domain: string;
  niche: string;
  description: string;
  targetAudience: string;
  tone: string;
  brandName: string;
  brandUrl: string;
  primaryColor: string;
  autoPublish: boolean;
  postsPerWeek: number;
  publishTime: string;
  publishDays: string;
  hostingMode: string;
  googleAnalyticsId: string | null;
  twitterApiKey: string | null;
  customDomain: string | null;
}

export default function WebsiteSettingsPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWebsite();
  }, [websiteId]);

  const fetchWebsite = async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}`);
      if (res.ok) {
        setWebsite(await res.json());
      }
    } catch {
      toast.error("Failed to load website settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!website) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(website),
      });
      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string | boolean | number) => {
    setWebsite((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!website) return <p>Website not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Website Settings</h2>
          <p className="text-muted-foreground">
            Configure {website.name}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Globe className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="brand">
            <Palette className="mr-2 h-4 w-4" />
            Brand
          </TabsTrigger>
          <TabsTrigger value="content">
            <Bot className="mr-2 h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="publishing">
            <Share2 className="mr-2 h-4 w-4" />
            Publishing
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Code className="mr-2 h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
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
              <div className="space-y-2">
                <Label>Custom Domain</Label>
                <Input
                  placeholder="blog.yourdomain.com"
                  value={website.customDomain || ""}
                  onChange={(e) => updateField("customDomain", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Set up a CNAME record pointing to our servers
                </p>
              </div>
              <div className="space-y-2">
                <Label>Niche / Industry</Label>
                <Input
                  value={website.niche}
                  onChange={(e) => updateField("niche", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={website.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Textarea
                  value={website.targetAudience}
                  onChange={(e) => updateField("targetAudience", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Used by AI to match your brand voice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input
                    value={website.brandName}
                    onChange={(e) => updateField("brandName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand URL</Label>
                  <Input
                    value={website.brandUrl}
                    onChange={(e) => updateField("brandUrl", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Writing Tone</Label>
                <Input
                  value={website.tone}
                  onChange={(e) => updateField("tone", e.target.value)}
                />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>
                Configure AI content generation preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Publish</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically publish posts after generation
                  </p>
                </div>
                <Switch
                  checked={website.autoPublish}
                  onCheckedChange={(v) => updateField("autoPublish", v)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Posts Per Week</Label>
                <Select
                  value={String(website.postsPerWeek)}
                  onValueChange={(v) => updateField("postsPerWeek", parseInt(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 7, 10, 14].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} post{n !== 1 ? "s" : ""}/week
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Publish Time (UTC)</Label>
                <Input
                  type="time"
                  value={website.publishTime || "09:00"}
                  onChange={(e) => updateField("publishTime", e.target.value)}
                  className="w-32"
                />
              </div>
              <div className="space-y-2">
                <Label>Hosting Mode</Label>
                <Select
                  value={website.hostingMode}
                  onValueChange={(v) => updateField("hostingMode", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOSTED">Hosted (We host your blog)</SelectItem>
                    <SelectItem value="API">API (You fetch via REST API)</SelectItem>
                    <SelectItem value="WEBHOOK">Webhook (Push to your CMS)</SelectItem>
                    <SelectItem value="HYBRID">Hybrid (Hosted + API access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Connect social accounts for auto-posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Twitter/X API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter API key"
                  value={website.twitterApiKey || ""}
                  onChange={(e) => updateField("twitterApiKey", e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                More social platforms coming soon (LinkedIn, Facebook, etc.)
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  placeholder="G-XXXXXXXXXX"
                  value={website.googleAnalyticsId || ""}
                  onChange={(e) =>
                    updateField("googleAnalyticsId", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
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
                  <p className="text-sm text-muted-foreground">
                    Stop all content generation for this website
                  </p>
                </div>
                <Button variant="outline">Pause</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Website</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this website and all its content
                  </p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
