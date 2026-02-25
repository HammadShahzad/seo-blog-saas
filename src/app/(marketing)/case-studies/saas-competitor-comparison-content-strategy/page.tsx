import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Target, Layers, BarChart3, Quote,
  ChevronDown, CheckCircle2, TrendingUp, DollarSign, Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SaaS SEO Case Study: 400+ Monthly Organic Signups from Competitor Keywords | StackSerp",
  description:
    "How a B2B SaaS startup stopped burning $18K/month on paid ads and built an organic channel generating 400+ monthly signups using competitor comparison content and integration pages.",
  keywords:
    "SaaS SEO case study, competitor comparison pages SEO, B2B SaaS organic growth, SaaS content strategy, organic signups SaaS, AI SEO for SaaS companies",
  openGraph: {
    title: "SaaS SEO Case Study: 400+ Monthly Organic Signups from Competitor Content",
    description:
      "From $18K/month in paid ads to 22,000 organic monthly visitors and 400+ signups. Full strategy breakdown for B2B SaaS SEO.",
    type: "article",
    url: "https://stackserp.com/case-studies/saas-competitor-comparison-content-strategy",
  },
  alternates: { canonical: "https://stackserp.com/case-studies/saas-competitor-comparison-content-strategy" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How a B2B SaaS Startup Generated 400+ Monthly Organic Signups Using Competitor Comparison Content",
  description:
    "Full breakdown of the SEO content strategy that reduced a SaaS startup's paid CAC by 74% using competitor comparison landing pages, integration content, and feature cluster posts.",
  author: { "@type": "Organization", name: "StackSerp" },
  publisher: { "@type": "Organization", name: "StackSerp", url: "https://stackserp.com" },
  mainEntityOfPage: "https://stackserp.com/case-studies/saas-competitor-comparison-content-strategy",
  datePublished: "2025-01-22",
  dateModified: "2025-02-05",
};

const faqs = [
  {
    q: "Is it ethical to target competitor keywords with comparison content?",
    a: "Yes — comparison and alternative pages are one of the most legitimate and effective forms of content marketing. They serve genuine searcher intent: people comparing tools before making a purchase decision. The key is to be honest and factual. Fabricating or exaggerating comparisons will damage your brand. Well-researched, fair comparison pages build trust with exactly the high-intent audience you want to convert.",
  },
  {
    q: "What types of competitor comparison keywords work best for SaaS?",
    a: "Three types consistently perform best: (1) '[Competitor] vs [Your Product]' — people already aware of the competitor shopping for alternatives. (2) '[Competitor] alternatives' — people actively unhappy with the competitor looking to switch. (3) '[Competitor] pricing' — budget-sensitive shoppers who may find your pricing more attractive. Alternative pages typically convert at 3–5x the rate of generic feature pages.",
  },
  {
    q: "How many integration pages should a SaaS company create?",
    a: "Start with the 20–30 integrations your customers use most, then expand. In this case study, the team created 68 integration pages, but the top 15 drove 73% of the organic traffic. Prioritize integrations that have meaningful search volume (200+ searches/month for '[Integration] + [your category]') and where the integration content genuinely helps users.",
  },
  {
    q: "How long did it take for comparison pages to rank?",
    a: "Initial ranking movement (positions 15–40) appeared within 4–6 weeks for most comparison pages. Page 1 rankings took 8–14 weeks on average. Pages targeting competitors with less SEO authority ranked faster. The key accelerator was having the pillar pages for each feature cluster live before publishing comparison posts — this gave the new content a stronger internal link boost from day one.",
  },
  {
    q: "Can this strategy work for enterprise SaaS with longer sales cycles?",
    a: "Absolutely — it works even better. Enterprise buyers research extensively, often visiting 10–15 content pieces before requesting a demo. A well-structured comparison and integration content library keeps your brand top-of-mind throughout that journey. The strategy drives not just direct sign-ups but also demo requests, which were 2.8x higher from organic visitors vs. paid for this company.",
  },
];

