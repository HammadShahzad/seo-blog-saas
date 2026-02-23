"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug } from "lucide-react";
import { toast } from "sonner";
import { WordPressConnectedBanner } from "./wordpress-connected-banner";
import { AppPasswordForm } from "./wordpress-app-password-form";
import { PluginForm } from "./wordpress-plugin-form";

export function WordPressSettings({ websiteId }: { websiteId: string }) {
  const [mode, setMode] = useState<"app-password" | "plugin">("app-password");
  const [connected, setConnected] = useState(false);
  const [connectedUrl, setConnectedUrl] = useState("");
  const [connectedMode, setConnectedMode] = useState<
    "app-password" | "plugin" | null
  >(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [initialAppPasswordUrl, setInitialAppPasswordUrl] = useState("");
  const [initialPluginUrl, setInitialPluginUrl] = useState("");

  useEffect(() => {
    fetch(`/api/websites/${websiteId}/wordpress`)
      .then((r) => r.json())
      .then((d) => {
        if (d.connected) {
          setConnected(true);
          setConnectedUrl(d.siteUrl || "");
          setConnectedMode(d.mode || "app-password");
          if (d.mode === "plugin") {
            setInitialPluginUrl(d.siteUrl || "");
            setMode("plugin");
          } else {
            setInitialAppPasswordUrl(d.siteUrl || "");
          }
        }
      })
      .catch(() => {});
  }, [websiteId]);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await fetch(`/api/websites/${websiteId}/wordpress`, { method: "DELETE" });
      setConnected(false);
      setConnectedUrl("");
      setConnectedMode(null);
      setInitialAppPasswordUrl("");
      setInitialPluginUrl("");
      toast.success("WordPress disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleConnected = (url: string, connectionMode: "app-password" | "plugin") => {
    setConnected(true);
    setConnectedUrl(url);
    setConnectedMode(connectionMode);
  };

  return (
    <div className="space-y-4">
      {connected && (
        <WordPressConnectedBanner
          connectedUrl={connectedUrl}
          connectedMode={connectedMode}
          isDisconnecting={isDisconnecting}
          onDisconnect={handleDisconnect}
        />
      )}

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

      {mode === "app-password" && (
        <AppPasswordForm
          websiteId={websiteId}
          initialSiteUrl={initialAppPasswordUrl}
          onConnected={(url) => handleConnected(url, "app-password")}
        />
      )}

      {mode === "plugin" && (
        <PluginForm
          websiteId={websiteId}
          initialSiteUrl={initialPluginUrl}
          onConnected={(url) => handleConnected(url, "plugin")}
        />
      )}
    </div>
  );
}
