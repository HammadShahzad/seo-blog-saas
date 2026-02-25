import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Plug, Webhook, ShoppingBag, Zap, Code2, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations | StackSerp CMS & Platform Connections",
  description:
    "Connect StackSerp to WordPress, Shopify, Ghost, and any custom CMS via webhook or REST API. Publish AI-generated content directly to your platform in one click.",
  keywords: "StackSerp integrations, WordPress SEO automation, Shopify blog AI, Ghost CMS integration, webhook content publishing",
  openGraph: {
    title: "StackSerp Integrations | Connect Your CMS",
    description: "Publish AI-generated blog posts directly to WordPress, Shopify, Ghost, or any platform via webhook.",
    type: "website",
    url: "https://stackserp.com/integrations",
  },
  alternates: { canonical: "https://stackserp.com/integrations" },
};

const integrations: {
  icon: LucideIcon;
  name: string;
  category: string;
  badge: string;
  accent: string;
  glow: string;
  description: string;
  features: string[];
  setup: string;
}[] = [
  {
    icon: Plug,
    name: "WordPress",
    category: "CMS",
    badge: "Most Popular",
    accent: "text-[#21759b]",
    glow: "bg-[#21759b]/15",
    description:
      "Publish posts directly to any WordPress site using Application Passwords (no plugin required) or our free StackSerp Connector plugin for advanced control, custom post types, and Yoast SEO fields.",
    features: [
      "No plugin required — works with any WordPress 5.6+ site",
      "Optional plugin for custom post types & Yoast fields",
      "Publish as draft or live in one click",
      "Syncs featured images, tags, categories, and meta",
    ],
    setup: "Connect in Settings → WordPress",
  },
  {
    icon: ShoppingBag,
    name: "Shopify",
    category: "E-Commerce",
    badge: "Popular",
    accent: "text-[#5c8a1e]",
    glow: "bg-[#96bf48]/15",
    description:
      "Push blog articles directly to your Shopify store's built-in blog. Automatically select which blog to target, sync tags and excerpts, and publish on a schedule.",
    features: [
      "Direct Shopify Admin API integration",
      "Target any blog in your store",
      "Sync tags, featured images, and excerpts",
      "Publish as draft or live",
    ],
    setup: "Connect in Settings → Shopify",
  },
  {
    icon: Zap,
    name: "Ghost",
    category: "CMS",
    badge: "Headless Ready",
    accent: "text-purple-400",
    glow: "bg-purple-600/15",
    description:
      "Publish to any Ghost blog using the Ghost Admin API. StackSerp generates the post, converts it to Ghost-compatible HTML, and pushes it live — perfect for modern headless content setups.",
    features: [
      "Ghost Admin API integration",
      "Markdown to Ghost HTML conversion",
      "Publishes with featured image and tags",
      "Works with self-hosted and Ghost Pro",
    ],
    setup: "Connect in Settings → Other CMS",
  },
  {
    icon: Webhook,
    name: "Webhook / Custom CMS",
    category: "Universal",
    badge: "Most Flexible",
    accent: "text-orange-400",
    glow: "bg-orange-600/15",
    description:
      "Send every published post to any URL via HTTP POST. Works with Webflow, Make.com, Zapier, n8n, Framer, or your own backend. Each request is signed with HMAC-SHA256 for security.",
    features: [
      "POST to any URL on publish",
      "HMAC-SHA256 request signing",
      "Includes title, slug, HTML, markdown, meta, featured image",
      "Test with one click from the dashboard",
    ],
    setup: "Configure in Settings → Other CMS",
  },
  {
    icon: Code2,
    name: "REST API",
    category: "Developer",
    badge: "For Developers",
    accent: "text-zinc-300",
    glow: "bg-zinc-600/15",
    description:
      "Use StackSerp as a headless content engine. Fetch all your generated posts via our REST API and render them in any frontend — Next.js, Astro, Nuxt, or your own custom setup.",
    features: [
      "Full REST API for all posts, keywords, and websites",
      "API key authentication with scoped permissions",
      "JSON responses with full post metadata and HTML",
      "Rate-limited with generous quotas on all plans",
    ],
    setup: "Generate API keys in Account Settings",
  },
  {
    icon: Globe,
    name: "Hosted Blog",
    category: "Built-In",
    badge: "Zero Setup",
    accent: "text-emerald-400",
    glow: "bg-emerald-600/15",
    description:
      "No external CMS? No problem. StackSerp includes a built-in hosted blog with SEO-optimized pages, sitemap generation, RSS feeds, and IndexNow integration for instant Google indexing.",
    features: [
      "Built-in blog with custom subdomain",
      "Auto-generated XML sitemap and RSS feed",
      "IndexNow for instant Google & Bing indexing",
      "Google Analytics and Search Console integration",
    ],
    setup: "Enabled by default on all accounts",
  },
];

export default function IntegrationsPage() {
  return (
    <>
      {/* ── HERO ── dark */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-6">
            Integrations
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Publish Anywhere,{" "}
            <span className="text-indigo-400">Automatically</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Connect StackSerp to your existing CMS or use our built-in hosted blog. AI-generated content flows directly to where your audience reads it — no copy-pasting, ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40">
              <Link href="/register">
                Connect Your CMS Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base text-zinc-300 border-white/15 bg-transparent hover:bg-white/5 hover:text-white">
              <Link href="/features">See All Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS GRID ── light */}
      <section className="py-16 px-4 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((intg) => {
            const Icon = intg.icon;
            return (
              <div key={intg.name} className="rounded-2xl border border-zinc-200 bg-white p-7 flex flex-col gap-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${intg.glow}`}>
                    <Icon className={`h-6 w-6 ${intg.accent}`} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                      {intg.badge}
                    </span>
                    <span className="text-xs text-zinc-400">{intg.category}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{intg.name}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{intg.description}</p>
                </div>
                <ul className="space-y-2">
                  {intg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4 border-t border-zinc-100">
                  <p className="text-xs text-zinc-400">{intg.setup}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── dark */}
      <section className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-indigo-600/15 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">One Platform. Every CMS.</h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Stop copy-pasting AI content. Let StackSerp publish directly to your platform.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40">
            <Link href="/register">
              Start for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-zinc-500 mt-4">No credit card required</p>
        </div>
      </section>
    </>
  );
}
