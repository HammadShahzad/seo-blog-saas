"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Bot,
  MoreHorizontal,
  KeyRound,
  Link2,
  Network,
  CalendarDays,
  BarChart3,
  Settings,
  Users,
  CreditCard,
  User,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { WebsiteSwitcher } from "./website-switcher";
import { Separator } from "@/components/ui/separator";

interface Website {
  id: string;
  name: string;
  domain: string;
  status: string;
}

interface MobileBottomNavProps {
  websites: Website[];
  currentWebsiteId?: string;
  user: {
    name?: string | null;
    email?: string | null;
    systemRole?: string;
  };
}

export function MobileBottomNav({ websites, currentWebsiteId: defaultWebsiteId, user }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Match the same ID-from-URL logic as AppSidebar
  const urlWebsiteIdMatch = pathname.match(/\/dashboard\/websites\/([^/]+)/);
  const urlWebsiteId = urlWebsiteIdMatch?.[1];
  const currentWebsiteId = (urlWebsiteId && urlWebsiteId !== "new" && websites.some(w => w.id === urlWebsiteId))
    ? urlWebsiteId
    : defaultWebsiteId;

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  // Determine if "More" tab should be highlighted (none of the primary tabs match)
  const primaryPaths = [
    "/dashboard",
    "/dashboard/websites",
    currentWebsiteId ? `/dashboard/websites/${currentWebsiteId}/posts` : null,
    currentWebsiteId ? `/dashboard/websites/${currentWebsiteId}/generator` : null,
  ].filter(Boolean) as string[];

  const isMoreActive = !primaryPaths.some((p, i) => {
    if (i === 0) return pathname === p;
    return pathname.startsWith(p);
  }) && pathname.startsWith("/dashboard");

  const primaryTabs = [
    {
      label: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Sites",
      href: "/dashboard/websites",
      icon: Globe,
      active: pathname === "/dashboard/websites" || pathname.startsWith("/dashboard/websites/new"),
    },
    ...(currentWebsiteId
      ? [
          {
            label: "Posts",
            href: `/dashboard/websites/${currentWebsiteId}/posts`,
            icon: FileText,
            active: isActive(`/dashboard/websites/${currentWebsiteId}/posts`),
          },
          {
            label: "Generate",
            href: `/dashboard/websites/${currentWebsiteId}/generator`,
            icon: Bot,
            active: isActive(`/dashboard/websites/${currentWebsiteId}/generator`),
          },
        ]
      : [
          {
            label: "Team",
            href: "/dashboard/team",
            icon: Users,
            active: isActive("/dashboard/team"),
          },
          {
            label: "Billing",
            href: "/dashboard/billing",
            icon: CreditCard,
            active: isActive("/dashboard/billing"),
          },
        ]),
  ];

  // More sheet sections
  const websiteItems = currentWebsiteId
    ? [
        { label: "Dashboard", href: `/dashboard/websites/${currentWebsiteId}`, icon: BarChart3 },
        { label: "Keywords", href: `/dashboard/websites/${currentWebsiteId}/keywords`, icon: KeyRound },
        { label: "Internal Links", href: `/dashboard/websites/${currentWebsiteId}/links`, icon: Link2 },
        { label: "Topic Clusters", href: `/dashboard/websites/${currentWebsiteId}/clusters`, icon: Network },
        { label: "Calendar", href: `/dashboard/websites/${currentWebsiteId}/calendar`, icon: CalendarDays },
        { label: "Analytics", href: `/dashboard/websites/${currentWebsiteId}/analytics`, icon: BarChart3 },
        { label: "Site Settings", href: `/dashboard/websites/${currentWebsiteId}/settings`, icon: Settings },
      ]
    : [];

  const accountItems = [
    ...(user.systemRole === "ADMIN"
      ? [{ label: "Admin Panel", href: "/dashboard/admin", icon: Shield }]
      : []),
    { label: "Team", href: "/dashboard/team", icon: Users },
    { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { label: "Account Settings", href: "/dashboard/settings", icon: User },
  ];

  return (
    <>
      {/* Bottom nav bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t safe-bottom">
        <div className="flex items-stretch h-16">
          {primaryTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                tab.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${tab.active ? "stroke-[2.2]" : "stroke-[1.7]"}`} />
              <span>{tab.label}</span>
            </Link>
          ))}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
              isMoreActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MoreHorizontal className={`h-5 w-5 ${isMoreActive ? "stroke-[2.2]" : "stroke-[1.7]"}`} />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="h-[85dvh] rounded-t-2xl px-0 pb-0 flex flex-col">
          <SheetHeader className="px-4 pt-2 pb-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo className="h-4 w-4" />
              </div>
              <SheetTitle className="text-base font-bold">StackSerp</SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Website switcher */}
            {websites.length > 0 && (
              <div className="px-4 py-3 border-b">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Website</p>
                <WebsiteSwitcher websites={websites} currentWebsiteId={currentWebsiteId} />
              </div>
            )}

            {/* Website nav items */}
            {websiteItems.length > 0 && (
              <div className="px-2 py-2 border-b">
                {websiteItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive(item.href) && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                  </Link>
                ))}
              </div>
            )}

            {/* Account items */}
            <div className="px-2 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Account</p>
              {accountItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive(item.href) && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                </Link>
              ))}
            </div>
          </div>

          {/* User profile + sign out pinned at bottom */}
          <div className="shrink-0 border-t bg-background">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 font-medium shrink-0 ml-3"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
            {/* Safe area spacer for iOS home indicator */}
            <div className="h-safe-bottom bg-background" />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
