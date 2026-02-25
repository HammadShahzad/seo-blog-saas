"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/ui/logo";
import { NavAuthButtons } from "@/components/marketing/nav-auth-buttons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, LayoutDashboard, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blogs", label: "Blog" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

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
