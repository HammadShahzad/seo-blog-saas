import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Globe,
  Search,
  FileText,
  Plug,
  Share2,
  BarChart3,
  Network,
  CalendarDays,
  Code2,
  CheckCircle2,
  Zap,
  ImageIcon,
  Link2,
  Tags,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features | StackSerp AI Content & SEO Platform",
  description:
    "Explore StackSerp's powerful features: AI content generation, multi-website management, automated internal linking, CMS integrations, and programmatic SEO.",
  keywords: "StackSerp features, AI SEO tools, programmatic SEO software, automated content creation",
  openGraph: {
    title: "StackSerp Features | Automate Your SEO",
    description:
      "From keyword clustering to one-click CMS publishing, discover how StackSerp replaces your entire content team.",
    type: "website",
    url: "https://stackserp.com/features",
  },
  alternates: {
    canonical: "https://stackserp.com/features",
  },
};

const features: { icon: LucideIcon; title: string; slug: string; description: string; bullets: string[]; accent: string; glow: string }[] = [
  {
    icon: Brain,
    title: "AI Content Generation",
    slug: "ai-content",
    description: "7-step pipeline: research, outline, draft, tone match, SEO optimize, metadata, and featured image.",
    bullets: ["Real-time web research", "Brand voice matching", "1,500–2,500 word articles", "AI-generated featured image"],
    accent: "text-indigo-400",
    glow: "bg-indigo-600/20",
  },
  {
    icon: Globe,
    title: "Multi-Website Management",
    slug: "multi-website",
    description: "One dashboard for all your websites — each with its own keywords, settings, and publishing schedule.",
    bullets: ["Separate keyword queues", "Individual brand voices", "Per-site analytics", "Team permissions"],
    accent: "text-purple-400",
    glow: "bg-purple-600/20",
  },
  {
    icon: Search,
    title: "SEO Engine",
    slug: "seo-engine",
    description: "Every post is automatically optimized with meta tags, structured data, and on-page SEO scoring.",
    bullets: ["Auto meta titles & descriptions", "JSON-LD schema markup", "Content quality scoring", "IndexNow indexing"],
    accent: "text-blue-400",
    glow: "bg-blue-600/20",
  },
  {
    icon: Plug,
    title: "CMS Integrations",
    slug: "cms-integrations",
    description: "Push finished posts directly to WordPress, Ghost, Shopify, Webflow, or any platform via webhook.",
    bullets: ["WordPress REST API", "Ghost & Shopify support", "Webflow CMS collections", "Custom webhooks"],
    accent: "text-rose-400",
    glow: "bg-rose-600/20",
  },
  {
    icon: Link2,
    title: "Internal Linking Engine",
    slug: "internal-linking",
    description: "Automatically suggests and inserts contextual internal links to boost your site's link equity.",
    bullets: ["Keyword-to-URL mapping", "Auto-insert in new posts", "Avoids duplicate links", "Manual link overrides"],
    accent: "text-amber-400",
    glow: "bg-amber-600/20",
  },
  {
    icon: Network,
    title: "Topic Clusters",
    slug: "topic-clusters",
    description: "AI plans your entire content strategy — pillar pages and supporting articles that build topical authority.",
    bullets: ["Pillar + cluster generation", "Auto internal link mapping", "Topical authority scoring", "Cluster analytics"],
    accent: "text-emerald-400",
    glow: "bg-emerald-600/20",
  },
  {
    icon: Share2,
    title: "Social Publishing",
    slug: "social-publishing",
    description: "Automatically share new posts on Twitter/X and LinkedIn with platform-optimized captions.",
    bullets: ["Twitter/X auto-posting", "LinkedIn auto-sharing", "Captions per platform", "Scheduled social posts"],
    accent: "text-cyan-400",
    glow: "bg-cyan-600/20",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    slug: "analytics",
    description: "Connect Google Search Console and track traffic, rankings, and content performance in real time.",
    bullets: ["Search Console integration", "Per-post traffic data", "Keyword ranking tracking", "Monthly reports"],
    accent: "text-green-400",
    glow: "bg-green-600/20",
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    slug: "content-calendar",
    description: "Visual calendar showing your entire content pipeline — scheduled, in-progress, and published.",
    bullets: ["Month / week / day views", "Drag-and-drop scheduling", "Multi-site overlay", "Bulk scheduling"],
    accent: "text-violet-400",
    glow: "bg-violet-600/20",
  },
  {
    icon: Code2,
    title: "Public REST API",
    slug: "rest-api",
    description: "Automate everything programmatically — create posts, trigger generation, pull analytics.",
    bullets: ["API key auth", "Webhook events", "All dashboard features via API", "Full documentation"],
    accent: "text-orange-400",
    glow: "bg-orange-600/20",
  },
  {
    icon: ImageIcon,
    title: "AI Image Generation",
    slug: "ai-images",
    description: "Every post gets a unique, high-quality featured image generated by Gemini AI and uploaded automatically.",
    bullets: ["Gemini Flash image pipeline", "Niche-aware style selection", "1200×630 WebP output", "Custom prompt override"],
    accent: "text-pink-400",
    glow: "bg-pink-600/20",
  },
  {
    icon: Tags,
    title: "Metadata & Schema",
    slug: "metadata-schema",
    description: "Auto-generated SEO metadata and structured data for every post — including social captions.",
    bullets: ["Meta title & description", "Article schema markup", "Twitter + OG tags", "Social captions for 4 platforms"],
    accent: "text-teal-400",
    glow: "bg-teal-600/20",
  },
];

