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
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Save, Globe, Palette, Bot, Share2, Code, AlertTriangle,
  CheckCircle2, XCircle, Download, Eye, EyeOff, ExternalLink, Plug,
} from "lucide-react";
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
        <TabsList className="flex-wrap h-auto">
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
          <TabsTrigger value="wordpress">
            <Plug className="mr-2 h-4 w-4" />
            WordPress
          </TabsTrigger>
          <TabsTrigger value="publishing">
            <Share2 className="mr-2 h-4 w-4" />
            Social
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

        <TabsContent value="wordpress" className="space-y-4 mt-4">
          <WordPressSettings websiteId={websiteId} />
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

        <TabsContent value="advanced" className="mt-4 space-y-4">
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

// ─────────────────────────────────────────────────────
// WordPress Settings Component
// ─────────────────────────────────────────────────────
function WordPressSettings({ websiteId }: { websiteId: string }) {
  const [mode, setMode] = useState<"app-password" | "plugin">("app-password");
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; siteName?: string; userName?: string; error?: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectedUrl, setConnectedUrl] = useState("");

  useEffect(() => {
    fetch(`/api/websites/${websiteId}/wordpress`)
      .then((r) => r.json())
      .then((d) => {
        if (d.connected) {
          setConnected(true);
          setConnectedUrl(d.siteUrl || "");
          setSiteUrl(d.siteUrl || "");
        }
      })
      .catch(() => {});
  }, [websiteId]);

  const handleTest = async () => {
    if (!siteUrl || !username || !appPassword) {
      toast.error("Fill in all fields before testing");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}/wordpress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", siteUrl, username, appPassword }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) toast.success("Connection successful!");
      else toast.error(data.error || "Connection failed");
    } catch {
      toast.error("Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!siteUrl || !username || !appPassword) {
      toast.error("Fill in all fields");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/wordpress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, username, appPassword }),
      });
      if (res.ok) {
        setConnected(true);
        setConnectedUrl(siteUrl);
        toast.success("WordPress connected!");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await fetch(`/api/websites/${websiteId}/wordpress`, { method: "DELETE" });
      setConnected(false);
      setConnectedUrl("");
      setSiteUrl("");
      setUsername("");
      setAppPassword("");
      setTestResult(null);
      toast.success("WordPress disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Connected banner */}
      {connected && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">WordPress Connected</p>
                <p className="text-sm text-green-700">{connectedUrl}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-green-300 text-green-800"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disconnect"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mode selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="h-4 w-4" />
            WordPress Integration
          </CardTitle>
          <CardDescription>
            Choose how BlogForge connects to your WordPress site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                id: "app-password" as const,
                title: "Application Password",
                badge: "Recommended",
                badgeColor: "bg-green-50 text-green-700 border-green-200",
                description: "No plugin needed. Works with any WordPress 5.6+ site. Uses built-in Application Passwords.",
              },
              {
                id: "plugin" as const,
                title: "Plugin Method",
                badge: "Download Required",
                badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
                description: "Download and install our free plugin for custom post types, extra fields, and advanced control.",
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMode(opt.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  mode === opt.id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{opt.title}</p>
                  <Badge variant="outline" className={`text-[10px] ${opt.badgeColor}`}>
                    {opt.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* App Password setup */}
      {mode === "app-password" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connect via Application Password</CardTitle>
            <CardDescription>
              <a
                href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                How to create an Application Password
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <p className="font-medium">Quick setup:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground text-xs">
                <li>Go to your WordPress admin → Users → Profile</li>
                <li>Scroll to "Application Passwords" section</li>
                <li>Type "BlogForge" and click "Add New Application Password"</li>
                <li>Copy the generated password (shown once)</li>
                <li>Paste it below</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label>WordPress Site URL</Label>
              <Input
                placeholder="https://yoursite.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  placeholder="your_wp_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label>Application Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pr-10 font-mono"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {testResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                )}
                <div>
                  {testResult.success ? (
                    <>Connected to <strong>{testResult.siteName}</strong> as <strong>{testResult.userName}</strong></>
                  ) : (
                    testResult.error
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTest} disabled={isTesting || isSaving}>
                {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Test Connection
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isTesting}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save & Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plugin method */}
      {mode === "plugin" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">BlogForge WordPress Plugin</CardTitle>
            <CardDescription>
              Install our free plugin for advanced WordPress integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl border bg-muted/30">
              <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                <Plug className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">BlogForge Connector Plugin</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Free plugin · Works with all WordPress themes · Supports Yoast SEO, custom post types, and more
                </p>
                <div className="flex gap-2 mt-3">
                  <Button asChild size="sm">
                    <a href="/downloads/blogforge-connector.php" download>
                      <Download className="mr-2 h-3.5 w-3.5" />
                      Download Plugin (.php)
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium">Installation steps:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>Download the plugin file above</li>
                <li>Go to WordPress Admin → Plugins → Add New → Upload Plugin</li>
                <li>Upload the <code className="bg-muted px-1 rounded text-xs">blogforge-connector.php</code> file</li>
                <li>Activate the plugin</li>
                <li>Go to Settings → BlogForge and copy your API key</li>
                <li>Come back here and enter your site URL + API key below</li>
              </ol>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium">Enter Plugin Connection Details</p>
              <div className="space-y-2">
                <Label>WordPress Site URL</Label>
                <Input
                  placeholder="https://yoursite.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Plugin API Key</Label>
                <Input
                  type="password"
                  placeholder="From Settings → BlogForge in your WP admin"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !siteUrl || !appPassword}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
