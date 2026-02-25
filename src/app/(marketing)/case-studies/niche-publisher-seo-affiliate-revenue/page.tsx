import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Target, Layers, BarChart3, Quote,
  ChevronDown, CheckCircle2, TrendingUp, DollarSign, FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Niche Publisher SEO Case Study: Tripled Traffic, 2x Affiliate Revenue in 4 Months | StackSerp",
  description:
    "How a personal finance niche site broke through an 18-month traffic plateau — going from 180,000 to 540,000 monthly pageviews and doubling affiliate revenue using topical cluster strategy.",
  keywords:
    "niche site SEO case study, affiliate site traffic growth, niche publisher content strategy, increase affiliate revenue SEO, personal finance site case study, topical authority SEO",
  openGraph: {
    title: "Niche Publisher Case Study: 180K to 540K Pageviews, 2x Affiliate Revenue",
    description:
      "After 18 months stuck at 180K pageviews, this personal finance site used StackSerp to break through to 540K. Full strategy breakdown.",
    type: "article",
    url: "https://stackserp.com/case-studies/niche-publisher-seo-affiliate-revenue",
  },
  alternates: { canonical: "https://stackserp.com/case-studies/niche-publisher-seo-affiliate-revenue" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How a Personal Finance Niche Site Tripled Traffic and Doubled Affiliate Revenue in 4 Months",
  description:
    "A personal finance niche site broke through an 18-month traffic plateau using StackSerp's topical cluster strategy — growing from 180K to 540K monthly pageviews and 2x affiliate revenue.",
  author: { "@type": "Organization", name: "StackSerp" },
  publisher: { "@type": "Organization", name: "StackSerp", url: "https://stackserp.com" },
  mainEntityOfPage: "https://stackserp.com/case-studies/niche-publisher-seo-affiliate-revenue",
  datePublished: "2025-02-03",
  dateModified: "2025-02-10",
};

const faqs = [
  {
    q: "Why was the site stuck at a traffic plateau for 18 months?",
    a: "The site had solid authority on its core topics but had published only isolated posts without a coherent topical structure. Google's Helpful Content updates had increasingly rewarded sites with deep, interconnected coverage of sub-topics — rather than individual high-traffic posts. The site had wide coverage but shallow depth on any single sub-topic, which limited its ability to rank for the next tier of competitive keywords.",
  },
  {
    q: "Does Google penalize AI-generated content?",
    a: "No — Google's guidance explicitly states they don't penalize AI-generated content, they penalize low-quality, unoriginal content regardless of how it was produced. StackSerp's output includes original analysis, accurate data, and substantial informational value. Every post went through a human review step for accuracy and tone. The site saw no penalties and consistent ranking improvements throughout the campaign.",
  },
  {
    q: "How did they choose which topical clusters to prioritize?",
    a: "Three criteria: (1) existing site authority — clusters adjacent to existing strong content ranked faster. (2) Affiliate monetization potential — clusters where affiliate products had high commissions and conversion rates. (3) Competitive gap — topics where the top-ranking content was thin, outdated, or low quality. StackSerp's topic cluster generator identified 22 clusters meeting all three criteria.",
  },
  {
    q: "How much did affiliate revenue increase per additional 1,000 pageviews?",
    a: "Pre-StackSerp, the site was generating approximately $0.84 per 1,000 pageviews in affiliate revenue. After expanding into deeper sub-topics with higher purchase intent, this RPM improved to $1.67 — meaning not only did traffic double, but revenue per visitor also doubled. The combination of more traffic AND higher monetization RPM drove the 2x+ revenue improvement.",
  },
  {
    q: "What content types performed best for affiliate revenue?",
    a: "Three content types drove the highest affiliate revenue: (1) 'Best [product/service] for [specific use case]' — high buyer intent, strong affiliate click-through. (2) Review posts comparing 3–5 products with clear recommendations. (3) 'How to [achieve goal] with [tool/service]' — softer sell but high volume and consistent conversion. Pure informational content had high traffic but contributed less than 15% of affiliate revenue.",
  },
];

