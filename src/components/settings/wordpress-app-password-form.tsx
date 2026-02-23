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
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface AppPasswordFormProps {
  websiteId: string;
  initialSiteUrl: string;
  onConnected: (url: string) => void;
}

export function AppPasswordForm({
  websiteId,
  initialSiteUrl,
  onConnected,
}: AppPasswordFormProps) {
  const [siteUrl, setSiteUrl] = useState(initialSiteUrl);
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (initialSiteUrl) setSiteUrl(initialSiteUrl);
  }, [initialSiteUrl]);

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
        onConnected(siteUrl);
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

  return (
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
  );
}
