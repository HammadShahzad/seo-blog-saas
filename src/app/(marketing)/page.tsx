import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { NavAuthButtons } from "@/components/marketing/nav-auth-buttons";
import {
  Zap,
  Search,
  FileText,
  Image as ImageIcon,
  Link2,
  Share2,
  BarChart3,
  Globe,
  ArrowRight,
  CheckCircle2,
  Bot,
  Sparkles,
  XCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Star,
  Quote,
  Layout,
  Cpu,
  Target,
  Layers,
  Settings
} from "lucide-react";

export const metadata: Metadata = {
  title: "StackSerp | AI SEO Auto-Blogging & Content Generation Platform",
  description:
    "Dominate search rankings with StackSerp. Our AI automates keyword research, content generation, internal linking, and publishing. The ultimate SEO tool for startups and agencies.",
  keywords: "AI blog writer, SEO automation, auto-blogging, programmatic SEO, content marketing AI, StackSerp",
  openGraph: {
    title: "StackSerp | Automate Your SEO Growth",
    description:
      "Generate months of high-ranking SEO content without writing a single word. AI research, writing, and publishing—all on autopilot.",
    type: "website",
    url: "https://stackserp.com",
    siteName: "StackSerp",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StackSerp AI SEO Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StackSerp | Automate Your SEO Growth",
    description: "Generate months of high-ranking SEO content without writing a single word.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://stackserp.com",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
                <Logo className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">StackSerp</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="/use-cases" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Use Cases
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link href="/blogs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
            </div>
            <NavAuthButtons ctaLabel="Start Ranking Free" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-48 overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background"></div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 -z-10 opacity-30">
          <div className="w-[800px] h-[800px] rounded-full bg-primary/20 blur-3xl filter mix-blend-multiply"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 -z-10 opacity-30">
          <div className="w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-3xl filter mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 backdrop-blur-sm animate-fade-in-up hover:bg-primary/10 transition-colors cursor-pointer">
            <Sparkles className="mr-2 h-4 w-4 fill-primary" />
            <span>Introducing StackSerp v2.0 with Deep Content Engine</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Automate Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-600">
              SEO Content Machine.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
            Publish months of high-ranking, human-quality SEO content in minutes. We handle keyword clustering, AI generation, internal linking, and publishing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
            <Button asChild size="lg" className="text-lg px-8 h-14 w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1 group">
              <Link href="/register">
                Start Ranking for Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto bg-background/50 backdrop-blur border-muted-foreground/20 hover:bg-muted/50 transition-all">
              <Link href="#demo">Watch 2-Min Demo</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-muted-foreground animate-fade-in-up delay-400 font-medium">
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span>100% AI-Detection Safe</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
              <Zap className="h-5 w-5 text-green-500" />
              <span>Publishes instantly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Powering organic growth for 2,000+ modern teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-2xl font-black tracking-tighter"><Zap className="h-8 w-8 text-yellow-500" /> TechFlow</div>
            <div className="flex items-center gap-2 text-2xl font-black tracking-tighter"><Globe className="h-8 w-8 text-blue-500" /> GlobalReach</div>
            <div className="flex items-center gap-2 text-2xl font-black tracking-tighter"><BarChart3 className="h-8 w-8 text-green-500" /> ScaleUp</div>
            <div className="flex items-center gap-2 text-2xl font-black tracking-tighter"><Bot className="h-8 w-8 text-purple-500" /> AI Daily</div>
            <div className="flex items-center gap-2 text-2xl font-black tracking-tighter"><TrendingUp className="h-8 w-8 text-rose-500" /> RankFast</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 px-4 bg-background relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary px-4 py-1.5 text-sm">Everything You Need</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              An entire SEO agency in <br className="hidden md:block" /> a single dashboard.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Replace your keyword research tools, freelance writers, editors, and VA publishers with one automated engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Main Feature - Large */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-muted/50 to-muted/10 border rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <Search className="w-64 h-64" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Programmatic Keyword Clustering</h3>
                  <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                    Enter a broad seed keyword, and our AI instantly builds a robust topical map. We group keywords by intent and volume, ensuring you build unshakeable topical authority without keyword cannibalization.
                  </p>
                </div>
                <div className="flex gap-3 mt-8">
                  <Badge variant="secondary" className="px-3 py-1 text-sm">Search Intent Analysis</Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm">Topical Mapping</Badge>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-500/5 to-transparent border rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Human-Grade AI Writing</h3>
              <p className="text-muted-foreground">
                Advanced AI writing that reads naturally, passes AI detectors, and actually engages your audience.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-500/5 to-transparent border rounded-3xl p-8 relative overflow-hidden group hover:border-green-500/30 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-6">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Auto Internal Linking</h3>
              <p className="text-muted-foreground">
                We automatically scan your existing posts and interlink them using optimal anchor text to pass link juice efficiently.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-blue-500/5 to-transparent border rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Image Generation</h3>
              <p className="text-muted-foreground">
                Never search for stock photos again. We generate unique, context-aware featured images and diagrams for every post.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="md:col-span-2 bg-gradient-to-br from-rose-500/5 to-transparent border rounded-3xl p-8 relative overflow-hidden group hover:border-rose-500/30 transition-colors flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">One-Click CMS Publishing</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your WordPress, Webflow, or custom Next.js stack. We format everything, handle meta tags, and publish instantly.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/features">See All Integrations <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="w-full md:w-1/2 h-full bg-background rounded-xl border shadow-sm p-4 relative">
                {/* Mini mock UI of integrations */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">WP</div>
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">Next</div>
                  <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-xs">WF</div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded-full animate-pulse"></div>
                  <div className="h-3 w-4/5 bg-muted rounded-full animate-pulse delay-75"></div>
                  <div className="h-3 w-5/6 bg-muted rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works with Visuals */}
      <section className="py-32 px-4 bg-muted/10 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 bg-background">The Process</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                From idea to live article in under 3 minutes.
              </h2>
              
              <div className="space-y-8">
                {[
                  { title: "Define Your Goal", desc: "Enter a seed keyword or connect your Google Search Console. We'll identify what your audience is searching for.", icon: Settings, color: "text-blue-500" },
                  { title: "Review The Topical Map", desc: "Our AI generates a full content cluster. Approve or modify the titles before we start writing.", icon: Layers, color: "text-purple-500" },
                  { title: "Auto-Generate & Publish", desc: "We write the content, generate images, inject internal links, and push straight to your CMS.", icon: Cpu, color: "text-green-500" },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative group">
                    {/* Vertical Line */}
                    {idx !== 2 && <div className="absolute left-[1.15rem] top-12 bottom-[-2rem] w-0.5 bg-muted group-hover:bg-primary/50 transition-colors"></div>}
                    
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-background border-2 border-muted group-hover:border-primary flex items-center justify-center transition-colors">
                      <step.icon className={`h-4 w-4 ${step.color}`} />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl opacity-50"></div>
              <div className="relative bg-background border rounded-3xl shadow-2xl p-2 md:p-4">
                <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-[500px]">
                  {/* Fake Browser Window */}
                  <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col gap-6">
                    <div className="h-8 w-1/3 bg-muted rounded-lg"></div>
                    <div className="h-10 w-full bg-primary/10 border border-primary/20 rounded-lg flex items-center px-4 gap-3 text-primary">
                      <Search className="h-5 w-5" />
                      <span className="font-medium">Best CRM for Marketing Agencies</span>
                    </div>
                    
                    <div className="flex-1 border rounded-xl bg-muted/10 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-32 bg-muted rounded"></div>
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">Generating...</Badge>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex gap-3 items-center">
                            <div className={`w-4 h-4 rounded-full ${i === 1 ? 'bg-green-500' : 'bg-muted'} flex items-center justify-center`}>
                              {i === 1 && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                            <div className="h-3 w-full bg-muted/60 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-32 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for growth.</h2>
            <p className="text-xl text-muted-foreground">Who uses StackSerp?</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border rounded-3xl hover:shadow-xl transition-all bg-card flex flex-col text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Marketing Agencies</h3>
              <p className="text-muted-foreground mb-6 flex-1">
                Scale your client content offerings instantly. Manage 50+ websites from one dashboard, without hiring more writers.
              </p>
              <Link href="/use-cases/agencies" className="text-primary font-medium hover:underline inline-flex items-center justify-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="p-8 border rounded-3xl hover:shadow-xl transition-all bg-card flex flex-col text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">SaaS Startups</h3>
              <p className="text-muted-foreground mb-6 flex-1">
                Build an organic acquisition moat early. Generate product-led content that drives high-intent signups to your app.
              </p>
              <Link href="/use-cases/startups" className="text-primary font-medium hover:underline inline-flex items-center justify-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="p-8 border rounded-3xl hover:shadow-xl transition-all bg-card flex flex-col text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Layout className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Niche Publishers</h3>
              <p className="text-muted-foreground mb-6 flex-1">
                Grow your portfolio of affiliate and ad-revenue sites faster. StackSerp creates deep, authoritative silos automatically.
              </p>
              <Link href="/use-cases/publishers" className="text-primary font-medium hover:underline inline-flex items-center justify-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden border-t">
        <div className="absolute inset-0 bg-primary/5 -z-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-8 px-4 py-1.5 text-sm bg-primary/20 text-primary hover:bg-primary/30 border-none">Start Growing Today</Badge>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Stop waiting. Start ranking.
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the smart founders who are automating their organic growth. 
            Get your first 5 high-quality, SEO-optimized posts for free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-xl px-12 h-16 shadow-2xl hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
              <Link href="/register">
                Start Ranking Free
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6 font-medium">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold">StackSerp</span>
            </Link>
            <p className="text-muted-foreground max-w-xs leading-relaxed mt-2">
              The automated SEO content platform. Build topical authority and drive organic traffic on autopilot.
            </p>
            <div className="flex gap-4 mt-4">
              {/* Social Icons Placeholder */}
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">X</div>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">in</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Product</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Resources</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link href="/blogs" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/use-cases" className="hover:text-primary transition-colors">Use Cases</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/dpa" className="hover:text-primary transition-colors">DPA</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StackSerp Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            All systems operational
          </div>
        </div>
      </footer>
    </div>
  );
}