const pipeline = [
  { step: "01", label: "Research", desc: "Real-time competitor & web analysis" },
  { step: "02", label: "Outline", desc: "Structured H2/H3 content plan" },
  { step: "03", label: "Draft", desc: "Full long-form article written" },
  { step: "04", label: "Tone", desc: "Brand voice refinement pass" },
  { step: "05", label: "SEO", desc: "Keywords, links & structure optimized" },
  { step: "06", label: "Metadata", desc: "Meta tags, schema & social captions" },
  { step: "07", label: "Image", desc: "AI-generated featured image" },
];

export default function FeaturesPage() {
  return (
    <>
      {/* ── HERO ── dark */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-6">
            <Sparkles className="inline h-3 w-3 mr-1 -mt-0.5" />
            Full Feature Set
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            Everything you need to{" "}
            <span className="text-indigo-400">dominate search</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            One platform replaces your entire content marketing stack — from research to published, promoted, and tracked.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40">
              <Link href="/register">
                Start for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base text-zinc-300 border-white/15 bg-transparent hover:bg-white/5 hover:text-white">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 7-STEP PIPELINE ── dark */}
      <section className="bg-zinc-900 border-y border-white/6 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-4">
              <Zap className="inline h-3 w-3 mr-1 -mt-0.5" />
              AI Pipeline
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">From keyword to published in 7 steps</h2>
            <p className="text-zinc-400 mt-2">Every post goes through the full pipeline automatically</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {pipeline.map((p, i) => (
              <div key={p.step} className="relative flex flex-col items-center text-center gap-2">
                {i < pipeline.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] w-full h-px bg-white/10" />
                )}
                <div className="h-10 w-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 z-10">
                  {p.step}
                </div>
                <p className="text-xs font-semibold text-white">{p.label}</p>
                <p className="text-xs text-zinc-500 leading-tight hidden sm:block">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID ── light */}
      <section className="py-20 px-4 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-3">All features at a glance</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Everything StackSerp does — no fluff, no filler.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  id={f.slug}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 flex flex-col gap-4 hover:shadow-md transition-shadow scroll-mt-24"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${f.glow} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${f.accent}`} />
                    </div>
                    <p className="font-semibold text-zinc-900">{f.title}</p>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
                  <ul className="space-y-1.5 mt-auto">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-zinc-500">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── dark */}
      <section className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-indigo-600/15 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to automate your content marketing?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Start free — no credit card required. Your first 5 posts are on us.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40 w-full sm:w-auto">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base text-zinc-300 border-white/15 bg-transparent hover:bg-white/5 hover:text-white w-full sm:w-auto">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
