import type { Metadata } from "next";
import { DocsHero } from "@/components/docs/docs-hero";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { QuickStartSection } from "@/components/docs/quick-start-section";
import { ApiKeysSection } from "@/components/docs/api-keys-section";
import { RestApiSection } from "@/components/docs/rest-api-section";
import { WebhooksSection } from "@/components/docs/webhooks-section";
import { WordPressSection, ShopifySection, GhostSection, WebflowSection } from "@/components/docs/cms-integrations";
import { AiAgentSection } from "@/components/docs/ai-agent-section";
import { DocsCta } from "@/components/docs/docs-cta";

export const metadata: Metadata = {
  title: "Developer Docs | StackSerp Integration Guide",
  description:
    "Connect your app, website, or AI agent to StackSerp. Full API reference, webhook setup, CMS integration guides, and a ready-to-use AI agent prompt.",
  keywords: "StackSerp API, webhook integration, REST API docs, connect CMS to StackSerp, developer guide",
  openGraph: {
    title: "StackSerp Developer Docs",
    description: "Connect any CMS or custom app to StackSerp via REST API, webhooks, or direct integrations.",
    type: "website",
    url: "https://stackserp.com/docs",
  },
  alternates: { canonical: "https://stackserp.com/docs" },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DocsHero />
      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        <DocsSidebar />
        <main className="flex-1 min-w-0 space-y-20">
          <QuickStartSection />
          <ApiKeysSection />
          <RestApiSection />
          <WebhooksSection />
          <WordPressSection />
          <ShopifySection />
          <GhostSection />
          <WebflowSection />
          <AiAgentSection />
          <DocsCta />
        </main>
      </div>
    </div>
  );
}
