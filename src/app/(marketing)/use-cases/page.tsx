import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Rocket, Building2, Newspaper, Globe, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Use Cases | StackSerp AI SEO Platform",
  description:
    "See how startups, agencies, SaaS companies, and niche publishers use StackSerp to automate SEO content and grow organic traffic at scale.",
  keywords: "StackSerp use cases, AI SEO for startups, AI SEO for agencies, programmatic SEO use cases",
  openGraph: {
    title: "StackSerp Use Cases | Who Uses AI SEO Automation?",
    description: "From early-stage startups to enterprise agencies — see how teams use StackSerp to publish months of SEO content in hours.",
    type: "website",
    url: "https://stackserp.com/use-cases",
  },
  alternates: { canonical: "https://stackserp.com/use-cases" },
};

const useCases: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  cta: { label: string; href: string };
  color: string;
  badge: string;
}[] = [
  {
    icon: Rocket,
    title: "Startups",
    subtitle: "Build domain authority from day one",
    description:
      "Early-stage startups can't afford to wait 12 months for SEO to kick in. StackSerp helps you build an authoritative content foundation fast — without hiring a content team. Launch your blog, fill your keyword queue, and start ranking within weeks.",
    benefits: [
      "No writers needed — AI does the research, drafting, and optimization",
      "Topical clusters establish authority in your niche immediately",
      "Automated internal linking boosts every new post from day one",
      "Free tier lets you start before you raise a Series A",
    ],
    cta: { label: "Startups Guide", href: "/use-cases/startups" },
    color: "from-primary/10 to-primary/5",
    badge: "Most Popular",
  },
  {
    icon: Building2,
    title: "Agencies",
    subtitle: "Scale client content delivery 10x",
    description:
      "Content agencies can deliver more work, faster, without growing headcount. StackSerp's multi-website management, white-label reports, and bulk generation pipeline mean you serve 10 clients with the effort of two.",
    benefits: [
      "Manage all client websites from a single dashboard",
      "White-label client-facing reports and dashboards",
      "Bulk keyword import and batch generation",
      "API access for custom workflow integrations",
    ],
    cta: { label: "Agencies Guide", href: "/use-cases/agencies" },
    color: "from-purple-500/10 to-purple-500/5",
    badge: "Best ROI",
  },
  {
    icon: Globe,
    title: "SaaS Companies",
    subtitle: "Turn your blog into a lead machine",
    description:
      "SaaS companies live and die by inbound. StackSerp helps you target high-intent comparison keywords, feature pages, and integration landing pages that capture users actively searching for your solution.",
    benefits: [
      "Target competitor comparison keywords automatically",
      "Generate integration pages for every tool in your category",
      "Build feature-specific content clusters for long-tail SEO",
      "IndexNow integration for instant Google indexing",
    ],
    cta: { label: "SaaS Guide", href: "/use-cases/saas" },
    color: "from-blue-500/10 to-blue-500/5",
    badge: "High Intent",
  },
  {
    icon: Newspaper,
    title: "Niche Publishers",
    subtitle: "Grow your ad and affiliate revenue",
    description:
      "Niche site builders and affiliate marketers need volume and topical depth. StackSerp's programmatic SEO engine lets you build deep content silos across dozens of sub-topics, driving ad impressions and affiliate conversions at scale.",
    benefits: [
      "Programmatic content generation for entire niches",
      "Deep topical silos that signal expertise to Google",
      "Scheduled auto-publishing keeps your site fresh daily",
      "WordPress and Shopify direct publishing integration",
    ],
    cta: { label: "Publishers Guide", href: "/use-cases/publishers" },
    color: "from-green-500/10 to-green-500/5",
    badge: "High Volume",
  },
];

const stats = [
  { value: "10x", label: "Faster content production" },
  { value: "3x", label: "More organic traffic in 90 days" },
  { value: "70%", label: "Reduction in content costs" },
  { value: "14 days", label: "Average time to first ranking" },
];

export default function UseCasesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-none">
            Who Uses StackSerp
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Built for Teams That <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              Grow with SEO
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Whether you&apos;re a solo founder or running a 50-person agency, StackSerp adapts to your workflow and scales with your ambition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 rounded-full">
              <Link href="/register">
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-black text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
            <div
              key={uc.title}
              className={`rounded-2xl border bg-gradient-to-br ${uc.color} p-8 md:p-12`}
            >
              <div className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-10 items-start`}>
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs font-medium">{uc.badge}</Badge>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-1">{uc.title}</h2>
                    <p className="text-primary font-medium">{uc.subtitle}</p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{uc.description}</p>
                  <Button asChild className="rounded-full">
                    <Link href={uc.cta.href}>
                      {uc.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Key Benefits</p>
                  {uc.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">Ready to Start Ranking?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of teams using StackSerp to automate their SEO content engine.
          </p>
          <Button asChild size="lg" className="h-14 px-12 text-lg rounded-full shadow-xl">
            <Link href="/register">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
        </div>
      </section>
    </>
  );
}
