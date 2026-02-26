"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/ui/logo";
import { NavAuthButtons } from "@/components/marketing/nav-auth-buttons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  LayoutDashboard,
  ArrowRight,
  Brain,
  Search,
  Network,
  Plug,
  BarChart3,
  Share2,
  ChevronDown,
} from "lucide-react";

/* ── Mega-menu feature categories ── */
const featureCategories = [
  {
    icon: Brain,
    title: "AI Content Engine",
    description: "7-step pipeline, brand voice, AI images, 1,500–2,500 word articles",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: Search,
    title: "SEO & Optimization",
    description: "Meta tags, schema markup, internal linking, content scoring",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Network,
    title: "Content Strategy",
    description: "Topic clusters, content calendar, keyword queue management",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Plug,
    title: "Publishing & CMS",
    description: "WordPress, Ghost, Shopify, Webflow, custom webhooks",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Tracking",
    description: "Search Console, per-post traffic, keyword rankings, reports",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Share2,
    title: "Social & Distribution",
    description: "Twitter/X, LinkedIn auto-posting, IndexNow, RSS feeds",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

const navLinks = [
  { href: "/case-studies", label: "Case Studies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blogs", label: "Blog" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const { data: session, status } = useSession();
  const megaRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isFeatureActive = pathname === "/features" || pathname.startsWith("/features/");

  const handleMegaEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMegaOpen(true);
  };

  const handleMegaLeave = () => {
    timeoutRef.current = setTimeout(() => setMegaOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
              <Logo className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">StackSerp</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {/* Features with mega menu */}
            <div
              ref={megaRef}
              className="relative"
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
            >
              <Link
                href="/features"
                className={`text-sm font-medium transition-colors inline-flex items-center gap-1 ${
                  isFeatureActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                Features
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
              </Link>

              {/* Mega menu dropdown */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${
                  megaOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="w-[680px] rounded-xl border bg-background shadow-xl shadow-black/8 overflow-hidden">
                  <div className="grid grid-cols-3 gap-px bg-border/40">
                    {featureCategories.map((cat) => (
                      <Link
                        key={cat.title}
                        href="/features"
                        onClick={() => setMegaOpen(false)}
                        className="bg-background p-5 hover:bg-accent/50 transition-colors group"
                      >
                        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${cat.iconBg} mb-3`}>
                          <cat.icon className={`h-5 w-5 ${cat.iconColor}`} />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {cat.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/30">
                    <span className="text-xs text-muted-foreground">
                      11 features · Free to start
                    </span>
                    <Link
                      href="/features"
                      onClick={() => setMegaOpen(false)}
                      className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                    >
                      See all features
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Other nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth buttons + mobile hamburger */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <NavAuthButtons ctaLabel="Start Ranking Free" />
            </div>

            {/* Mobile hamburger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-16">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <div className="flex flex-col gap-1">
                  <Link
                    href="/features"
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isFeatureActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    Features
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        pathname === link.href || pathname.startsWith(link.href + "/")
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4 px-4 flex flex-col gap-2">
                    {status !== "loading" && (
                      session ? (
                        <Button asChild className="w-full">
                          <Link href="/dashboard" onClick={() => setOpen(false)}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button asChild variant="outline" className="w-full">
                            <Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
                          </Button>
                          <Button asChild className="w-full">
                            <Link href="/register" onClick={() => setOpen(false)}>
                              Start Ranking Free
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </>
                      )
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
