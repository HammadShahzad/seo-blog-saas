import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function AboutPage() {
  return (
    <>
      {/* Navigation */}
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm bg-background">
            Our Story
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Making organic growth <br className="hidden md:block" /> accessible to everyone.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We spent years running SEO agencies and building SaaS products. We realized that the hardest part wasn't building a great product—it was getting people to discover it.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 bg-muted/10 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What we believe in</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-background p-8 rounded-2xl border shadow-sm text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Speed to Value</h3>
              <p className="text-muted-foreground">SEO traditionally takes months. We build tools that cut that time down to minutes, getting you results faster.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm text-center">
              <div className="mx-auto w-12 h-12 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality over Quantity</h3>
              <p className="text-muted-foreground">AI can generate infinite garbage. We optimize for high-quality, human-readable content that actually ranks.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm text-center">
              <div className="mx-auto w-12 h-12 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Total Automation</h3>
              <p className="text-muted-foreground">If a computer can do it, a human shouldn't have to. We automate the busywork so you can focus on strategy.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm text-center">
              <div className="mx-auto w-12 h-12 bg-rose-500/10 text-rose-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Customer First</h3>
              <p className="text-muted-foreground">We iterate based on your feedback. Our roadmap is driven by what actually helps you acquire more users.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join us on our journey</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to scale your organic traffic? Try StackSerp today and see the difference automation makes.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/register">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
