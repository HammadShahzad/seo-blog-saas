"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";

interface NavAuthButtonsProps {
  ctaLabel?: string;
}

export function NavAuthButtons({ ctaLabel = "Start Ranking Free" }: NavAuthButtonsProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />;
  }

  if (session) {
    return (
      <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all gap-2">
        <Link href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" className="hidden sm:inline-flex">
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
        <Link href="/register">
          {ctaLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
