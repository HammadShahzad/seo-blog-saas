"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronsUpDown, Plus, Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Website {
  id: string;
  name: string;
  domain: string;
  status: string;
}

interface WebsiteSwitcherProps {
  websites: Website[];
  currentWebsiteId?: string;
}

export function WebsiteSwitcher({ websites, currentWebsiteId }: WebsiteSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentWebsite = websites.find((w) => w.id === currentWebsiteId);

  const handleSelect = (websiteId: string) => {
    setOpen(false);
    // Navigate to the same sub-page but for the new website
    const segments = pathname.split("/");
    const websiteIdIndex = segments.findIndex((s) => s === currentWebsiteId);
    if (websiteIdIndex !== -1) {
      segments[websiteIdIndex] = websiteId;
      router.push(segments.join("/"));
    } else {
      router.push(`/dashboard/websites/${websiteId}`);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between gap-2 px-3"
        >
          <div className="flex items-center gap-2 truncate">
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">
              {currentWebsite?.name || "Select Website"}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        {websites.map((website) => (
          <DropdownMenuItem
            key={website.id}
            onClick={() => handleSelect(website.id)}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm">{website.name}</span>
              <span className="text-xs text-muted-foreground">
                {website.domain}
              </span>
            </div>
            {website.id === currentWebsiteId && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {websites.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            router.push("/dashboard/websites/new");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Website
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
