import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Target, Zap, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | StackSerp",
  description:
    "Learn about StackSerp's mission to democratize SEO and content marketing. We're building the ultimate AI engine for founders and agencies.",
  keywords: "About StackSerp, AI content company, automated SEO startup",
  openGraph: {
    title: "About StackSerp | Our Mission & Vision",
    description: "We believe great products deserve to be found. Learn how we're automating organic growth.",
    type: "website",
    url: "https://stackserp.com/about",
  },
  alternates: {
    canonical: "https://stackserp.com/about",
  },
};

const values = [
  {
    icon: Zap,
    title: "Speed to Value",
    description: "SEO traditionally takes months. We build tools that cut that time down to minutes, getting you results faster.",
    accent: "text-amber-400",
    glow: "bg-amber-600/20",
  },
  {
    icon: Target,
    title: "Quality over Quantity",
    description: "AI can generate infinite garbage. We optimize for high-quality, human-readable content that actually ranks.",
    accent: "text-purple-400",
    glow: "bg-purple-600/20",
  },
  {
    icon: Globe,
    title: "Total Automation",
    description: "If a computer can do it, a human shouldn't have to. We automate the busywork so you can focus on strategy.",
    accent: "text-emerald-400",
    glow: "bg-emerald-600/20",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "We iterate based on your feedback. Our roadmap is driven by what actually helps you acquire more users.",
    accent: "text-rose-400",
    glow: "bg-rose-600/20",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ── dark */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-6">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Making organic growth <br className="hidden md:block" />
            <span className="text-indigo-400">accessible to everyone.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            We spent years running SEO agencies and building SaaS products. We realized that the hardest part wasn't building a great product — it was getting people to discover it.
          </p>
        </div>
      </section>

      {/* ── MISSION ── light */}
      <section className="py-20 px-4 bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 text-zinc-600 leading-relaxed text-lg">
            <p>
              <span className="font-semibold text-zinc-900">StackSerp was born out of frustration.</span> We watched incredible products struggle to gain traction — not because the products were bad, but because content marketing was slow, expensive, and hard to scale.
            </p>
            <p>
              A typical SEO content operation requires keyword research tools, a team of writers, editors, SEO specialists, image designers, and someone to actually push everything into the CMS. Most companies can't afford all of that. And even those who can, find the whole process too slow to keep pace with their market.
            </p>
            <p>
              So we built StackSerp: a single platform that does all of it automatically. Research, writing, optimization, internal linking, featured images, metadata, and one-click publishing. What used to take a team of 5 people now takes one click.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Our mission is simple:</span> make organic growth accessible to every company, regardless of size or budget. If you have a great product, the world deserves to find it.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALUES ── light gray */}
      <section className="py-20 px-4 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-3">What we believe in</h2>
            <p className="text-zinc-500">The principles that guide every decision we make.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white rounded-2xl border border-zinc-200 p-7 text-center hover:shadow-md transition-shadow">
                  <div className={`mx-auto w-12 h-12 ${v.glow} rounded-xl flex items-center justify-center mb-5`}>
                    <Icon className={`h-6 w-6 ${v.accent}`} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-3">{v.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── dark */}
      <section className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-indigo-600/15 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Join us on our journey</h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Ready to scale your organic traffic? Try StackSerp today and see the difference automation makes.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40">
            <Link href="/register">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
