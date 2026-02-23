"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Webhook, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function WebhookSettings({ websiteId }: { websiteId: string }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch(`/api/websites/${websiteId}/webhook`)
      .then(r => r.json())
      .then(d => { if (d.connected) { setConnected(true); setWebhookUrl(d.webhookUrl || ""); } })
      .catch(() => {});
  }, [websiteId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, webhookSecret }),
      });
      if (res.ok) { setConnected(true); toast.success("Webhook saved!"); }
      else toast.error("Failed to save webhook");
    } catch { toast.error("Something went wrong"); }
    finally { setIsSaving(false); }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", webhookUrl, webhookSecret }),
      });
      const data = await res.json();
      if (data.success) toast.success(`Webhook test sent! Server responded ${data.statusCode}`);
      else toast.error(data.error || "Test failed");
    } catch { toast.error("Test failed"); }
    finally { setIsTesting(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Webhook className="h-4 w-4" />
          Webhook / Custom CMS
        </CardTitle>
        <CardDescription>
          POST every published post to any URL — works with Webflow, Make, Zapier, n8n, custom APIs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            Webhook active — {webhookUrl}
          </div>
        )}
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <Input placeholder="https://yourapp.com/api/content" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Secret (optional)</Label>
          <div className="relative">
            <Input
              type={showSecret ? "text" : "password"}
              placeholder="Used to sign requests with HMAC-SHA256"
              value={webhookSecret}
              onChange={e => setWebhookSecret(e.target.value)}
              className="pr-10"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowSecret(v => !v)}>
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            We&apos;ll send <code className="bg-muted px-1 rounded">X-StackSerp-Signature: sha256=…</code> with each request
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Payload includes:</p>
          <p>title, slug, content (Markdown + HTML), excerpt, metaTitle, metaDescription, focusKeyword, featuredImage, tags, wordCount, publishedAt</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleTest} disabled={isTesting || !webhookUrl}>
            {isTesting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Test Webhook
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !webhookUrl}>
            {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
