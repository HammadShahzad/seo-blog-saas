import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { GlobalJobsProvider } from "@/components/dashboard/global-jobs-context";
import { GlobalJobsWidget } from "@/components/dashboard/global-jobs-widget";
import { getCurrentOrganization } from "@/lib/get-session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, organization } = await getCurrentOrganization();

  const websites = (organization.websites ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    domain: w.domain,
    status: w.status,
  }));

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    systemRole: session.user.systemRole,
  };

  return (
    <GlobalJobsProvider>
      <SidebarProvider>
        {/* Sidebar — desktop only */}
        <div className="hidden md:contents">
          <AppSidebar
            websites={websites}
            currentWebsiteId={websites[0]?.id}
            user={user}
          />
        </div>

        <SidebarInset>
          {/* Header: hide sidebar trigger on mobile (bottom nav replaces it) */}
          <DashboardHeader hideTriggerOnMobile />
          {/* Extra bottom padding on mobile to clear the bottom nav bar */}
          <main className="flex-1 overflow-auto p-4 pb-20 sm:p-6 sm:pb-6 md:pb-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* Bottom nav — mobile only */}
      <MobileBottomNav
        websites={websites}
        currentWebsiteId={websites[0]?.id}
        user={user}
      />

      <GlobalJobsWidget />
    </GlobalJobsProvider>
  );
}
