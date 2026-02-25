"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Save, Plug, Zap, Share2, Code, ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { GhostSettings } from "@/components/settings/ghost-settings";
import { WebhookSettings } from "@/components/settings/webhook-settings";
import { WordPressSettings } from "@/components/settings/wordpress-settings";
import { ShopifySettings } from "@/components/settings/shopify-settings";
import { GeneralSettings } from "@/components/settings/general-settings";
import { BrandSettings } from "@/components/settings/brand-settings";
import { ContentSettings } from "@/components/settings/content-settings";
import { InternalLinksSettings } from "@/components/settings/internal-links-settings";
import { SocialSettings } from "@/components/settings/social-settings";
import { AnalyticsSettings } from "@/components/settings/analytics-settings";
import { DangerZoneSettings } from "@/components/settings/danger-zone-settings";
import { AIResearchDialog } from "@/components/settings/ai-research-dialog";
import type { WebsiteData, BlogSettingsData } from "@/components/settings/settings-types";

export default function WebsiteSettingsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const websiteId = params.websiteId as string;
  const { data: sessionData } = useSession();
  const defaultTab = searchParams.get("tab") || "general";
  const isAdmin = sessionData?.user?.systemRole === "ADMIN";

  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [blogSettings, setBlogSettings] = useState<BlogSettingsData>({
    ctaText: null, ctaUrl: null, avoidTopics: [], writingStyle: "informative",
    contentLength: "MEDIUM", includeFAQ: true, includeProTips: true, includeTableOfContents: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [competitorInput, setCompetitorInput] = useState("");
  const [keyProductInput, setKeyProductInput] = useState("");
  const [avoidTopicInput, setAvoidTopicInput] = useState("");
  const [isPausing, setIsPausing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  useEffect(() => {
    fetchWebsite();
  }, [websiteId]);

  const fetchWebsite = async () => {
    try {
      const [siteRes, bsRes] = await Promise.all([
        fetch(`/api/websites/${websiteId}`),
        fetch(`/api/websites/${websiteId}/blog-settings`),
      ]);
      if (siteRes.ok) setWebsite(await siteRes.json());
      if (bsRes.ok) {
        const bs = await bsRes.json();
        if (bs && Object.keys(bs).length > 0) setBlogSettings((prev) => ({ ...prev, ...bs }));
      }
    } catch {
      toast.error("Failed to load website settings");
    } finally {
      setIsLoading(false);
    }
  };

  const buildFinalData = () => {
    const finalWebsite = website ? { ...website } : null;
    const finalBlogSettings = { ...blogSettings };

    if (finalWebsite) {
      if (competitorInput.trim()) {
        const val = competitorInput.trim();
        if (!finalWebsite.competitors?.includes(val)) {
          finalWebsite.competitors = [...(finalWebsite.competitors || []), val];
        }
        setCompetitorInput("");
      }
      if (keyProductInput.trim()) {
        const val = keyProductInput.trim();
        if (!finalWebsite.keyProducts?.includes(val)) {
          finalWebsite.keyProducts = [...(finalWebsite.keyProducts || []), val];
        }
        setKeyProductInput("");
      }
    }
    if (avoidTopicInput.trim()) {
      const val = avoidTopicInput.trim();
      if (!finalBlogSettings.avoidTopics?.includes(val)) {
        finalBlogSettings.avoidTopics = [...(finalBlogSettings.avoidTopics || []), val];
      }
      setAvoidTopicInput("");
    }

    return { finalWebsite, finalBlogSettings };
  };

  const handleSave = async () => {
    if (!website) return;
    const { finalWebsite, finalBlogSettings } = buildFinalData();
    if (!finalWebsite) return;
    setWebsite(finalWebsite);
    setBlogSettings(finalBlogSettings);
    setIsSaving(true);
    try {
      const [siteRes, bsRes] = await Promise.all([
        fetch(`/api/websites/${websiteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalWebsite),
        }),
        fetch(`/api/websites/${websiteId}/blog-settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalBlogSettings),
        }),
      ]);
      if (siteRes.ok && bsRes.ok) {
        toast.success("All settings saved");
      } else if (!siteRes.ok) {
        toast.error("Failed to save website settings");
      } else {
        toast.error("Failed to save content settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string | boolean | number | string[]) => {
    setWebsite((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handlePause = useCallback(async () => {
    if (!website) return;
    const isPaused = website.status === "PAUSED";
    setIsPausing(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isPaused ? "ACTIVE" : "PAUSED" }),
      });
      if (res.ok) {
        toast.success(isPaused ? "Website resumed" : "Website paused — content generation stopped");
        fetchWebsite();
      } else toast.error("Failed to update status");
    } catch { toast.error("Something went wrong"); }
    finally { setIsPausing(false); }
  }, [website, websiteId]);

  const handleDelete = useCallback(async () => {
    if (confirmDelete !== website?.domain) {
      toast.error("Type the domain name to confirm deletion");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELETED" }),
      });
      if (res.ok) {
        toast.success("Website deleted");
        router.push("/dashboard/websites");
      } else toast.error("Failed to delete website");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); }
  }, [confirmDelete, website?.domain, websiteId, router]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">{website.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AIResearchDialog website={website} updateField={updateField} setBlogSettings={setBlogSettings} />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      {website.status === "PAUSED" && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 flex items-center justify-between">
          <p className="text-sm text-yellow-800 font-medium">Website is paused — content generation is stopped.</p>
          <Button variant="outline" size="sm" onClick={handlePause} disabled={isPausing}>
            {isPausing && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Resume
          </Button>
        </div>
      )}

      <GeneralSettings website={website} updateField={updateField} />

      <BrandSettings
        website={website}
        updateField={updateField}
        isAdmin={isAdmin}
        competitorInput={competitorInput}
        setCompetitorInput={setCompetitorInput}
        keyProductInput={keyProductInput}
        setKeyProductInput={setKeyProductInput}
      />

      <ContentSettings
        website={website}
        updateField={updateField}
        blogSettings={blogSettings}
        setBlogSettings={setBlogSettings}
        avoidTopicInput={avoidTopicInput}
        setAvoidTopicInput={setAvoidTopicInput}
      />

      <InternalLinksSettings websiteId={websiteId} />

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Plug className="h-4 w-4 text-primary" />
          Integrations
        </h3>
        <Tabs defaultValue={["wordpress","ghost","shopify","publishing","advanced"].includes(defaultTab) ? defaultTab : "wordpress"}>
          <TabsList className="flex-wrap h-auto mb-4">
            <TabsTrigger value="wordpress"><Plug className="mr-1.5 h-3.5 w-3.5" /> WordPress</TabsTrigger>
            <TabsTrigger value="ghost"><Zap className="mr-1.5 h-3.5 w-3.5" /> Ghost / Webhook</TabsTrigger>
            <TabsTrigger value="shopify"><ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Shopify</TabsTrigger>
            <TabsTrigger value="publishing"><Share2 className="mr-1.5 h-3.5 w-3.5" /> Social</TabsTrigger>
            <TabsTrigger value="advanced"><Code className="mr-1.5 h-3.5 w-3.5" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="wordpress" className="mt-0">
            <WordPressSettings websiteId={websiteId} />
          </TabsContent>

          <TabsContent value="ghost" className="space-y-4 mt-0">
            <GhostSettings websiteId={websiteId} />
            <WebhookSettings websiteId={websiteId} />
          </TabsContent>

          <TabsContent value="shopify" className="mt-0">
            <ShopifySettings websiteId={websiteId} />
          </TabsContent>

          <TabsContent value="publishing" className="mt-0">
            <SocialSettings website={website} updateField={updateField} />
          </TabsContent>

          <TabsContent value="advanced" className="mt-0 space-y-4">
            <AnalyticsSettings website={website} updateField={updateField} />
            <DangerZoneSettings
              website={website}
              isPausing={isPausing}
              isDeleting={isDeleting}
              confirmDelete={confirmDelete}
              setConfirmDelete={setConfirmDelete}
              onPause={handlePause}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
