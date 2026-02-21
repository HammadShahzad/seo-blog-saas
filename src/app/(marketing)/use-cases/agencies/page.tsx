import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, TrendingUp, CheckCircle2, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "SEO Automation for Marketing Agencies | StackSerp",
  description:
    "Scale your agency's content output and increase margins. StackSerp lets you manage multiple clients from one dashboard and automate their SEO.",
  keywords: "SEO for agencies, AI content for agencies, white label SEO tool, agency content scaling",
  openGraph: {
    title: "StackSerp for Marketing Agencies",
    description: "Scale your agency's content output and increase margins with StackSerp.",
    type: "website",
    url: "https://stackserp.com/use-cases/agencies",
  },
  alternates: {
    canonical: "https://stackserp.com/use-cases/agencies",
  },
};

export default function AgenciesUseCasePage() {
  return (
    <>
      {/* Navigation */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-blue-200 bg-blue-50 text-blue-700">
            For Marketing Agencies
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Scale your content output. <br />
            <span className="text-blue-600">Multiply your margins.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Stop losing 70% of your retainer to freelance writers. StackSerp allows your agency to deliver world-class SEO content at a fraction of the cost, across dozens of clients.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 h-14 bg-blue-600 hover:bg-blue-700">
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
              <Globe className="h-10 w-10 text-blue-600 mb-6" />
              <h3 className="text-xl font-bold mb-3">Multi-Client Dashboard</h3>
              <p className="text-muted-foreground">
                Manage 50+ client websites from a single account. Isolate keywords, brand voices, and analytics for each project securely.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm">
              <DollarSign className="h-10 w-10 text-green-600 mb-6" />
              <h3 className="text-xl font-bold mb-3">Higher Profit Margins</h3>
              <p className="text-muted-foreground">
                Drop your cost per article from $150 to pennies. Keep your retainers high while increasing the volume and quality of output.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm">
              <TrendingUp className="h-10 w-10 text-purple-600 mb-6" />
              <h3 className="text-xl font-bold mb-3">Faster Client Results</h3>
              <p className="text-muted-foreground">
                Publish high-velocity content clusters in days instead of months. Help your clients rank faster and prove ROI immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Agency Features Checklist</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Unlimited user seats for your team",
              "Client-specific brand voice settings",
              "Automated WordPress & Webflow publishing",
              "Built-in topical map generation",
              "Whitelabel reporting (Coming Soon)",
              "Priority dedicated support",
              "Advanced internal link siloing",
              "Bulk generation up to 100 posts/day",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border">
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
