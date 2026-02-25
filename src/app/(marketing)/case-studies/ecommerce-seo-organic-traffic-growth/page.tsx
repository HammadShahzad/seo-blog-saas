import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, TrendingUp, CheckCircle2, Clock, Target, Layers,
  BarChart3, Quote, ChevronDown, Globe, FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ecommerce SEO Case Study: 512% Organic Traffic Growth in 6 Months | StackSerp",
  description:
    "How an outdoor gear ecommerce brand grew from 8,000 to 49,000 monthly organic visitors in 6 months using AI-powered content clusters. Full strategy, process, and results breakdown.",
  keywords:
    "ecommerce SEO case study, increase organic traffic ecommerce, AI SEO for ecommerce, product category content clusters, ecommerce content strategy, organic traffic growth ecommerce",
  openGraph: {
    title: "Ecommerce SEO Case Study: 512% Organic Traffic Growth in 6 Months",
    description:
      "From 8,000 to 49,000 monthly organic visitors. See the exact content cluster strategy this outdoor gear brand used with StackSerp.",
    type: "article",
    url: "https://stackserp.com/case-studies/ecommerce-seo-organic-traffic-growth",
  },
  alternates: { canonical: "https://stackserp.com/case-studies/ecommerce-seo-organic-traffic-growth" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How an Outdoor Gear Brand Grew Organic Traffic 512% in 6 Months with AI Content Clusters",
  description:
    "A full breakdown of the SEO content strategy that took an ecommerce brand from 8,000 to 49,000 monthly organic visitors using StackSerp.",
  author: { "@type": "Organization", name: "StackSerp" },
  publisher: { "@type": "Organization", name: "StackSerp", url: "https://stackserp.com" },
  mainEntityOfPage: "https://stackserp.com/case-studies/ecommerce-seo-organic-traffic-growth",
  datePublished: "2025-01-15",
  dateModified: "2025-02-01",
};

const faqs = [
  {
    q: "How long does it take to see SEO results for an ecommerce site?",
    a: "In this case study, the brand saw their first meaningful ranking improvements (positions 11–30) within 6–8 weeks of publishing content clusters. Significant traffic growth (page 1 rankings and 3x traffic) came at the 4-month mark. E-commerce SEO typically takes 3–6 months to produce measurable results, depending on domain authority and competitive landscape.",
  },
  {
    q: "How many blog posts did they need to publish to see results?",
    a: "The brand published 340 posts across 14 topical clusters over 6 months — roughly 55–60 posts per month. The key was publishing in complete clusters rather than individual posts: Google rewarded the topical depth signal rather than single high-volume keywords.",
  },
  {
    q: "What types of content worked best for ecommerce SEO?",
    a: "Three content types drove the most traffic: (1) buying guides targeting 'best [product type]' keywords, (2) comparison articles like '[product A] vs [product B]', and (3) informational 'how-to' content that captured top-of-funnel audiences. Product-specific long-tail keywords converted at 4.8% — far higher than branded traffic.",
  },
  {
    q: "Did the AI content require significant editing?",
    a: "The team reports spending an average of 12 minutes per post on review and light editing — primarily adding product-specific details and brand voice adjustments. StackSerp's brand voice setting reduced editing time by 65% compared to their previous AI tool.",
  },
  {
    q: "Can this strategy work for a new ecommerce site with no domain authority?",
    a: "Yes — in fact, the brand in this case study started with a Domain Authority of 18. The key is focusing on long-tail, low-competition keywords first, building topical depth before chasing high-volume terms. Sites with DA under 20 typically see faster proportional growth because they can rank more easily for niche, specific queries.",
  },
];