export default function NichePublisherCaseStudy() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ── */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-emerald-600/10 blur-[130px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/case-studies" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Case Studies</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400 text-sm">Niche Publisher</span>
          </div>
          <Badge className="mb-5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20">
            Niche Publisher · Personal Finance &amp; Investing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            How a Personal Finance Site <br className="hidden lg:block" />
            <span className="text-emerald-400">Tripled Traffic and Doubled Revenue</span>
            <br className="hidden lg:block" /> in 4 Months
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
            After 18 months stuck at 180,000 monthly pageviews, MoneyDepth (name anonymized) deployed
            StackSerp to build 22 deep topical clusters — breaking through to 540,000 monthly pageviews
            and more than doubling affiliate revenue.
          </p>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="bg-zinc-900 border-y border-white/6 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "3x", label: "Monthly pageviews", sub: "180K → 540K in 4 months" },
              { value: "2x+", label: "Affiliate revenue", sub: "Plus 99% RPM improvement" },
              { value: "+1,200", label: "New indexed pages", sub: "22 complete topic clusters" },
              { value: "18 mo", label: "Plateau broken", sub: "After 18 months of flat traffic" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">{m.value}</p>
                <p className="text-sm font-medium text-white mb-0.5">{m.label}</p>
                <p className="text-xs text-zinc-500">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">

          {/* Challenge */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <Target className="h-4 w-4 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">The Challenge: 18 Months of Flat Traffic</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-4">
              MoneyDepth is a personal finance and investing content site with 4 years of history.
              At its peak growth phase in 2022–2023, it had grown steadily from 10,000 to 180,000 monthly
              pageviews. Then growth stopped. For 18 consecutive months, traffic oscillated between
              160,000 and 195,000 sessions — no sustained growth, despite consistent publishing.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-4">
              The site&apos;s creator, a former financial advisor, had been publishing 6–8 articles per month
              manually. The content was high quality — genuine expertise, accurate financial data, and
              well-sourced. But a pattern emerged: new posts were getting some initial traffic, then
              dropping off. Existing posts weren&apos;t climbing in rankings despite the site&apos;s 58 DR.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-6">
              After an SEO audit, the root cause became clear: the site had wide topical coverage but
              insufficient depth on any single sub-topic. It ranked for 340 keywords in the top 20 but
              only 28 in the top 3. Google was treating it as a generalist site rather than a topical
              authority — limiting its ability to rank for the most competitive, high-traffic terms.
            </p>
            <div className="rounded-xl border border-red-100 bg-red-50 p-6">
              <h3 className="font-semibold text-zinc-900 mb-3">The plateau diagnosis:</h3>
              <ul className="space-y-2">
                {[
                  "180K monthly sessions for 18 months — zero sustained growth",
                  "340 keywords in top 20, only 28 in top 3 positions",
                  "Wide topical coverage, shallow depth on any single sub-topic",
                  "New posts getting initial traffic then dropping — no compounding",
                  "Affiliate RPM of $0.84/1,000 pageviews — undermonetized relative to traffic",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-red-500 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strategy */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <Layers className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">The Strategy: Deep Topical Silos for 22 Sub-Topics</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-6">
              The solution was topical depth. Rather than publishing random articles across personal
              finance, MoneyDepth would pick 22 sub-topics and systematically publish every keyword in
              each sub-topic — transforming itself from a generalist personal finance site into a deeply
              authoritative resource on each cluster.
            </p>

            <h3 className="text-lg font-semibold text-zinc-900 mb-4">The 22 Topical Clusters (Selected Examples)</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {[
                { cluster: "High-Yield Savings Accounts", posts: 48, anchor: "Best High-Yield Savings Accounts 2025" },
                { cluster: "Index Fund Investing", posts: 52, anchor: "Index Fund vs ETF: Complete Guide" },
                { cluster: "Roth IRA Rules", posts: 38, anchor: "Roth IRA Contribution Limits & Rules" },
                { cluster: "Debt Payoff Strategies", posts: 44, anchor: "Avalanche vs Snowball Method" },
                { cluster: "Credit Score Improvement", posts: 56, anchor: "How to Raise Your Credit Score Fast" },
                { cluster: "First-Time Homebuying", posts: 62, anchor: "First-Time Home Buyer Complete Guide" },
                { cluster: "Freelancer Taxes", posts: 42, anchor: "Self-Employed Tax Guide 2025" },
                { cluster: "Emergency Fund Planning", posts: 34, anchor: "How Much Should Your Emergency Fund Be?" },
              ].map((c) => (
                <div key={c.cluster} className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{c.cluster}</p>
                    <p className="text-xs text-zinc-500">{c.posts} articles · Anchor: &ldquo;{c.anchor}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
              <h3 className="font-semibold text-zinc-900 mb-2">The Topical Authority Effect for YMYL Sites</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Personal finance is a YMYL (Your Money or Your Life) category — Google applies heightened
                scrutiny to ranking decisions. Building 50+ interconnected, high-quality articles within
                a single financial sub-topic signals genuine expertise far more powerfully than scattered
                individual posts. This is particularly important post-Helpful Content Update, which
                explicitly rewards demonstrated topical depth.
              </p>
            </div>
          </div>

          {/* Implementation */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Implementation: 4 Months to Break the Plateau</h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Audit & Cluster Selection (Week 1–2)",
                  content: "Started by identifying the 22 sub-topics where the site had some existing authority (2–5 existing posts per topic) and where expanding would have the highest traffic and affiliate monetization potential. StackSerp's topic cluster generator mapped out the full keyword landscape for each cluster — an estimated 4,000+ keyword opportunities across all 22 clusters.",
                },
                {
                  step: "2",
                  title: "Existing Content Optimization (Week 2–4)",
                  content: "Before publishing new content, existing posts in each cluster were updated with StackSerp-assisted expansions — adding new sections, updating statistics, and improving internal link structure. This gave the clusters a stronger foundation before new posts arrived. Average existing post length increased from 1,200 to 2,400 words.",
                },
                {
                  step: "3",
                  title: "High-Velocity Cluster Publishing (Month 1–4)",
                  content: "300 posts per month at peak — roughly 10 posts per day across all 22 clusters. Priority was completing at least one full cluster before moving heavily into the next, to maximize the topical authority signal per cluster. The credit score cluster was completed first (56 posts in 3 weeks) and showed position improvements within 5 weeks.",
                },
                {
                  step: "4",
                  title: "Affiliate Page Optimization (Month 2–4)",
                  content: "New posts in high-commercial-intent sub-topics (savings accounts, index funds, credit cards) were specifically structured for affiliate conversion: product comparison tables, pros/cons sections, and direct affiliate CTAs. Posts in pure informational clusters included soft affiliate placements via tool recommendations.",
                },
                {
                  step: "5",
                  title: "Internal Link Audit & Strengthening (Month 3)",
                  content: "After the first two clusters were fully published, the team ran an internal link audit using StackSerp's link data. Every cluster pillar article was linked to from 15+ supporting posts; every supporting post linked back to the pillar and to 2–3 affiliate product pages. This link equity flow directly improved rankings for the high-value commercial pages.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm shrink-0 mt-0.5">{s.step}</div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2">{s.title}</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">{s.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results table */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Month-by-Month Results</h2>
            </div>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="text-left p-3 font-semibold text-zinc-700 border border-zinc-200">Month</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Pageviews</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Top-3 Keywords</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Affiliate Revenue</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Revenue RPM</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "Baseline (pre-StackSerp)", views: "180,000", keywords: "28", revenue: "$4,200", rpm: "$0.84" },
                    { month: "Month 1", views: "192,000", keywords: "34", revenue: "$4,480", rpm: "$0.91" },
                    { month: "Month 2", views: "247,000", keywords: "67", revenue: "$6,300", rpm: "$1.10" },
                    { month: "Month 3", views: "380,000", keywords: "134", revenue: "$8,900", rpm: "$1.34" },
                    { month: "Month 4", views: "541,000", keywords: "218", revenue: "$9,800", rpm: "$1.67" },
                  ].map((row, i) => (
                    <tr key={row.month} className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}>
                      <td className="p-3 border border-zinc-200 font-medium text-zinc-800">{row.month}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.views}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.keywords}</td>
                      <td className="p-3 border border-zinc-200 text-right font-semibold text-emerald-600">{row.revenue}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.rpm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Top 5 Revenue-Generating Cluster Posts</h3>
            <div className="space-y-3">
              {[
                { title: "Best High-Yield Savings Accounts (Updated Monthly)", traffic: "28,400/mo", aff: "Top affiliate page" },
                { title: "Best Index Funds for Beginners: 2025 Complete Guide", traffic: "19,200/mo", aff: "Top affiliate page" },
                { title: "Best Credit Cards for Fair Credit Score [520–670]", traffic: "14,800/mo", aff: "High affiliate RPM" },
                { title: "How to Improve Credit Score by 100 Points in 6 Months", traffic: "22,100/mo", aff: "Strong affiliate clicks" },
                { title: "Roth IRA vs Traditional IRA: Which Is Right for You?", traffic: "11,600/mo", aff: "High engagement" },
              ].map((post) => (
                <div key={post.title} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-4 gap-4">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-800 font-medium leading-snug">{post.title}</span>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap">{post.traffic}</span>
                    <span className="hidden sm:inline text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">{post.aff}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="mb-16">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 relative">
              <Quote className="h-8 w-8 text-emerald-300 mb-4" />
              <blockquote className="text-lg text-zinc-700 leading-relaxed italic mb-6">
                &ldquo;I spent 18 months wondering if I had hit the ceiling of what a solo creator could build.
                Turns out I hadn&apos;t hit the ceiling — I had hit the ceiling of what I could write manually.
                StackSerp let me publish the topical depth Google was looking for, and the results were
                almost instant. Month 3 felt like I had a new site. Month 4 I was negotiating higher
                affiliate commissions because of my traffic numbers.&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-zinc-900">Creator, MoneyDepth</p>
                <p className="text-sm text-zinc-500">Personal finance &amp; investing content site, 540K+ monthly pageviews</p>
              </div>
            </div>
          </div>

          {/* Key takeaways */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">5 Lessons for Niche Publishers Breaking Through Plateaus</h2>
            <div className="space-y-4">
              {[
                { title: "Traffic plateaus are usually a topical depth problem", desc: "If you're publishing consistently but traffic has flatlined, the issue is almost always insufficient topical depth on any single sub-topic. Google needs to see concentrated expertise signals, not scattered breadth." },
                { title: "Complete clusters before starting new ones", desc: "Publishing 50 articles on credit scores before moving to the next cluster concentrates the topical authority signal. Half-built clusters deliver far weaker authority signals than complete ones." },
                { title: "Update existing content before adding new", desc: "Updating 50 existing posts with expanded sections and new internal links gave existing rankings a boost that amplified the impact of new content. The combination of updated + new content created a compounding effect." },
                { title: "RPM improves with better content targeting", desc: "Not all traffic is equal. Posts targeting buyer-intent keywords in high-commission affiliate categories generated 3–5x the revenue per 1,000 visitors compared to purely informational content. Content strategy and monetization strategy must align." },
                { title: "Internal links are the hidden multiplier for solo publishers", desc: "StackSerp's automated internal linking connected 1,200 new posts into a coherent link structure. Manual internal linking at this scale would have taken hundreds of hours. The link equity flow directly lifted the top-performing commercial pages." },
              ].map((t, i) => (
                <div key={t.title} className="flex gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-1">{t.title}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="group rounded-xl border border-zinc-200 bg-white overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors list-none">
                    {faq.q}
                    <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 ml-4 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-zinc-600 leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Related */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-5">More Case Studies</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { href: "/case-studies/ecommerce-seo-organic-traffic-growth", tag: "E-Commerce", title: "Outdoor Gear Brand Grew Organic Traffic 512% in 6 Months" },
                { href: "/case-studies/marketing-agency-10x-content-output", tag: "Agency", title: "Agency 10x'd Content Output Without Hiring a Single Writer" },
              ].map((r) => (
                <Link key={r.href} href={r.href} className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group">
                  <Badge variant="outline" className="mb-3 text-xs">{r.tag}</Badge>
                  <p className="text-sm font-semibold text-zinc-800 group-hover:text-emerald-600 transition-colors leading-snug">{r.title}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-400 mt-2">Read case study <ArrowRight className="h-3 w-3" /></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-emerald-600/10 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Break Through Your Traffic Plateau</h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            StackSerp gives niche publishers the topical depth Google rewards — without years of manual writing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0">
              <Link href="/register">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base text-zinc-300 border-white/15 bg-transparent hover:bg-white/5">
              <Link href="/use-cases/publishers">Publisher Use Case Guide</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
