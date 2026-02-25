import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  Bot,
  Link2,
  Image as ImageIcon,
  Zap,
  Target,
  Cpu,
  Clock,
  XCircle,
  BarChart3,
  Globe,
  ChevronRight,
  Minus,
  Check,
  Layers,
  Newspaper,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "StackSerp | AI SEO Auto-Blogging & Content Generation Platform",
  description:
    "Dominate search rankings with StackSerp. Our AI automates keyword research, content generation, internal linking, and publishing. The ultimate SEO tool for startups and agencies.",
  keywords: "AI blog writer, SEO automation, auto-blogging, programmatic SEO, content marketing AI, StackSerp",
  openGraph: {
    title: "StackSerp | Automate Your SEO Growth",
    description:
      "Generate months of high-ranking SEO content without writing a single word. AI research, writing, and publishing—all on autopilot.",
    type: "website",
    url: "https://stackserp.com",
    siteName: "StackSerp",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "StackSerp AI SEO Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StackSerp | Automate Your SEO Growth",
    description: "Generate months of high-ranking SEO content without writing a single word.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://stackserp.com" },
};

export default function LandingPage() {
  return (
    <>
      {/* ── HERO ── dark gradient background */}
      <section className="relative overflow-hidden bg-zinc-950 pt-24 pb-0 md:pt-32">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute top-60 -right-40 h-[400px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
          <div className="absolute top-60 -left-40 h-[400px] w-[500px] rounded-full bg-blue-600/15 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
          {/* Announcement badge */}
          <Link
            href="/features"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 hover:bg-white/10 transition-colors mb-8 backdrop-blur-sm animate-fade-in-up"
          >
            <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-semibold text-white">New</span>
            Deep Content Engine v2.0
            <ChevronRight className="h-3 w-3 text-zinc-400" />
          </Link>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[1.05] text-white mb-6 animate-fade-in-up delay-100">
            SEO content{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #60a5fa 100%)" }}
            >
              on autopilot.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            StackSerp researches keywords, writes human-quality articles, builds
            internal links, generates images, and publishes to your CMS.
            Automatically.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 animate-fade-in-up delay-300">
            <Button
              asChild
              size="lg"
              className="h-12 px-7 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40 w-full sm:w-auto"
            >
              <Link href="/register">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-7 text-base font-semibold border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white w-full sm:w-auto"
            >
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>

          <p className="text-sm text-zinc-500 animate-fade-in-up delay-400">
            No credit card required &middot; 5 free articles &middot; Cancel anytime
          </p>

          {/* Product mockup */}
          <div className="relative mt-16 animate-fade-in-up delay-[500ms]">
            {/* Glow behind the mockup */}
            <div className="pointer-events-none absolute inset-x-10 -top-4 h-24 bg-indigo-600/30 blur-2xl" />

            <div
              className="relative rounded-t-2xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ background: "linear-gradient(180deg, #18181b 0%, #09090b 100%)" }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3.5 bg-white/3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="rounded-md bg-white/8 border border-white/10 px-4 py-1 text-xs text-zinc-500 w-56 text-center">
                    app.stackserp.com
                  </div>
                </div>
              </div>

              {/* App UI */}
              <div className="p-5 md:p-8">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                      <Target className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-zinc-100">Content Pipeline</div>
                      <div className="text-xs text-zinc-500">12 articles queued</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>

                {/* Seed keyword bar */}
                <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3 mb-6">
                  <Search className="h-4 w-4 text-zinc-500 shrink-0" />
                  <span className="text-sm text-zinc-400 flex-1">best crm for marketing agencies</span>
                  <span className="rounded-md bg-indigo-600/20 border border-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">
                    Seed keyword
                  </span>
                </div>

                {/* Article cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        title: "Top 10 CRMs for Marketing Agencies in 2025",
                        status: "Published",
                        dot: "bg-emerald-500",
                        bar: "w-full bg-emerald-500",
                        pill: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                        words: "2,340 words",
                      },
                      {
                        title: "How to Choose a CRM for Your Agency",
                        status: "Writing...",
                        dot: "bg-blue-400 animate-pulse",
                        bar: "w-3/5 bg-blue-400",
                        pill: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                        words: "Step 3 of 7",
                      },
                      {
                        title: "CRM vs Project Management: What Agencies Need",
                        status: "Queued",
                        dot: "bg-zinc-600",
                        bar: "w-0",
                        pill: "bg-zinc-700/50 border-zinc-600/30 text-zinc-500",
                        words: "Starting soon",
                      },
                    ] as const
                  ).map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/8 bg-white/3 p-4 text-left"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                          <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${item.pill}`}>
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-600">{item.words}</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-200 leading-snug mb-3">
                        {item.title}
                      </p>
                      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full ${item.bar} transition-all`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom pipeline steps */}
                <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
                  {["Research", "Outline", "Draft", "Tone", "SEO", "Metadata", "Publish"].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                      <div
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                          i < 3
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : i === 3
                              ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                              : "bg-white/4 border border-white/8 text-zinc-600"
                        }`}
                      >
                        {i < 3 && <Check className="h-3 w-3" />}
                        {i === 3 && <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />}
                        {step}
                      </div>
                      {i < 6 && <div className="w-4 h-px bg-white/8" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-zinc-900 border-y border-white/6 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
            {[
              { stat: "10,000+", label: "Articles Generated" },
              { stat: "500+", label: "Active Users" },
              { stat: "~3 min", label: "Avg. Time to Publish" },
              { stat: "WordPress · Ghost · Shopify", label: "CMS Integrations" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 text-center">
                <span className="text-lg font-bold text-white">{item.stat}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-zinc-900">
              Stop doing SEO the hard way.
            </h2>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto">
              Replace your keyword tools, freelance writers, and manual publishing with one automated pipeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Without */}
            <div className="rounded-2xl border border-red-100 bg-red-50/60 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <span className="font-semibold text-zinc-900">Without StackSerp</span>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Hours of keyword research per topic",
                  "Hire and manage freelance writers",
                  "Manually review and edit every draft",
                  "Find and insert internal links yourself",
                  "Format, optimize meta tags, then publish",
                  "Repeat for every single article",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-600">
                    <Minus className="h-4 w-4 mt-0.5 shrink-0 text-red-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-red-100 flex items-center gap-2 text-sm text-zinc-500">
                <Clock className="h-4 w-4 text-red-400" />
                ~8 hours per article
              </div>
            </div>

            {/* With */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="font-semibold text-zinc-900">With StackSerp</span>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Enter one seed keyword, get a full content plan",
                  "AI writes natural, engaging articles",
                  "Tone-matched to your brand automatically",
                  "Internal links injected across your site",
                  "SEO meta, images, and schema handled",
                  "Published to your CMS with one click",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-700">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-emerald-200 flex items-center gap-2 text-sm font-medium text-emerald-700">
                <Zap className="h-4 w-4" />
                ~3 minutes per article
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── dark section */}
      <section id="features" className="py-20 px-4 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-4">
              Everything you need
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              An entire SEO agency in one dashboard.
            </h2>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              From seed keyword to published article — every step handled by AI in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Big card */}
            <div
              className="md:col-span-2 rounded-2xl border border-white/8 p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)" }}
            >
              <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-600/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-indigo-600/30 flex items-center justify-center mb-5">
                  <Target className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Keyword Clustering & Topical Maps</h3>
                <p className="text-zinc-400 leading-relaxed max-w-md mb-5">
                  Enter a seed keyword and get a full topical map. Keywords are grouped by search intent and volume so you build authority without cannibalization.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/20 px-3 py-1 text-xs text-indigo-300">Search Intent</span>
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/20 px-3 py-1 text-xs text-indigo-300">Volume Analysis</span>
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/20 px-3 py-1 text-xs text-indigo-300">Topic Clusters</span>
                </div>
              </div>
            </div>

            {/* Small card */}
            <div
              className="rounded-2xl border border-white/8 p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #2e1065 0%, #0f172a 100%)" }}
            >
              <div className="absolute bottom-0 right-0 h-32 w-32 bg-purple-600/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-purple-600/30 flex items-center justify-center mb-5">
                  <Bot className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Human-Quality Writing</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  AI content that reads naturally, passes detection tools, and matches your brand voice.
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl border border-white/8 p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #052e16 0%, #0f172a 100%)" }}
            >
              <div className="absolute top-0 left-0 h-32 w-32 bg-emerald-600/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-emerald-600/30 flex items-center justify-center mb-5">
                  <Link2 className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Auto Internal Linking</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Scans your site and interlinks posts with contextual anchor text to distribute link equity.
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl border border-white/8 p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #172554 0%, #0f172a 100%)" }}
            >
              <div className="absolute bottom-0 right-0 h-32 w-32 bg-blue-600/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-blue-600/30 flex items-center justify-center mb-5">
                  <ImageIcon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">AI Image Generation</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Unique, context-aware featured images generated for every post. No stock photos.
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl border border-white/8 p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1c1a2e 0%, #0f172a 100%)" }}
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-amber-600/15 rounded-full blur-2xl" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-amber-600/20 flex items-center justify-center mb-5">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Content Scheduling</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Queue articles to publish on your cadence. Keep your blog active on autopilot without manual intervention.
                </p>
              </div>
            </div>

            {/* Wide bottom card */}
            <div
              className="md:col-span-3 rounded-2xl border border-white/8 p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1c0a14 0%, #0f172a 100%)" }}
            >
              <div className="absolute top-0 right-0 h-48 w-72 bg-rose-600/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                  <div className="h-11 w-11 rounded-xl bg-rose-600/20 flex items-center justify-center mb-5">
                    <Zap className="h-5 w-5 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">One-Click CMS Publishing</h3>
                  <p className="text-zinc-400 leading-relaxed max-w-lg">
                    Connect WordPress, Webflow, Shopify, Ghost, or your custom stack. Content is formatted, optimized, and published instantly.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { name: "WordPress", bg: "#21759b", icon: "https://cdn.simpleicons.org/wordpress/ffffff" },
                    { name: "Webflow",   bg: "#4353FF", icon: "https://cdn.simpleicons.org/webflow/ffffff" },
                    { name: "Shopify",   bg: "#96bf48", icon: "https://cdn.simpleicons.org/shopify/ffffff" },
                    { name: "Ghost",     bg: "#15171A", icon: "https://cdn.simpleicons.org/ghost/ffffff" },
                    { name: "Next.js",   bg: "#000000", icon: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
                  ].map((cms) => (
                    <div key={cms.name} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: cms.bg }}
                      >
                        <img src={cms.icon} alt={cms.name} className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-zinc-500">{cms.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── light section */}
      <section className="py-20 px-4 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
              Three steps. That&apos;s it.
            </h2>
            <p className="text-lg text-zinc-500">
              From seed keyword to published article in under 3 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connecting line desktop — spans from center of col1 icon to center of col3 icon */}
            <div className="hidden md:block absolute top-10 left-[calc(100%/6+2.5rem)] right-[calc(100%/6+2.5rem)] h-px bg-gradient-to-r from-indigo-300 via-purple-300 to-blue-300" />

            {[
              {
                step: "1",
                icon: Settings,
                title: "Add your keyword",
                desc: "Enter a seed keyword or connect Google Search Console. We identify what your audience is searching and build a content plan.",
                iconBg: "bg-indigo-100",
                iconColor: "text-indigo-600",
                numBg: "bg-indigo-600",
              },
              {
                step: "2",
                icon: Layers,
                title: "Review the plan",
                desc: "Our AI generates a topical map with clustered keywords. Approve titles, adjust the outline, or let it run on autopilot.",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600",
                numBg: "bg-purple-600",
              },
              {
                step: "3",
                icon: Cpu,
                title: "Generate & publish",
                desc: "We write the article, generate images, inject internal links, optimize for SEO, and publish directly to your CMS.",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                numBg: "bg-blue-600",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="relative inline-flex mb-5">
                  <div className={`h-20 w-20 ${item.iconBg} rounded-2xl flex items-center justify-center`}>
                    <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                  </div>
                  <div className={`absolute -top-2 -right-2 h-6 w-6 ${item.numBg} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
              Built for teams that move fast.
            </h2>
            <p className="text-lg text-zinc-500">
              Whether you run an agency, a startup, or a content portfolio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "Marketing Agencies",
                desc: "Run content for multiple clients from one dashboard. Deliver more without hiring more writers.",
                href: "/use-cases/agencies",
                gradient: "from-blue-50 to-indigo-50",
                border: "border-blue-100 hover:border-blue-300",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                link: "text-blue-600",
              },
              {
                icon: BarChart3,
                title: "SaaS Startups",
                desc: "Rank for your product's keywords without a content team. Get organic signups while you sleep.",
                href: "/use-cases/startups",
                gradient: "from-purple-50 to-violet-50",
                border: "border-purple-100 hover:border-purple-300",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600",
                link: "text-purple-600",
              },
              {
                icon: Newspaper,
                title: "Niche Publishers",
                desc: "Scale affiliate and ad-revenue sites faster. Build deep, authoritative topical silos automatically.",
                href: "/use-cases/publishers",
                gradient: "from-emerald-50 to-green-50",
                border: "border-emerald-100 hover:border-emerald-300",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
                link: "text-emerald-600",
              },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`rounded-2xl border bg-gradient-to-br ${item.gradient} ${item.border} p-8 group hover:shadow-lg transition-all block`}
              >
                <div className={`h-12 w-12 ${item.iconBg} ${item.iconColor} rounded-xl flex items-center justify-center mb-5`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{item.title}</h3>
                <p className="text-zinc-600 leading-relaxed mb-4 text-sm">{item.desc}</p>
                <span className={`text-sm font-semibold ${item.link} inline-flex items-center`}>
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-3">
              Frequently asked questions
            </h2>
            <p className="text-zinc-500">
              Everything you need to know before getting started.
            </p>
          </div>

          <div className="divide-y divide-zinc-200">
            {[
              {
                q: "Is the content detectable as AI?",
                a: "StackSerp uses a multi-step pipeline — research, outline, draft, tone refinement, and SEO pass — that produces natural, fluent prose. The tone-matching step aligns output to your brand voice, making content read like it came from a human writer familiar with your niche.",
              },
              {
                q: "Which CMS platforms do you support?",
                a: "We natively integrate with WordPress, Ghost, and Shopify. Webflow and custom stacks are supported via our REST API and webhook events, so you can push content anywhere.",
              },
              {
                q: "How does the internal linking work?",
                a: "When an article is generated, StackSerp scans your existing published posts, builds a keyword-to-URL map, and injects contextual anchor-text links into the new draft. Existing posts are updated retroactively as new content is published.",
              },
              {
                q: "Can I customize the tone and brand voice?",
                a: "Yes. You provide a brand voice description (or paste a sample article), and the tone-refinement step rewrites the draft to match. Each website in your dashboard can have its own distinct voice.",
              },
              {
                q: "What happens after my 5 free articles?",
                a: "You choose a paid plan that fits your volume — from solo bloggers to high-output agencies. There are no long-term contracts; all plans are billed monthly and can be cancelled at any time.",
              },
            ].map((item, i) => (
              <div key={i} className="py-6">
                <h3 className="text-base font-semibold text-zinc-900 mb-2">{item.q}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── dark */}
      <section className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-6">
            Start growing today
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-5">
            Stop waiting.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)" }}
            >
              Start ranking.
            </span>
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Start with 5 free articles — no credit card, no setup fee, no commitment. See results before you pay a cent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40 w-full sm:w-auto"
            >
              <Link href="/register">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base font-semibold border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white w-full sm:w-auto"
            >
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-zinc-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
