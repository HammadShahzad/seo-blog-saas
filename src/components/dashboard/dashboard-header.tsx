"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  hideTriggerOnMobile?: boolean;
}

export function DashboardHeader({ hideTriggerOnMobile }: DashboardHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname === "/dashboard/websites") return "Websites";
    if (pathname.includes("/websites/new")) return "Add Website";
    if (pathname.includes("/posts")) return "Blog Posts";
    if (pathname.includes("/keywords")) return "Keywords";
    if (pathname.includes("/generator")) return "AI Generator";
    if (pathname.includes("/clusters")) return "Topic Clusters";
    if (pathname.includes("/links")) return "Internal Links";
    if (pathname.includes("/analytics")) return "Analytics";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/billing")) return "Billing";
    if (pathname.includes("/team")) return "Team";
    return "Dashboard";
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className={hideTriggerOnMobile ? "hidden md:flex items-center gap-4" : "flex items-center gap-4"}>
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
      </div>
      <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
    </header>
  );
}
