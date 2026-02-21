import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Newspaper, TrendingUp, CheckCircle2, DollarSign, Globe, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "StackSerp for Niche Publishers | Affiliate & Ad Revenue Sites",
  description:
    "Grow your affiliate and ad-revenue niche sites with StackSerp. Build deep content silos, publish at scale, and drive organic traffic with AI-generated SEO content.",
  keywords: "StackSerp niche publishers, affiliate site content automation, programmatic SEO niche sites, AI blog content for publishers",
  openGraph: {
    title: "StackSerp for Niche Publishers",
    description: "Build authority, rank faster, and grow ad & affiliate revenue with automated SEO content from StackSerp.",
    type: "website",
    url: "https://stackserp.com/use-cases/publishers",
  },
  alternates: { canonical: "https://stackserp.com/use-cases/publishers" },
};

const benefits = [
  {
    icon: Layers,
    title: "Deep Topical Silos",
    description:
      "StackSerp's topic cluster engine automatically creates interconnected content hubs. Every subtopic links back to your pillar page, signaling deep expertise to Google's algorithms.",
  },
  {
    icon: Globe,
    title: "Programmatic at Scale",
    description:
      "Upload hundreds of keywords and let the AI generate, optimize, and schedule them automatically. Build an entire niche in days instead of months.",
  },
  {
    icon: TrendingUp,
    title: "Built for Rankings",
    description:
      "Every article is optimized with on-page SEO, internal linking, metadata, and schema markup baked in. No manual editing required before publishing.",
  },
  {
    icon: DollarSign,
    title: "Maximize Ad & Affiliate Revenue",
    description:
      "More indexed pages means more ad impressions and affiliate click opportunities. Our auto-publishing scheduler keeps your site fresh daily to maintain crawl budget.",
  },
];

const workflow = [
  { step: "01", title: "Upload Your Keyword List", desc: "Bulk import hundreds of affiliate or informational keywords from any research tool." },
  { step: "02", title: "AI Generates Deep Content", desc: "Each keyword gets a fully researched, 1,500–4,000 word article with proper H2/H3 structure, FAQs, and internal links." },
  { step: "03", title: "Auto-Publish on Schedule", desc: "Posts are queued to publish at your set cadence — daily, 3x/week, whatever keeps Google crawling." },
  { step: "04", title: "Watch Rankings Climb", desc: "Track keyword positions, page views, and organic growth right inside StackSerp's analytics dashboard." },
];

export default function PublishersUseCasePage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-green-500/10 text-green-700 dark:text-green-400 border-none">
            For Niche Publishers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Build Authority Sites <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-primary">
              10x Faster
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Paid ads burn cash. SEO compounds. StackSerp helps niche publishers and affiliate marketers build deep topical authority automatically — so you aren&apos;t dependent on Meta or Google Ads.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 rounded-full">
              <Link href="/register">
                Start Publishing Free <ArrowRight className="ml-2 h-5 w-5" />
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
          {[
            { value: "500+", label: "Posts per month possible" },
            { value: "14 days", label: "Avg. time to first ranking" },
            { value: "3x", label: "More organic traffic in 90 days" },
            { value: "70%", label: "Cheaper than a content team" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black text-primary mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Dominate a Niche</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From keyword research to auto-publishing, StackSerp handles the entire content pipeline.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border bg-card p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 px-4 bg-muted/30 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works for Publishers</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {workflow.map((w) => (
              <div key={w.step} className="flex gap-5 p-6 rounded-2xl border bg-background">
                <span className="text-4xl font-black text-primary/30 leading-none">{w.step}</span>
                <div>
                  <h3 className="font-bold text-lg mb-2">{w.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CMS integrations callout */}
      <section className="py-16 px-4 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Publishes Directly to Your CMS</h3>
          <p className="text-muted-foreground mb-8">
            StackSerp integrates natively with WordPress, Shopify, Ghost, and any custom CMS via webhook — so there&apos;s zero manual copy-pasting.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["WordPress", "Shopify", "Ghost", "Webhook / Custom"].map((cms) => (
              <span key={cms} className="flex items-center gap-1.5 px-4 py-2 rounded-full border bg-background text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {cms}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <Newspaper className="h-14 w-14 text-primary mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-black mb-4">Start Building Your Content Empire</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get your first 5 posts free. No credit card required.
          </p>
          <Button asChild size="lg" className="h-14 px-12 text-lg rounded-full shadow-xl">
            <Link href="/register">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
