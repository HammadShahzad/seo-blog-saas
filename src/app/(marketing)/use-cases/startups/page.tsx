import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { NavAuthButtons } from "@/components/marketing/nav-auth-buttons";
import { ArrowRight, Rocket, Target, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "SEO Automation for SaaS Startups | StackSerp",
  description:
    "Build a powerful organic acquisition moat early. StackSerp helps startups rank for high-intent keywords without hiring an expensive content team.",
  keywords: "SEO for startups, SaaS content marketing, automated startup SEO, B2B SaaS SEO",
  openGraph: {
    title: "StackSerp for SaaS Startups",
    description: "Build an organic acquisition moat early with automated SEO.",
    type: "website",
    url: "https://stackserp.com/use-cases/startups",
  },
  alternates: {
    canonical: "https://stackserp.com/use-cases/startups",
  },
};

export default function StartupsUseCasePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">StackSerp</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="/use-cases" className="text-sm font-medium text-foreground">
                Use Cases
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
            </div>
            <NavAuthButtons ctaLabel="Start Growing Free" />
          </div>
        </div>
      </nav>

      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-purple-200 bg-purple-50 text-purple-700">
            For SaaS Startups
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Build your organic moat <br />
            <span className="text-purple-600">before your competitors do.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Founders don't have time to write 3,000-word blog posts or manage freelance teams. StackSerp acts as your first marketing hire, driving high-intent signups on autopilot.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 h-14 bg-purple-600 hover:bg-purple-700">
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-muted/10 border-y">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-2xl border shadow-sm">
              <Rocket className="h-10 w-10 text-purple-600 mb-6" />
              <h3 className="text-xl font-bold mb-3">Product-Led Content</h3>
              <p className="text-muted-foreground">
                Target "Best [Your Category] Tools" and "How to do [Your Core Feature]" keywords to capture bottom-of-the-funnel traffic ready to convert.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm">
              <Target className="h-10 w-10 text-blue-600 mb-6" />
              <h3 className="text-xl font-bold mb-3">Zero Management</h3>
              <p className="text-muted-foreground">
                No Trello boards, no chasing deadlines. Just input your seed keywords and let StackSerp research, draft, and publish to your blog.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm">
              <Zap className="h-10 w-10 text-rose-600 mb-6" />
              <h3 className="text-xl font-bold mb-3">Predictable Growth</h3>
              <p className="text-muted-foreground">
                Paid ads burn cash. SEO compounds. Invest in your domain authority early so you aren't reliant on Meta or Google Ads later.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-4 w-4" />
            <span className="font-semibold">StackSerp</span>
          </Link>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} StackSerp</p>
        </div>
      </footer>
    </div>
  );
}