export default function SaasCompetitorCaseStudy() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── dark */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-blue-600/10 blur-[130px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/case-studies" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              Case Studies
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400 text-sm">SaaS</span>
          </div>
          <Badge className="mb-5 bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20">
            B2B SaaS · Project Management Software
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            How a B2B SaaS Startup Generated <br className="hidden lg:block" />
            <span className="text-blue-400">400+ Monthly Organic Signups</span>
            <br className="hidden lg:block" /> from Competitor SEO Content
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
            Burning $18,000/month on Google Ads with a rising CAC, this project management SaaS built a
            competitor-comparison content strategy that now generates 22,000 monthly organic visitors
            and 400+ sign-ups — with zero ad spend on those conversions.
          </p>
        </div>
      </section>

      {/* ── KEY METRICS ── */}
      <section className="bg-zinc-900 border-y border-white/6 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "400+", label: "Monthly organic signups", sub: "Up from ~12/mo at baseline" },
              { value: "22,000", label: "Monthly organic visitors", sub: "Up from 1,100 at start" },
              { value: "−74%", label: "Customer acquisition cost", sub: "Organic vs paid channel" },
              { value: "5 mo", label: "Time to 100+ organic signups/mo", sub: "Month 3 first real traction" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">{m.value}</p>
                <p className="text-sm font-medium text-white mb-0.5">{m.label}</p>
                <p className="text-xs text-zinc-500">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── light */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">

          {/* Challenge */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <Target className="h-4 w-4 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">The Challenge: Paid-Only Growth Was Unsustainable</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-4">
              TaskFlow (name anonymized) is a B2B project management SaaS targeting small and mid-size
              engineering teams. After 18 months of product development, they had solid product-market fit
              — NPS of 52, 94% 90-day retention — but their growth was entirely dependent on paid channels.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-4">
              Their Google Ads CPC in the project management / task tracker category had climbed from $8.40
              to $14.20 over 24 months — a 69% increase. With a trial-to-paid conversion rate of 18% and
              average contract value of $540/year, their blended CAC had ballooned to $340 — making payback
              period nearly 8 months. Investors were concerned.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-6">
              The growth team recognized that the only way to break the paid dependency was an organic channel.
              But writing generic &ldquo;what is project management&rdquo; blog posts against Asana and Monday.com
              would take years. They needed a sharper, more targeted strategy.
            </p>
            <div className="rounded-xl border border-red-100 bg-red-50 p-6">
              <h3 className="font-semibold text-zinc-900 mb-3">The paid channel problem at a glance:</h3>
              <ul className="space-y-2">
                {[
                  "$18,000/month in Google Ads — 67% of total marketing budget",
                  "CPC rising 69% over 24 months with no sign of slowing",
                  "CAC of $340 vs. ACV of $540 — 8-month payback, investors unhappy",
                  "Organic traffic: 1,100 monthly sessions, mostly branded",
                  "Blog: 8 posts, zero page-1 rankings, 2 years old",
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">The Three-Pillar Content Strategy</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-6">
              The growth team identified a fundamental insight: when someone searches &ldquo;Asana vs ClickUp&rdquo;
              or &ldquo;best Trello alternative&rdquo;, they are actively shopping. These are bottom-of-funnel searches
              with purchase intent far higher than generic informational queries. TaskFlow decided to build
              content around three high-intent content pillars.
            </p>

            <div className="space-y-6 mb-8">
              {[
                {
                  pillar: "Pillar 1",
                  title: "Competitor Comparison Pages",
                  color: "bg-blue-50 border-blue-200",
                  titleColor: "text-blue-700",
                  count: "47 pages",
                  desc: "Head-to-head comparison pages for every major competitor and their common pairings. Format: '[Competitor A] vs [Competitor B]: Which is Better for Engineering Teams?' Each page featured an honest comparison table, use-case breakdowns, and a 'Try TaskFlow Instead' section highlighting where TaskFlow wins.",
                  examples: [
                    "Asana vs ClickUp for Software Teams",
                    "Monday.com vs Jira: Honest Comparison 2025",
                    "Trello Alternatives for Agile Development Teams",
                    "ClickUp Pricing: Is It Worth It? (Plus Cheaper Options)",
                  ],
                },
                {
                  pillar: "Pillar 2",
                  title: "Integration Landing Pages",
                  color: "bg-indigo-50 border-indigo-200",
                  titleColor: "text-indigo-700",
                  count: "68 pages",
                  desc: "A dedicated landing page for every major tool that TaskFlow integrates with. Format: 'TaskFlow + [Tool]: How to [achieve workflow goal]'. These pages target searches like 'GitHub project management integration' and 'Slack task tracking' — high-intent queries from engineers already using specific tools.",
                  examples: [
                    "TaskFlow GitHub Integration: Close Issues with Task Updates",
                    "Connect Slack to Your Project Tracker (TaskFlow Guide)",
                    "TaskFlow + Figma: Design-to-Dev Workflow Automation",
                    "Jira to TaskFlow Migration: Step-by-Step Guide",
                  ],
                },
                {
                  pillar: "Pillar 3",
                  title: "Feature-Specific Deep Dives",
                  color: "bg-cyan-50 border-cyan-200",
                  titleColor: "text-cyan-700",
                  count: "52 posts",
                  desc: "Long-form content targeting specific pain points and feature keywords within the engineering project management space. These capture top-of-funnel traffic from engineers researching solutions before they've decided on a category.",
                  examples: [
                    "How to Build a Sprint Planning Workflow That Actually Works",
                    "Agile vs Scrum vs Kanban: Which Should Engineering Teams Use?",
                    "Engineering Team OKRs: How to Set and Track Them",
                    "Technical Debt Tracking: Tools and Methods for Dev Teams",
                  ],
                },
              ].map((p) => (
                <div key={p.pillar} className={`rounded-xl border ${p.color} p-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-bold ${p.titleColor} uppercase tracking-wider`}>{p.pillar}</span>
                    <span className="text-sm font-semibold text-zinc-800">{p.title}</span>
                    <Badge variant="outline" className="text-xs">{p.count}</Badge>
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-4">{p.desc}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {p.examples.map((ex) => (
                      <div key={ex} className="flex items-center gap-2 text-xs text-zinc-600">
                        <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">How They Executed with StackSerp</h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Competitive Keyword Mapping (Week 1)",
                  content: "The team exported all competitor domain keywords from Ahrefs and identified 340 keyword opportunities across the three content pillars. StackSerp's topic cluster generator organized these into a prioritized content calendar, front-loading comparison pages that had the highest search volume and lowest existing competition.",
                },
                {
                  step: "2",
                  title: "Template Design for Consistency (Week 1)",
                  content: "They created content templates for each pillar type — comparison pages had a fixed structure (overview, feature comparison table, pricing comparison, use case fit, verdict). Integration pages had a fixed format (what it does, how to set it up, workflow examples, troubleshooting). StackSerp's brand voice and structure settings enforced this template automatically.",
                },
                {
                  step: "3",
                  title: "Bulk Generation at 40+ Posts/Month (Month 1–5)",
                  content: "Using StackSerp's bulk generation, the content team published 35–45 posts per month. Comparison pages were reviewed more carefully (15 minutes average edit time for fact-checking competitor claims). Integration pages were mostly published as-is after a 5-minute skim, since the format was straightforward and StackSerp's AI had accurate integration details.",
                },
                {
                  step: "4",
                  title: "Conversion Optimization on Comparison Pages",
                  content: "The marketing team added a 'Why TaskFlow Wins' section to every comparison page, with a direct 'Start Free Trial' CTA. They also added comparison tables with schema markup (Table structured data) and FAQ schema. These additions improved click-through rates from Google by 23% and doubled on-page conversion rate.",
                },
                {
                  step: "5",
                  title: "Competitor Migration Guides (Month 3)",
                  content: "When the Asana and Monday.com comparison pages began ranking in positions 5–15, they added dedicated migration guide sub-pages — 'How to migrate from Asana to TaskFlow in under 30 minutes.' These pages targeted users who had already decided to switch and converted at 11% — the highest conversion rate of any content on the site.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2">{s.title}</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">{s.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Results: Organic Signups vs. Paid Signups</h2>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="text-left p-3 font-semibold text-zinc-700 border border-zinc-200">Month</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Organic Visitors</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Organic Signups</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Page-1 Keywords</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Organic CAC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "Baseline", visitors: "1,100", signups: "12", keywords: "3", cac: "—" },
                    { month: "Month 1", visitors: "1,400", signups: "15", keywords: "7", cac: "—" },
                    { month: "Month 2", visitors: "3,200", signups: "38", keywords: "29", cac: "$210" },
                    { month: "Month 3", visitors: "7,400", signups: "112", keywords: "78", cac: "$140" },
                    { month: "Month 4", visitors: "14,900", signups: "247", keywords: "143", cac: "$102" },
                    { month: "Month 5", visitors: "22,100", signups: "418", keywords: "201", cac: "$88" },
                  ].map((row, i) => (
                    <tr key={row.month} className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}>
                      <td className="p-3 border border-zinc-200 font-medium text-zinc-800">{row.month}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.visitors}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.signups}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.keywords}</td>
                      <td className="p-3 border border-zinc-200 text-right font-semibold text-blue-600">{row.cac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: DollarSign, value: "$88", label: "Organic CAC at Month 5", sub: "vs. $340 from paid", color: "text-green-600", bg: "bg-green-50" },
                { icon: Users, value: "2.8x", label: "More demo requests", sub: "From organic vs paid visitors", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: TrendingUp, value: "11%", label: "Conversion rate", sub: "On migration guide pages", color: "text-indigo-600", bg: "bg-indigo-50" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl ${s.bg} p-5 text-center`}>
                  <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm font-medium text-zinc-800">{s.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="mb-16">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 relative">
              <Quote className="h-8 w-8 text-blue-300 mb-4" />
              <blockquote className="text-lg text-zinc-700 leading-relaxed italic mb-6">
                &ldquo;Our investors kept asking 'what's your organic strategy?' We had nothing to show them.
                Now we show them 22,000 monthly organic visitors and a CAC of $88 vs $340 on paid.
                The comparison pages in particular are incredible — people searching 'Asana vs ClickUp'
                are literally shopping, and we&apos;re right there in the conversation.&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-zinc-900">Head of Growth, TaskFlow</p>
                <p className="text-sm text-zinc-500">B2B project management SaaS for engineering teams</p>
              </div>
            </div>
          </div>

          {/* Key takeaways */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">5 Key Lessons for SaaS Organic Growth</h2>
            <div className="space-y-4">
              {[
                { title: "Target competitor keywords before broad category keywords", desc: "Broad terms like 'project management software' are dominated by Capterra, G2, and well-funded incumbents. Competitor-specific terms have far less competition and far higher purchase intent." },
                { title: "Integration pages are a secret weapon", desc: "Searches like 'GitHub project management' or 'Slack task tracker' are made by engineers who are already using these tools — meaning they're already qualified buyers. These pages convert at 3–5x the rate of generic feature posts." },
                { title: "Migration guides close the deal", desc: "Adding a migration guide to your top-performing comparison pages captures people who've already made the mental decision to switch. These pages had an 11% conversion rate in this case study." },
                { title: "Publish volume before optimization", desc: "The team published 167 posts in the first 3 months with minimal CRO, then spent month 4–5 optimizing their top 20 pages. This sequence maximizes both indexation speed and conversion efficiency." },
                { title: "Schema markup improves CTR from rankings", desc: "Adding FAQ and HowTo schema to comparison and integration pages improved average CTR from 2.1% to 3.4% — meaning the same ranking position delivered 62% more clicks." },
              ].map((t, i) => (
                <div key={t.title} className="flex gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0 mt-0.5">{i + 1}</span>
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
                  <p className="text-sm font-semibold text-zinc-800 group-hover:text-blue-600 transition-colors leading-snug">{r.title}</p>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-blue-600/10 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Build Your SaaS Organic Growth Engine
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Stop paying $300+ per customer acquisition. Build an organic channel that compounds every month.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0">
              <Link href="/register">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base text-zinc-300 border-white/15 bg-transparent hover:bg-white/5">
              <Link href="/use-cases/saas">SaaS Use Case Guide</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
