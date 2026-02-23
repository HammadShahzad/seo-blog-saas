"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plug,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface PluginFormProps {
  websiteId: string;
  initialSiteUrl: string;
  onConnected: (url: string) => void;
}

export function PluginForm({
  websiteId,
  initialSiteUrl,
  onConnected,
}: PluginFormProps) {
  const [pluginSiteUrl, setPluginSiteUrl] = useState(initialSiteUrl);
  const [pluginApiKey, setPluginApiKey] = useState("");
  const [showPluginKey, setShowPluginKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    siteName?: string;
    userName?: string;
    version?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (initialSiteUrl) setPluginSiteUrl(initialSiteUrl);
  }, [initialSiteUrl]);

  const handlePluginTest = async () => {
    if (!pluginSiteUrl || !pluginApiKey) {
      toast.error("Enter your WordPress site URL and API key");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}/wordpress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          mode: "plugin",
          siteUrl: pluginSiteUrl,
          pluginApiKey,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) toast.success("Plugin connection successful!");
      else toast.error(data.error || "Plugin connection failed — check the API key");
    } catch {
      toast.error("Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handlePluginSave = async () => {
    if (!pluginSiteUrl || !pluginApiKey) {
      toast.error("Enter your WordPress site URL and API key");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/wordpress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "plugin",
          siteUrl: pluginSiteUrl,
          pluginApiKey,
        }),
      });
      if (res.ok) {
        onConnected(pluginSiteUrl);
        toast.success("WordPress plugin connected!");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          StackSerp WordPress Plugin
        </CardTitle>
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
            <p className="font-semibold">StackSerp Connector Plugin</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Free plugin · Works with all WordPress themes · Supports Yoast
              SEO, custom post types, and more
            </p>
            <div className="flex gap-2 mt-3">
              <Button asChild size="sm">
                <a
                  href="/api/download/plugin"
                  download="stackserp-connector.zip"
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Download Plugin (.zip)
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">Installation steps:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>Download the plugin file above</li>
            <li>
              Go to WordPress Admin → Plugins → Add New → Upload Plugin
            </li>
            <li>
              Upload the{" "}
              <code className="bg-muted px-1 rounded text-xs">
                stackserp-connector.zip
              </code>{" "}
              file
            </li>
            <li>Activate the plugin</li>
            <li>
              Go to Settings → StackSerp and copy your API key
            </li>
            <li>Come back here and enter your site URL + API key below</li>
          </ol>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium">
            Enter Plugin Connection Details
          </p>
          <div className="space-y-2">
            <Label>WordPress Site URL</Label>
            <Input
              placeholder="https://yoursite.com"
              value={pluginSiteUrl}
              onChange={(e) => setPluginSiteUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Plugin API Key</Label>
            <div className="relative">
              <Input
                type={showPluginKey ? "text" : "password"}
                placeholder="From Settings → StackSerp in your WP admin"
                value={pluginApiKey}
                onChange={(e) => setPluginApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPluginKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPluginKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {testResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                testResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                {testResult.success ? (
                  <p className="font-medium text-green-800">
                    Plugin connected! Version:{" "}
                    {testResult.version ?? "1.0"}
                  </p>
                ) : (
                  <p className="font-medium text-red-800">
                    {testResult.error ||
                      "Connection failed — check your API key"}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePluginTest}
              disabled={isTesting || !pluginSiteUrl || !pluginApiKey}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Test Connection
            </Button>
            <Button
              onClick={handlePluginSave}
              disabled={isSaving || !pluginSiteUrl || !pluginApiKey}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Connection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
