"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function GhostSettings({ websiteId }: { websiteId: string }) {
  const [siteUrl, setSiteUrl] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; siteName?: string; error?: string } | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch(`/api/websites/${websiteId}/ghost`)
      .then(r => r.json())
      .then(d => { if (d.connected) { setConnected(true); setSiteUrl(d.siteUrl || ""); } })
      .catch(() => {});
  }, [websiteId]);

  const handleTest = async () => {
    setIsTesting(true); setTestResult(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}/ghost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", siteUrl, adminApiKey }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) toast.success("Ghost connection successful!"); else toast.error(data.error || "Connection failed");
    } catch { toast.error("Test failed"); }
    finally { setIsTesting(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/ghost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, adminApiKey }),
      });
      if (res.ok) { setConnected(true); toast.success("Ghost connected!"); }
      else toast.error("Failed to save");
    } catch { toast.error("Something went wrong"); }
    finally { setIsSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4" />
          Ghost CMS
        </CardTitle>
        <CardDescription>Publish posts directly to your Ghost blog</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            Ghost connected — {siteUrl}
          </div>
        )}
        <div className="space-y-2">
          <Label>Ghost Site URL</Label>
          <Input placeholder="https://yourblog.ghost.io" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Admin API Key</Label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="id:secret (from Ghost Admin → Integrations)"
              value={adminApiKey}
              onChange={e => setAdminApiKey(e.target.value)}
              className="pr-10 font-mono text-sm"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowKey(v => !v)}>
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ghost Admin → Integrations → Add custom integration → Copy Admin API Key
          </p>
        </div>
        {testResult && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {testResult.success ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" /> : <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />}
            {testResult.success ? <>Connected to <strong>{testResult.siteName}</strong></> : testResult.error}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleTest} disabled={isTesting || !siteUrl || !adminApiKey}>
            {isTesting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Test
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !siteUrl || !adminApiKey}>
            {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