export default function EcommerceTrafficCaseStudy() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── dark */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-orange-600/10 blur-[130px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/case-studies" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              Case Studies
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400 text-sm">E-Commerce</span>
          </div>
          <Badge className="mb-5 bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20">
            E-Commerce · Outdoor &amp; Sports Gear
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            How an Outdoor Gear Brand Grew <br className="hidden lg:block" />
            <span className="text-orange-400">Organic Traffic 512%</span> in 6 Months
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
            Starting with a Domain Authority of 18 and 8,000 monthly organic visitors, this direct-to-consumer
            outdoor brand used StackSerp to deploy 14 content clusters — and reached 49,000 monthly organic
            visitors with 287% more organic revenue.
          </p>
        </div>
      </section>

      {/* ── KEY METRICS ── dark accent */}
      <section className="bg-zinc-900 border-y border-white/6 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "512%", label: "Organic traffic growth", sub: "8K → 49K monthly visitors" },
              { value: "287%", label: "Organic revenue increase", sub: "Tracked via GA4 attribution" },
              { value: "340", label: "Posts published", sub: "Over 6 months, 14 clusters" },
              { value: "6 mo", label: "Time to results", sub: "First rankings at week 7" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-orange-400 mb-1">{m.value}</p>
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

          {/* The Challenge */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <Target className="h-4 w-4 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">The Challenge</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-4">
              TrailEdge Gear (name anonymized) had been selling outdoor and hiking equipment online for three years.
              Their product quality was strong — repeat purchase rate was 34% — but 91% of their web traffic
              came from paid search and direct visits. They had a blog with 22 posts that had been untouched
              for 14 months.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-4">
              With customer acquisition costs rising 40% year-over-year on Google Ads and Meta, the founder
              recognized that organic search was the only channel that would compound without continuous spend.
              But their in-house team had no dedicated SEO resource — the marketing team was two people
              managing ads, email, and social.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-6">
              They had tried hiring freelance writers twice. The results were slow (6–8 week turnarounds),
              expensive ($120–$180 per post), and inconsistent in quality. They needed a fundamentally
              different approach.
            </p>
            <div className="rounded-xl border border-red-100 bg-red-50 p-6">
              <h3 className="font-semibold text-zinc-900 mb-3">Key challenges at the start:</h3>
              <ul className="space-y-2">
                {[
                  "Domain Authority of 18 — barely visible to Google for competitive terms",
                  "91% traffic dependency on paid channels — no organic safety net",
                  "22 thin blog posts, no coherent topical strategy",
                  "Two-person marketing team with no dedicated SEO capacity",
                  "Rising CAC: Google Ads CPC up 40% YoY in outdoor/camping vertical",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-red-500 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The Strategy */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">The Strategy: Product Category Content Clusters</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-4">
              The approach was built around topical authority — rather than writing random blog posts,
              TrailEdge would own entire sub-topics within outdoor gear. Each cluster consisted of one
              comprehensive pillar article (2,500–4,000 words) supported by 20–25 tightly focused
              supporting articles (600–1,200 words each).
            </p>
            <p className="text-zinc-600 leading-relaxed mb-6">
              Cluster selection was keyword-research driven: StackSerp&apos;s topic cluster generator
              identified 14 high-opportunity clusters where search volume was substantial but the existing
              content landscape was thin or outdated. Priority was given to clusters with clear commercial
              intent — topics where someone reading the content was likely shopping.
            </p>

            <h3 className="text-lg font-semibold text-zinc-900 mb-4">The 14 Content Clusters</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { cluster: "Hiking Boots (All Types)", posts: 28, pillar: "Best Hiking Boots for Every Terrain" },
                { cluster: "Backpacking Tents", posts: 24, pillar: "Backpacking Tent Buying Guide" },
                { cluster: "Trekking Poles", posts: 18, pillar: "Best Trekking Poles Reviewed" },
                { cluster: "Hydration Systems", posts: 22, pillar: "Hydration Pack vs Water Bottle for Hiking" },
                { cluster: "GPS Devices", posts: 26, pillar: "Best GPS for Hiking & Backpacking" },
                { cluster: "Camp Stoves", posts: 20, pillar: "Best Backpacking Stoves" },
                { cluster: "Sleeping Bags", posts: 32, pillar: "Sleeping Bag Temperature Rating Guide" },
                { cluster: "Headlamps", posts: 16, pillar: "Best Headlamps for Camping" },
                { cluster: "Trekking Apparel", posts: 30, pillar: "Layering System for Hikers" },
                { cluster: "Trail Running Shoes", posts: 22, pillar: "Trail Running Shoes vs Hiking Boots" },
                { cluster: "Hammocks", posts: 14, pillar: "Best Camping Hammocks" },
                { cluster: "Water Filters", posts: 18, pillar: "Best Backpacking Water Filters" },
                { cluster: "First Aid Kits", posts: 16, pillar: "Wilderness First Aid Essentials" },
                { cluster: "Navigation & Maps", posts: 14, pillar: "How to Navigate Without Cell Signal" },
              ].map((c) => (
                <div key={c.cluster} className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{c.cluster}</p>
                    <p className="text-xs text-zinc-500">{c.posts} articles · Pillar: &ldquo;{c.pillar}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h3 className="font-semibold text-zinc-900 mb-2">Why Clusters Work Better Than Individual Posts</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Google&apos;s Helpful Content system rewards websites that demonstrate genuine topical expertise.
                Publishing 28 interconnected articles about hiking boots signals to Google that TrailEdge is an
                authoritative source on the topic — not just a thin affiliate site. This topical authority signal
                caused the pillar articles to rank faster and the supporting articles to capture long-tail traffic
                that competitors weren&apos;t even targeting.
              </p>
            </div>
          </div>

          {/* Implementation */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <Globe className="h-4 w-4 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Implementation: How They Did It</h2>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Keyword Research & Cluster Mapping (Week 1–2)",
                  content: "The team used StackSerp's topic cluster generator to map out the 14 clusters and their supporting keyword sets. Each pillar keyword was validated against Google Search Console data and Ahrefs for difficulty. Supporting articles targeted keywords with less than 20 KD (keyword difficulty) to build early wins.",
                },
                {
                  step: "2",
                  title: "Brand Voice Setup (Week 1)",
                  content: "Before generating a single post, they configured StackSerp's brand voice settings to match TrailEdge's tone: knowledgeable, practical, and adventure-oriented. They uploaded 5 existing high-performing product descriptions as voice samples. This step reduced editing time per post from ~45 minutes to ~12 minutes.",
                },
                {
                  step: "3",
                  title: "Bulk Content Generation (Month 1–5)",
                  content: "Using StackSerp's bulk generation feature, they generated and scheduled 55–65 posts per month. Supporting articles were generated first to build the cluster foundation; pillar articles followed once 10–15 supporting posts were live. StackSerp's WordPress integration published directly — no manual copy-paste required.",
                },
                {
                  step: "4",
                  title: "Internal Linking (Automated)",
                  content: "StackSerp's automatic internal linking connected all supporting articles to their pillar and to related product pages. This created a link equity flow that boosted the category pages TrailEdge most wanted to rank. Internal link density averaged 4–6 contextual links per post.",
                },
                {
                  step: "5",
                  title: "IndexNow Submission (Ongoing)",
                  content: "Every published post was automatically submitted to Google via IndexNow. Average time from publication to Google indexing: 2.3 days. Without IndexNow, the team estimated it would have taken 2–4 weeks per post to get indexed at their domain authority level.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-sm shrink-0 mt-0.5">
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

          {/* Results Deep Dive */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Results: Month-by-Month Breakdown</h2>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="text-left p-3 font-semibold text-zinc-700 border border-zinc-200">Month</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Organic Sessions</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Posts Live</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Page-1 Keywords</th>
                    <th className="text-right p-3 font-semibold text-zinc-700 border border-zinc-200">Organic Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "Baseline (pre-StackSerp)", sessions: "8,200", posts: "22", keywords: "14", revenue: "$4,100" },
                    { month: "Month 1", sessions: "8,600", posts: "77", keywords: "18", revenue: "$4,300" },
                    { month: "Month 2", sessions: "10,400", posts: "135", keywords: "41", revenue: "$5,200" },
                    { month: "Month 3", sessions: "14,800", posts: "192", keywords: "89", revenue: "$8,100" },
                    { month: "Month 4", sessions: "24,300", posts: "250", keywords: "167", revenue: "$13,900" },
                    { month: "Month 5", sessions: "38,700", posts: "307", keywords: "234", revenue: "$18,400" },
                    { month: "Month 6", sessions: "49,200", posts: "340", keywords: "312", revenue: "$15,900*" },
                  ].map((row, i) => (
                    <tr key={row.month} className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}>
                      <td className="p-3 border border-zinc-200 font-medium text-zinc-800">{row.month}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.sessions}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.posts}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.keywords}</td>
                      <td className="p-3 border border-zinc-200 text-right text-zinc-700">{row.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-zinc-400 mt-2">* Month 6 revenue lower due to seasonal dip in outdoor gear (January); trailing 3-month average: $16,066/mo</p>
            </div>

            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Top Performing Content</h3>
            <div className="space-y-3 mb-6">
              {[
                { title: "Best Hiking Boots for Wide Feet (Men's & Women's)", traffic: "3,400/mo", rank: "#2 on Google" },
                { title: "Backpacking Tent Weight Chart: Every Major Brand Compared", traffic: "2,800/mo", rank: "#1 on Google" },
                { title: "Hydration Pack vs Water Bottle: Which is Right for You?", traffic: "2,200/mo", rank: "#3 on Google" },
                { title: "Best GPS for Hiking Under $200 [Tested 2025]", traffic: "1,900/mo", rank: "#1 on Google" },
                { title: "How to Choose Trekking Poles: Complete Buyer's Guide", traffic: "1,700/mo", rank: "#4 on Google" },
              ].map((post) => (
                <div key={post.title} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-800 font-medium">{post.title}</span>
                  </div>
                  <div className="flex gap-4 shrink-0 ml-4">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">{post.traffic}</span>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{post.rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="mb-16">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 relative">
              <Quote className="h-8 w-8 text-orange-300 mb-4" />
              <blockquote className="text-lg text-zinc-700 leading-relaxed italic mb-6">
                &ldquo;I was skeptical that AI content could actually rank. We&apos;d tried other tools that
                produced generic garbage. StackSerp was different — the content had genuine depth and our
                brand voice came through. By month 4 we were getting more organic sessions in a week than
                we used to get in a month. SEO is now our #1 channel.&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-zinc-900">Head of Marketing, TrailEdge Gear</p>
                <p className="text-sm text-zinc-500">Direct-to-consumer outdoor equipment brand</p>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">5 Key Takeaways for Ecommerce SEO</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "Topical clusters beat individual high-volume keywords",
                  desc: "Publishing 28 articles on hiking boots built more authority than targeting 1 high-volume keyword. Google rewards depth, and the cluster approach lifted rankings across the entire topic.",
                },
                {
                  title: "Long-tail keywords compound faster",
                  desc: "Articles targeting 3–5 word phrases with 200–800 monthly searches ranked in weeks instead of months. These low-competition wins built domain authority that then lifted the higher-volume pillar articles.",
                },
                {
                  title: "Consistent publishing velocity matters",
                  desc: "Publishing 55+ posts per month sent clear freshness signals to Google. Sites that publish 2–4 posts per month typically take 12–18 months to reach similar results.",
                },
                {
                  title: "Internal linking is the multiplier",
                  desc: "Every supporting article linked to the pillar and to 2–3 product category pages. This link equity flow directly lifted the commercial pages that drive revenue — not just the blog.",
                },
                {
                  title: "Content and conversion optimization work together",
                  desc: "High organic traffic doesn't automatically mean high revenue. TrailEdge added comparison tables, product schema markup, and clear CTAs to their top-performing posts, which improved organic conversion rate from 1.2% to 2.9%.",
                },
              ].map((t, i) => (
                <div key={t.title} className="flex gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </span>
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
                { href: "/case-studies/saas-competitor-comparison-content-strategy", tag: "SaaS", title: "How a SaaS Startup Got 400+ Monthly Organic Signups" },
                { href: "/case-studies/niche-publisher-seo-affiliate-revenue", tag: "Publisher", title: "Niche Publisher Tripled Traffic and Doubled Affiliate Revenue" },
              ].map((r) => (
                <Link key={r.href} href={r.href} className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group">
                  <Badge variant="outline" className="mb-3 text-xs">{r.tag}</Badge>
                  <p className="text-sm font-semibold text-zinc-800 group-hover:text-orange-600 transition-colors leading-snug">{r.title}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-400 mt-2">
                    Read case study <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── dark */}
      <section className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-orange-600/10 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Build Your Ecommerce SEO Engine
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            StackSerp handles the content strategy, writing, and publishing. You focus on products and customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0">
              <Link href="/register">
                Start Free — No Credit Card <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base text-zinc-300 border-white/15 bg-transparent hover:bg-white/5">
              <Link href="/case-studies">All Case Studies</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
