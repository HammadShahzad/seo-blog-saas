import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeStyle: string;
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
    iconBg: "bg-indigo-600/20",
    iconColor: "text-indigo-400",
    badge: "Most Popular",
    badgeStyle: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
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
    iconBg: "bg-purple-600/20",
    iconColor: "text-purple-400",
    badge: "Best ROI",
    badgeStyle: "bg-purple-500/15 border-purple-500/30 text-purple-400",
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
    iconBg: "bg-blue-600/20",
    iconColor: "text-blue-400",
    badge: "High Intent",
    badgeStyle: "bg-blue-500/15 border-blue-500/30 text-blue-400",
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
    iconBg: "bg-emerald-600/20",
    iconColor: "text-emerald-400",
    badge: "High Volume",
    badgeStyle: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
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
      {/* ── HERO ── dark */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-6">
            Who Uses StackSerp
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Built for Teams That <br className="hidden md:block" />
            <span className="text-indigo-400">Grow with SEO</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Whether you&apos;re a solo founder or running a 50-person agency, StackSerp adapts to your workflow and scales with your ambition.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40">
              <Link href="/register">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base text-zinc-300 border-white/15 hover:bg-white/5 hover:text-white">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── dark */}
      <section className="bg-zinc-900 border-y border-white/6 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── light */}
      <section className="py-20 px-4 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-6">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="rounded-2xl border border-zinc-200 bg-white p-8 md:p-10 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${uc.iconBg}`}>
                        <Icon className={`h-6 w-6 ${uc.iconColor}`} />
                      </div>
                      <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${uc.badgeStyle}`}>
                        {uc.badge}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900 mb-1">{uc.title}</h2>
                      <p className={`font-medium text-sm ${uc.iconColor}`}>{uc.subtitle}</p>
                    </div>
                    <p className="text-zinc-500 leading-relaxed text-sm">{uc.description}</p>
                    <Button
                      asChild
                      className="h-10 px-5 font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border-0"
                    >
                      <Link href={uc.cta.href}>
                        {uc.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Key Benefits</p>
                    {uc.benefits.map((b) => (
                      <div key={b} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
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
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Ready to Start Ranking?</h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Join thousands of teams using StackSerp to automate their SEO content engine.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40">
            <Link href="/register">
              Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-zinc-500 mt-4">No credit card required</p>
        </div>
      </section>
    </>
  );
}
