import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, Zap, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog | StackSerp Product Updates",
  description:
    "See what's new in StackSerp. Follow the latest product updates, feature releases, and improvements to the AI SEO content platform.",
  alternates: { canonical: "https://stackserp.com/changelog" },
};

type ChangeType = "new" | "improvement" | "fix" | "security";

interface Change {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  tag: string;
  tagColor: string;
  summary: string;
  changes: Change[];
}

const releases: Release[] = [
  {
    version: "v2.3.0",
    date: "February 2026",
    tag: "Latest",
    tagColor: "bg-green-500/10 text-green-600",
    summary: "Scheduled publishing, Shopify integration, and post versioning.",
    changes: [
      { type: "new", text: "Shopify blog integration — publish posts directly to any Shopify store" },
      { type: "new", text: "Scheduled auto-publishing with per-website timezone, day, and time settings" },
      { type: "new", text: "Post version history — every edit creates a restorable snapshot" },
      { type: "new", text: "UserJob live progress tracking for AI generation jobs" },
      { type: "improvement", text: "Post editor now shows Publish button for StackSerp hosted blogs" },
      { type: "improvement", text: "WordPress and Shopify push buttons only appear when integrations are connected" },
      { type: "fix", text: "Fixed dashboard crash caused by missing database migration for role and timezone columns" },
    ],
  },
  {
    version: "v2.2.0",
    date: "January 2026",
    tag: "Major",
    tagColor: "bg-primary/10 text-primary",
    summary: "Ghost CMS integration, webhook signing, and internal link automation.",
    changes: [
      { type: "new", text: "Ghost CMS integration via Admin API — full Markdown to Ghost HTML conversion" },
      { type: "new", text: "Webhook integration with HMAC-SHA256 request signing" },
      { type: "new", text: "Internal link pair manager — set keyword→URL pairs for auto-injection" },
      { type: "new", text: "WordPress plugin method — download the StackSerp Connector plugin for advanced control" },
      { type: "improvement", text: "Bulk keyword import from CSV with status tracking" },
      { type: "improvement", text: "AI generator now produces 7-step content pipeline with image generation" },
      { type: "fix", text: "Fixed slug collision when two posts share the same title" },
    ],
  },
  {
    version: "v2.1.0",
    date: "December 2025",
    tag: "Feature",
    tagColor: "bg-blue-500/10 text-blue-600",
    summary: "Topic clusters, content briefs, and IndexNow instant indexing.",
    changes: [
      { type: "new", text: "Topic cluster generator — AI builds full content hubs with pillar + supporting posts" },
      { type: "new", text: "Content brief builder with competitive analysis" },
      { type: "new", text: "IndexNow integration — newly published posts are submitted to Google & Bing instantly" },
      { type: "new", text: "Calendar view showing scheduled and published posts per website" },
      { type: "improvement", text: "SEO score now calculated on every save with granular checklist" },
      { type: "improvement", text: "Multi-website sidebar with quick-switch navigation" },
    ],
  },
  {
    version: "v2.0.0",
    date: "November 2025",
    tag: "Major Release",
    tagColor: "bg-purple-500/10 text-purple-600",
    summary: "Complete platform rebuild with multi-website support and AI generation engine.",
    changes: [
      { type: "new", text: "Multi-tenant architecture — manage unlimited websites per organization" },
      { type: "new", text: "Deep Content Engine — 7-step AI pipeline: research, outline, draft, SEO, metadata, image" },
      { type: "new", text: "WordPress integration via Application Password (no plugin required)" },
      { type: "new", text: "Perplexity-powered real-time web research for factual accuracy" },
      { type: "new", text: "Team management with role-based access control" },
      { type: "new", text: "Stripe billing integration with FREE, STARTER, GROWTH, and AGENCY plans" },
      { type: "improvement", text: "Complete UI redesign with dark mode support" },
    ],
  },
];

const typeConfig: Record<ChangeType, { icon: React.ElementType; label: string; color: string }> = {
  new: { icon: Sparkles, label: "New", color: "text-green-600 bg-green-500/10" },
  improvement: { icon: Zap, label: "Improved", color: "text-blue-600 bg-blue-500/10" },
  fix: { icon: Wrench, label: "Fixed", color: "text-orange-600 bg-orange-500/10" },
  security: { icon: Shield, label: "Security", color: "text-red-600 bg-red-500/10" },
};

export default function ChangelogPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-24 px-4 text-center border-b">
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-none">
            Changelog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Product Updates
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            New features, improvements, and fixes — shipped regularly. Follow along to stay up to date.
          </p>
        </div>
      </section>

      {/* Releases */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-12">
              {releases.map((release) => (
                <div key={release.version} className="md:pl-14 relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-2 hidden md:flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-primary font-bold text-xs">
                    {release.version.split(".")[0]}
                  </div>

                  {/* Release card */}
                  <div className="rounded-2xl border bg-card p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h2 className="text-2xl font-bold">{release.version}</h2>
                      <Badge className={`text-xs font-medium ${release.tagColor} border-none`}>{release.tag}</Badge>
                      <span className="text-sm text-muted-foreground ml-auto">{release.date}</span>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{release.summary}</p>

                    <ul className="space-y-3">
                      {release.changes.map((change, i) => {
                        const cfg = typeConfig[change.type];
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${cfg.color}`}>
                              <cfg.icon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                            <span className="text-sm leading-relaxed">{change.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
