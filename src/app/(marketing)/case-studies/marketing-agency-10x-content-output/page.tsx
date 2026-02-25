import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Target, Layers, BarChart3, Quote,
  ChevronDown, CheckCircle2, TrendingUp, DollarSign, Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing Agency SEO Case Study: 10x Content Output, 58% Better Margins | StackSerp",
  description:
    "How a 12-person digital marketing agency went from 11 to 34 active clients by using StackSerp to automate SEO content production — without hiring a single additional writer.",
  keywords:
    "marketing agency SEO case study, agency content automation, scale content agency, white label SEO tool, agency profit margins, AI content for agencies",
  openGraph: {
    title: "Marketing Agency Case Study: 10x Content Output Without Hiring Writers",
    description:
      "From 11 to 34 clients, 58% better margins. How one agency used StackSerp to break through their content ceiling.",
    type: "article",
    url: "https://stackserp.com/case-studies/marketing-agency-10x-content-output",
  },
  alternates: { canonical: "https://stackserp.com/case-studies/marketing-agency-10x-content-output" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How a 12-Person Marketing Agency 10x'd Their Content Output Without Hiring a Single Writer",
  description:
    "A detailed breakdown of how a digital marketing agency used StackSerp to scale from 11 to 34 active clients, improve margins by 58%, and deliver better SEO results.",
  author: { "@type": "Organization", name: "StackSerp" },
  publisher: { "@type": "Organization", name: "StackSerp", url: "https://stackserp.com" },
  mainEntityOfPage: "https://stackserp.com/case-studies/marketing-agency-10x-content-output",
  datePublished: "2025-01-29",
  dateModified: "2025-02-08",
};

const faqs = [
  {
    q: "Does AI-generated content actually rank for agency clients?",
    a: "Yes — with proper setup. The key is brand voice configuration, topical cluster strategy, and human review for accuracy. In this case study, client keyword rankings improved an average of 34 positions across all managed accounts within 5 months. The agency's content editor reviews all posts before publishing — but the review time dropped from 45 minutes to 10 minutes per post due to StackSerp's improved output quality.",
  },
  {
    q: "How did they manage brand voice for 34 different clients?",
    a: "Each website in StackSerp has its own brand voice settings — tone, vocabulary, content style, and target audience. The agency had each client fill out a 10-question brand brief on onboarding, which they translated into StackSerp settings. After the first 5–10 posts per client, they fine-tuned the settings based on client feedback. Once dialed in, minimal edits were needed.",
  },
  {
    q: "What was the biggest challenge in scaling to 34 clients?",
    a: "Keyword research and content strategy — not writing. With manual writing, the bottleneck was drafting; with StackSerp, the bottleneck shifted upstream to strategy. The agency hired one additional SEO strategist (not a writer) to handle content planning and keyword research for the new clients. This single hire enabled them to scale to 34+ clients with quality control.",
  },
  {
    q: "How does StackSerp handle multi-client WordPress management?",
    a: "Each client website is a separate StackSerp project with its own WordPress connection, brand voice, keyword sets, and publishing schedule. Content is published directly to the client's WordPress via the API integration — no copy-paste, no manual uploads. The agency team manages everything from the StackSerp dashboard without ever needing to log into individual client WordPress accounts.",
  },
  {
    q: "What's the ROI of StackSerp for an agency on the Agency plan?",
    a: "This agency paid $199/month for the Agency plan. They reduced their monthly freelance writing spend from $11,200 to $1,400 (a human editor for review). Net saving: ~$9,800/month. They also added 23 new clients, generating $27,600/month in new retainer revenue that wouldn't have been possible at the old content production pace. Total first-year ROI: approximately 2,800%.",
  },
];

