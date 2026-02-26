import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Users, DollarSign, BarChart3, Clock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "SEO Case Studies | Real Results with AI Content Automation | StackSerp",
  description:
    "Read real case studies from ecommerce brands, SaaS startups, marketing agencies, and niche publishers who used StackSerp to grow organic traffic, increase revenue, and scale content production.",
  keywords:
    "SEO case studies, AI SEO results, content automation case studies, organic traffic growth, StackSerp results, SEO success stories",
  openGraph: {
    title: "SEO Case Studies | Real Results with StackSerp",
    description:
      "See how real businesses grew organic traffic 300-500% using StackSerp's AI SEO automation platform.",
    type: "website",
    url: "https://stackserp.com/case-studies",
  },
  alternates: { canonical: "https://stackserp.com/case-studies" },
};

const caseStudies = [
  {
    slug: "ecommerce-seo-organic-traffic-growth",
    tag: "E-Commerce",
    tagColor: "bg-orange-500/15 border-orange-500/30 text-orange-400",
    industry: "Outdoor & Sports Gear",
    headline: "How an Outdoor Gear Brand Grew Organic Traffic 512% in 6 Months",
    description:
      "Starting with near-zero organic presence, this direct-to-consumer outdoor brand used StackSerp to build deep product category clusters — and went from 8,000 to 49,000 monthly organic visitors.",
    stats: [
      { label: "Traffic Growth", value: "+512%" },
      { label: "Organic Revenue", value: "+287%" },
      { label: "Posts Published", value: "340" },
    ],
    timeframe: "6 months",
    accentColor: "text-orange-400",
    hoverClass: "group-hover:text-orange-400",
    borderColor: "border-orange-500/20",
  },
  {
    slug: "saas-competitor-comparison-content-strategy",
    tag: "SaaS",
    tagColor: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    industry: "B2B Project Management Software",
    headline: "How a B2B SaaS Startup Generated 400+ Monthly Signups from Organic Search",
    description:
      "This early-stage SaaS had no organic channel and was burning $18,000/month on paid ads. By targeting competitor comparison keywords and building integration pages at scale, they built a self-sustaining SEO engine.",
    stats: [
      { label: "Monthly Organic Signups", value: "400+" },
      { label: "Organic Traffic", value: "22,000/mo" },
      { label: "CAC Reduction", value: "−74%" },
    ],
    timeframe: "5 months",
    accentColor: "text-blue-400",
    hoverClass: "group-hover:text-blue-400",
    borderColor: "border-blue-500/20",
  },
  {
    slug: "marketing-agency-10x-content-output",
    tag: "Agency",
    tagColor: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    industry: "Digital Marketing Agency",
    headline: "How a 12-Person Agency 10x'd Content Output Without Hiring a Single Writer",
    description:
      "A mid-size digital marketing agency was hitting a content ceiling with 11 active clients. After switching to StackSerp for content production, they tripled their client roster and improved net margins by 58%.",
    stats: [
      { label: "Content Output", value: "10x" },
      { label: "Margin Improvement", value: "+58%" },
      { label: "Active Clients", value: "11 → 34" },
    ],
    timeframe: "4 months",
    accentColor: "text-purple-400",
    hoverClass: "group-hover:text-purple-400",
    borderColor: "border-purple-500/20",
  },
  {
    slug: "niche-publisher-seo-affiliate-revenue",
    tag: "Niche Publisher",
    tagColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    industry: "Personal Finance & Investing",
    headline: "How a Personal Finance Niche Site Tripled Traffic and Doubled Affiliate Revenue in 4 Months",
    description:
      "After hitting a traffic plateau at 180,000 monthly pageviews for 18 months, this personal finance site deployed StackSerp to build comprehensive topical clusters — and broke through to 540,000 monthly pageviews.",
    stats: [
      { label: "Monthly Pageviews", value: "180K → 540K" },
      { label: "Affiliate Revenue", value: "2x" },
      { label: "Indexed Pages", value: "+1,200" },
    ],
    timeframe: "4 months",
    accentColor: "text-emerald-400",
    hoverClass: "group-hover:text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
];

const globalStats = [
  { value: "512%", label: "Peak organic traffic growth" },
  { value: "74%", label: "Average CAC reduction" },
  { value: "10x", label: "Content output increase" },
  { value: "4–6 mo", label: "Typical time to measurable results" },
];

export default function CaseStudiesPage() {
  return (
    <>
      {/* ── HERO ── dark */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-indigo-600/15 blur-[130px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-6">
            Real Results, Real Businesses
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            SEO Case Studies That <br className="hidden md:block" />
            <span className="text-indigo-400">Prove the Numbers</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            We don&apos;t just claim results — we document them. Read how ecommerce brands, SaaS
            companies, agencies, and niche publishers used StackSerp to build real organic growth engines.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40"
            >
              <Link href="/register">
                Start Your Own Story <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base text-zinc-300 border-white/15 bg-transparent hover:bg-white/5 hover:text-white"
            >
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── dark */}
      <section className="bg-zinc-900 border-y border-white/6 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {globalStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES GRID ── light */}
      <section className="py-20 px-4 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
              Customer Success Stories
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Each case study documents the exact strategy, timeline, and results — so you can replicate
              what works for your business type.
            </p>
          </div>

          <div className="space-y-6">
            {caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                href={`/case-studies/${cs.slug}`}
                className={`block rounded-2xl border border-zinc-200 bg-white p-8 md:p-10 hover:shadow-lg hover:-translate-y-0.5 transition-all group`}
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${cs.tagColor}`}>
                        {cs.tag}
                      </span>
                      <span className="text-xs text-zinc-400">{cs.industry}</span>
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {cs.timeframe}
                      </span>
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold text-zinc-900 mb-3 ${cs.hoverClass} transition-colors`}>
                      {cs.headline}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-4">{cs.description}</p>
                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${cs.accentColor}`}>
                      Read full case study <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="flex md:flex-col gap-6 md:gap-4 md:min-w-[160px]">
                    {cs.stats.map((stat) => (
                      <div key={stat.label} className={`rounded-xl border ${cs.borderColor} bg-zinc-50 p-4 text-center`}>
                        <p className={`text-2xl font-bold ${cs.accentColor}`}>{stat.value}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE TRACK ── white */}
      <section className="py-20 px-4 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">What We Measure in Every Case Study</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              We don&apos;t cherry-pick metrics. Every case study documents the full picture — challenges, strategy, execution, and results.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Organic Traffic",
                desc: "Monthly organic sessions from Google Search Console — before, during, and after deploying StackSerp.",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                icon: DollarSign,
                title: "Revenue Impact",
                desc: "Measured conversion rate from organic traffic, and direct revenue attribution to SEO-generated content.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                icon: BarChart3,
                title: "Keyword Rankings",
                desc: "Position tracking for target keywords, including average position improvements and page-1 wins.",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: Users,
                title: "Conversion Metrics",
                desc: "Sign-ups, leads, email subscribers, or affiliate clicks generated from SEO traffic.",
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: Clock,
                title: "Time to Results",
                desc: "Honest timeline from first published content to measurable ranking and traffic improvements.",
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
              {
                icon: CheckCircle2,
                title: "Content Quality Score",
                desc: "NLP analysis scores, topical coverage depth, and E-E-A-T signal improvements tracked over time.",
                color: "text-zinc-700",
                bg: "bg-zinc-100",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-zinc-200 p-6">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${item.bg} mb-4`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
            Ready to Be Our Next Case Study?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Join hundreds of businesses using StackSerp to build organic traffic channels that compound over time.
          </p>
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40"
          >
            <Link href="/register">
              Start Free — No Credit Card <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-zinc-500 mt-4">Free plan includes 2 posts/month. No credit card required.</p>
        </div>
      </section>
    </>
  );
}
