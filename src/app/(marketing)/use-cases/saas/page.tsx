import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  Target,
  Code2,
  Globe,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "StackSerp for SaaS Companies | Turn Your Blog Into a Lead Machine",
  description:
    "SaaS companies rely on inbound. StackSerp automates SEO content, competitor comparisons, and integration landing pages — generating high-intent leads on autopilot.",
  keywords: "SaaS SEO, AI content for SaaS, comparison page generator, SaaS blog automation, inbound leads",
  openGraph: {
    title: "StackSerp for SaaS | Automate Your Inbound SEO",
    description:
      "Target competitor comparison keywords, generate integration pages, and build feature-specific clusters that capture users searching for your solution.",
    type: "website",
    url: "https://stackserp.com/use-cases/saas",
  },
  alternates: { canonical: "https://stackserp.com/use-cases/saas" },
};

const challenges: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Search,
    title: "Competitors are ranking for your keywords",
    description:
      "Your product is better but buyers are finding Jasper, Notion, or HubSpot first. Generic blog posts won't outrank established players. You need intent-matched, deeply optimized content at scale.",
  },
  {
    icon: Users,
    title: "Your team is too small to produce content consistently",
    description:
      "Hiring writers is expensive and slow. In-house SEO requires months of ramp time. Meanwhile, competitors are publishing 20+ articles per month and compounding their authority.",
  },
  {
    icon: BarChart3,
    title: "You can't measure content ROI",
    description:
      "Traditional content agencies give you a pile of posts with no tracking. You need to see which keywords move, which posts convert, and where to invest next.",
  },
];

const features: { icon: LucideIcon; title: string; description: string; badge: string }[] = [
  {
    icon: Target,
    title: "Competitor comparison pages on autopilot",
    description:
      "StackSerp identifies high-intent comparison keywords like \"[Competitor] vs [Your Brand]\", \"[Competitor] alternatives\", and \"best [category] tools\" and generates fully-optimized pages for every single one. These convert at 3-5x the rate of generic blog traffic.",
    badge: "Highest converting",
  },
  {
    icon: Globe,
    title: "Integration landing pages at scale",
    description:
      "Integrate with Zapier? Connect to Salesforce? There's a long-tail keyword for every integration you support. StackSerp generates SEO-optimized landing pages for every tool in your ecosystem — turning your integrations page into a traffic machine.",
    badge: "Long-tail dominance",
  },
  {
    icon: Code2,
    title: "Feature-specific content clusters",
    description:
      "Group your content by feature topic — AI writing, workflow automation, analytics dashboards. StackSerp builds interconnected topical clusters that establish deep authority, so Google ranks your entire feature set, not just your homepage.",
    badge: "Topical authority",
  },
  {
    icon: Zap,
    title: "IndexNow for instant Google indexing",
    description:
      "Every post published through StackSerp is automatically submitted to Google and Bing via IndexNow. New content can start appearing in search results within hours, not weeks.",
    badge: "Speed to rank",
  },
  {
    icon: TrendingUp,
    title: "Keyword tracking baked in",
    description:
      "See exactly how your keywords are performing — volume, difficulty, ranking status. StackSerp tracks your target keywords and shows you which content investments are paying off.",
    badge: "Built-in analytics",
  },
];

const results = [
  { metric: "2.3x", label: "Faster ranking than manual content" },
  { metric: "14 days", label: "Average time to first page-1 keyword" },
  { metric: "80%", label: "Of SEO workflow automated" },
  { metric: "$2k/mo", label: "Average agency stack savings" },
];

const workflow = [
  {
    step: "1",
    title: "Import your keyword list",
    description:
      "Paste in your target keywords or let StackSerp's AI suggest comparison, alternative, and integration keywords based on your niche. Bulk import hundreds in one click.",
  },
  {
    step: "2",
    title: "AI generates fully-optimized posts",
    description:
      "StackSerp's engine researches the SERP, builds a topical outline, writes E-E-A-T-optimized content, generates a featured image, and adds internal links — all automatically.",
  },
  {
    step: "3",
    title: "Review and publish",
    description:
      "Posts land in your dashboard ready to review. Publish directly to your CMS (WordPress, Shopify, Ghost, headless), your StackSerp hosted blog, or push via webhook to any platform.",
  },
  {
    step: "4",
    title: "Watch keywords climb",
    description:
      "Track your keywords inside StackSerp. As articles rank, internal links automatically strengthen your newer posts. Your domain authority compounds over time.",
  },
];

export default function SaaSUseCasePage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none">
            StackSerp for SaaS
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Turn your SaaS blog into a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-primary">
              lead generation machine
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            SaaS companies live and die by inbound. StackSerp automates competitor comparisons, integration landing
            pages, and feature content clusters — capturing high-intent buyers before they find your competition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 rounded-full">
              <Link href="/register">
                Start Free — No credit card <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {results.map((r) => (
            <div key={r.metric}>
              <div className="text-3xl font-extrabold text-primary mb-1">{r.metric}</div>
              <div className="text-sm text-muted-foreground">{r.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Challenges */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The SaaS SEO problem</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Growing organic traffic for SaaS is brutal. Most teams face the same three walls.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {challenges.map((c) => {
              const Icon = c.icon;
              return (
              <div key={c.title} className="p-8 rounded-2xl border bg-card">
                <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-3">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.description}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/20 border-y">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How StackSerp solves it</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built features for SaaS SEO — not a generic content tool.
            </p>
          </div>
          <div className="space-y-6">
            {features.map((f, i) => {
              const FIcon = f.icon;
              return (
              <div
                key={f.title}
                className={`flex flex-col md:flex-row gap-8 items-start p-8 rounded-2xl border bg-card ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="flex-shrink-0 w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <FIcon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">{f.title}</h3>
                    <Badge className="bg-primary/10 text-primary border-none text-xs">{f.badge}</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From keyword to ranked post in 4 steps</h2>
            <p className="text-lg text-muted-foreground">The full workflow — fully automated.</p>
          </div>
          <div className="space-y-8">
            {workflow.map((w) => (
              <div key={w.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-extrabold flex items-center justify-center shadow-lg shadow-primary/20">
                  {w.step}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold mb-2">{w.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 px-4 bg-muted/20 border-y">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything your SaaS SEO stack needs</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "AI-written, SEO-optimized blog posts",
              "Competitor comparison page generator",
              "Integration landing page factory",
              "Topic cluster builder",
              "Internal link automation",
              "Featured image AI generation",
              "Direct WordPress / Ghost / Shopify publishing",
              "REST API for headless CMS",
              "IndexNow for instant indexing",
              "Keyword tracking dashboard",
              "Team collaboration tools",
              "White-label reporting",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl border bg-card">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-none">Get started today</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Stop watching competitors rank for your keywords
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join SaaS teams using StackSerp to capture high-intent organic traffic, reduce content costs, and
            compound their inbound growth — month after month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 rounded-full">
              <Link href="/register">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full">
              <Link href="/use-cases">View all use cases</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