export default function AgencyCaseStudy() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ── */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-purple-600/10 blur-[130px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/case-studies" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Case Studies</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400 text-sm">Agency</span>
          </div>
          <Badge className="mb-5 bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
            Digital Marketing Agency · 12-Person Team
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            How a 12-Person Agency <span className="text-purple-400">10x&apos;d Their Content Output</span>
            <br className="hidden lg:block" /> Without Hiring a Single Writer
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
            BrightRank Agency (name anonymized) had 11 SEO clients and a content ceiling. By replacing
            their freelance writer network with StackSerp, they tripled their client roster to 34 accounts,
            improved net margins by 58%, and delivered better SEO results — in 4 months.
          </p>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="bg-zinc-900 border-y border-white/6 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "10x", label: "Content output", sub: "Same team, same timeline" },
              { value: "+58%", label: "Net margin improvement", sub: "From freelance cost savings" },
              { value: "11 → 34", label: "Active client accounts", sub: "Added 23 clients in 4 months" },
              { value: "$9,800", label: "Monthly cost savings", sub: "Freelance writing budget eliminated" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">{m.value}</p>
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
              <h2 className="text-2xl font-bold text-zinc-900">The Challenge: The Content Ceiling</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-4">
              BrightRank Agency had built a strong reputation for SEO results. They had 11 clients on
              monthly retainers ranging from $1,200–$3,500/month, and their results were genuinely good —
              average 180% organic traffic growth across client portfolios over 12 months.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-4">
              But they had a ceiling. Content was their bottleneck. With 11 clients, each needing 8–12
              posts per month, they needed 90–130 posts monthly. They had a network of 6 freelance writers,
              but quality was inconsistent, timelines regularly slipped, and the cost was $11,200/month —
              consuming 34% of total revenue.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-6">
              When a referral from an existing client led to 3 new potential clients, the agency realized
              they couldn&apos;t say yes. They simply couldn&apos;t scale the writing operation fast enough
              without a significant quality drop. They needed a fundamentally different production model.
            </p>
            <div className="rounded-xl border border-red-100 bg-red-50 p-6">
              <h3 className="font-semibold text-zinc-900 mb-3">Content production problems:</h3>
              <ul className="space-y-2">
                {[
                  "6 freelancers → inconsistent quality, briefs constantly misunderstood",
                  "$11,200/month in writing costs — 34% of total revenue consumed",
                  "Average 12-day turnaround per post — slowing publishing velocity",
                  "Onboarding new writers took 2–3 weeks per person",
                  "Had to turn away 3 new clients — couldn't scale production",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-red-500 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Solution */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <Layers className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">The Solution: StackSerp as Production Infrastructure</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-6">
              BrightRank ran a 30-day pilot on 3 client accounts before rolling out to all 11. The pilot
              compared StackSerp output quality against their best-performing freelancers on identical
              briefs. Blind review by the agency&apos;s SEO director rated StackSerp content as &ldquo;publish-ready
              after minor edits&rdquo; in 87% of cases — compared to 62% for their freelancers.
            </p>

            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Their New Production Workflow</h3>
            <div className="space-y-5">
              {[
                { step: "1", title: "Client Onboarding → StackSerp Setup (Day 1–3)", content: "New clients fill a brand voice brief. An account manager configures the StackSerp project: brand voice, website domain, WordPress API connection, target audience, primary keyword clusters. From setup to first post generation: 4 hours." },
                { step: "2", title: "Keyword Research → Content Calendar (Day 3–7)", content: "The SEO strategist builds a 3-month keyword cluster map using StackSerp's topic cluster generator + Ahrefs validation. Content calendar is generated and loaded into StackSerp's scheduling queue. The client approves the calendar in a 30-minute call." },
                { step: "3", title: "Bulk Generation → Review → Publish (Ongoing)", content: "StackSerp generates the month's posts in bulk. One content editor reviews 3–5 posts per hour (vs. 1 per hour with manual writing). Final approval rate: 91% publish-ready within 1 review cycle. StackSerp publishes directly to WordPress on the scheduled date." },
                { step: "4", title: "Monthly Reporting (Day 28–30)", content: "StackSerp's analytics data feeds into the agency's monthly client report. Traffic trends, rankings, and top-performing posts are pulled directly. Report preparation time dropped from 4 hours per client to 45 minutes." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm shrink-0 mt-0.5">{s.step}</div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2">{s.title}</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">{s.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial impact */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Financial Impact: Before vs. After</h2>
            </div>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="text-left p-3 font-semibold text-zinc-700 border border-zinc-200">Metric</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Before StackSerp</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">After StackSerp (4 months)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: "Active clients", before: "11", after: "34" },
                    { metric: "Monthly recurring revenue", before: "$24,200", after: "$74,800" },
                    { metric: "Monthly writing costs", before: "$11,200", after: "$1,400 (editor only)" },
                    { metric: "Posts published per month", before: "94", after: "340+" },
                    { metric: "Avg. post review time", before: "45 min", after: "10 min" },
                    { metric: "Net margin", before: "18%", after: "51%" },
                    { metric: "Team headcount", before: "12", after: "13 (+ 1 SEO strategist)" },
                  ].map((row, i) => (
                    <tr key={row.metric} className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}>
                      <td className="p-3 border border-zinc-200 font-medium text-zinc-800">{row.metric}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-500">{row.before}</td>
                      <td className="p-3 border border-zinc-200 text-right font-semibold text-green-600">{row.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Results */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Client SEO Results: Did Quality Improve?</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-6">
              Beyond the agency&apos;s own metrics, the ultimate test was client results. Across all 11 original
              clients measured over 5 months:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { value: "+34 pos", label: "Average keyword ranking improvement", color: "text-purple-600", bg: "bg-purple-50" },
                { value: "+210%", label: "Average organic traffic increase across clients", color: "text-blue-600", bg: "bg-blue-50" },
                { value: "0", label: "Clients churned during the transition", color: "text-green-600", bg: "bg-green-50" },
                { value: "4.8/5", label: "Average client satisfaction score", color: "text-orange-600", bg: "bg-orange-50" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl ${s.bg} p-5 text-center`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-zinc-600 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The agency attributes improved client results to two factors: (1) higher publishing velocity
              — more posts meant faster topical authority building, and (2) better strategic focus — the
              SEO strategist could spend more time on keyword strategy and less time managing freelancers.
            </p>
          </div>

          {/* Quote */}
          <div className="mb-16">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 relative">
              <Quote className="h-8 w-8 text-purple-300 mb-4" />
              <blockquote className="text-lg text-zinc-700 leading-relaxed italic mb-6">
                &ldquo;We went from turning away clients to actively pursuing them. Our margins went from
                barely profitable to genuinely great. And our clients are happier — they&apos;re getting
                more content, better results, and more consistent communication. StackSerp didn&apos;t
                just replace our writers. It replaced our entire content production model.&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-zinc-900">Founder, BrightRank Agency</p>
                <p className="text-sm text-zinc-500">12-person digital marketing agency, 34 SEO clients</p>
              </div>
            </div>
          </div>

          {/* Key takeaways */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">5 Lessons for Agency Content Scaling</h2>
            <div className="space-y-4">
              {[
                { title: "The bottleneck shifts from writing to strategy", desc: "With AI writing removed as the constraint, the new bottleneck becomes keyword research and content strategy. Agencies that invest in SEO strategy talent (not writers) scale fastest." },
                { title: "Brand voice setup is the make-or-break variable", desc: "Poor AI output almost always traces back to poor brand voice configuration. Invest 2–3 hours per client in detailed brand voice setup and the first batch of posts will be 90%+ usable." },
                { title: "Run a pilot before full rollout", desc: "BrightRank ran a 30-day pilot on 3 clients before committing to StackSerp. This built internal confidence and gave them data to show skeptical clients. Pilot on your most trusting clients first." },
                { title: "Direct CMS publishing eliminates a hidden bottleneck", desc: "StackSerp's direct WordPress publish integration saved an estimated 3 hours per week per 10 clients. At 34 clients, that's over 10 hours/week of editorial coordination time recovered." },
                { title: "Higher volume means faster authority and faster results", desc: "Clients who moved from 4 posts/month to 12+ posts/month saw results 3x faster. This not only improves client retention but justifies higher retainers." },
              ].map((t, i) => (
                <div key={t.title} className="flex gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs shrink-0 mt-0.5">{i + 1}</span>
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
                { href: "/case-studies/saas-competitor-comparison-content-strategy", tag: "SaaS", title: "SaaS Startup Generated 400+ Monthly Organic Signups" },
                { href: "/case-studies/niche-publisher-seo-affiliate-revenue", tag: "Publisher", title: "Niche Publisher Tripled Traffic and Doubled Affiliate Revenue" },
              ].map((r) => (
                <Link key={r.href} href={r.href} className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group">
                  <Badge variant="outline" className="mb-3 text-xs">{r.tag}</Badge>
                  <p className="text-sm font-semibold text-zinc-800 group-hover:text-purple-600 transition-colors leading-snug">{r.title}</p>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-purple-600/10 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Scale Your Agency Content with StackSerp</h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Stop capping your client roster at what your writers can handle. Build a content operation that scales on demand.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0">
              <Link href="/register">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base text-zinc-300 border-white/15 bg-transparent hover:bg-white/5">
              <Link href="/use-cases/agencies">Agency Use Case Guide</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
