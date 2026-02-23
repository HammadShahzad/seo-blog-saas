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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plug,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export function WordPressSettings({ websiteId }: { websiteId: string }) {
  const [mode, setMode] = useState<"app-password" | "plugin">("app-password");

  // App-password fields
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Plugin fields
  const [pluginSiteUrl, setPluginSiteUrl] = useState("");
  const [pluginApiKey, setPluginApiKey] = useState("");
  const [showPluginKey, setShowPluginKey] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    siteName?: string;
    userName?: string;
    version?: string;
    error?: string;
  } | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectedUrl, setConnectedUrl] = useState("");
  const [connectedMode, setConnectedMode] = useState<
    "app-password" | "plugin" | null
  >(null);

  useEffect(() => {
    fetch(`/api/websites/${websiteId}/wordpress`)
      .then((r) => r.json())
      .then((d) => {
        if (d.connected) {
          setConnected(true);
          setConnectedUrl(d.siteUrl || "");
          setConnectedMode(d.mode || "app-password");
          if (d.mode === "plugin") {
            setPluginSiteUrl(d.siteUrl || "");
            setMode("plugin");
          } else {
            setSiteUrl(d.siteUrl || "");
          }
        }
      })
      .catch(() => {});
  }, [websiteId]);

  // ── App-password handlers ──
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
        body: JSON.stringify({
          action: "test",
          mode: "app-password",
          siteUrl,
          username,
          appPassword,
        }),
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
      toast.error("Fill in Site URL, username, and application password");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/wordpress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "app-password", siteUrl, username, appPassword }),
      });
      if (res.ok) {
        setConnected(true);
        setConnectedUrl(siteUrl);
        setConnectedMode("app-password");
        toast.success("WordPress connected!");
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

  // ── Plugin handlers ──
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
        setConnected(true);
        setConnectedUrl(pluginSiteUrl);
        setConnectedMode("plugin");
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

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await fetch(`/api/websites/${websiteId}/wordpress`, { method: "DELETE" });
      setConnected(false);
      setConnectedUrl("");
      setConnectedMode(null);
      setSiteUrl("");
      setUsername("");
      setAppPassword("");
      setPluginSiteUrl("");
      setPluginApiKey("");
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
                <p className="text-sm text-green-700">
                  {connectedUrl}
                  {connectedMode && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                      {connectedMode === "plugin"
                        ? "Plugin method"
                        : "App Password"}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-green-300 text-green-800"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Disconnect"
              )}
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
            Choose how StackSerp connects to your WordPress site
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
                description:
                  "No plugin needed. Works with any WordPress 5.6+ site. Uses built-in Application Passwords.",
              },
              {
                id: "plugin" as const,
                title: "Plugin Method",
                badge: "Download Required",
                badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
                description:
                  "Download and install our free plugin for custom post types, extra fields, and advanced control.",
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
            <CardTitle className="text-base">
              Connect via Application Password
            </CardTitle>
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
                <li>Scroll to &quot;Application Passwords&quot; section</li>
                <li>
                  Type &quot;StackSerp&quot; and click &quot;Add New Application
                  Password&quot;
                </li>
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {testResult && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  testResult.success
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                )}
                <div>
                  {testResult.success ? (
                    <>
                      Connected to <strong>{testResult.siteName}</strong> as{" "}
                      <strong>{testResult.userName}</strong>
                    </>
                  ) : (
                    testResult.error
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || isSaving}
              >
                {isTesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Test Connection
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isTesting}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
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
      )}
    </div>
  );
}
