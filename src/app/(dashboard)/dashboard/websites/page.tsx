import { getCurrentOrganization } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Plus,
  ArrowRight,
  FileText,
  KeyRound,
  Eye,
  MoreVertical,
  Pause,
  Trash2,
  Settings,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function WebsitesPage() {
  const { organization } = await getCurrentOrganization();

  // Get stats for each website
  const websitesWithStats = await Promise.all(
    organization.websites.map(async (website) => {
      const [postCount, publishedCount, pendingKeywords, totalViews] =
        await Promise.all([
          prisma.blogPost.count({ where: { websiteId: website.id } }),
          prisma.blogPost.count({
            where: { websiteId: website.id, status: "PUBLISHED" },
          }),
          prisma.blogKeyword.count({
            where: { websiteId: website.id, status: "PENDING" },
          }),
          prisma.blogPost.aggregate({
            where: { websiteId: website.id },
            _sum: { views: true },
          }),
        ]);

      return {
        ...website,
        postCount,
        publishedCount,
        pendingKeywords,
        totalViews: totalViews._sum.views || 0,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Websites</h2>
          <p className="text-muted-foreground mt-1">
            Manage your websites and their content.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/websites/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Website
          </Link>
        </Button>
      </div>

      {websitesWithStats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No websites yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Add your first website to start generating AI-powered SEO content.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/websites/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Website
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {websitesWithStats.map((website) => (
            <Card
              key={website.id}
              className="group hover:shadow-lg transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-bold"
                      style={{
                        backgroundColor: website.primaryColor || "#4F46E5",
                      }}
                    >
                      {website.name[0].toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {website.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        {website.domain}
                        <ExternalLink className="h-3 w-3" />
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/websites/${website.id}/settings`}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Website
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Website
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge
                    variant={
                      website.status === "ACTIVE" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {website.status.toLowerCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {website.niche}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 py-3 border-t border-b mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <FileText className="h-3 w-3" />
                    </div>
                    <p className="text-lg font-semibold">
                      {website.publishedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <KeyRound className="h-3 w-3" />
                    </div>
                    <p className="text-lg font-semibold">
                      {website.pendingKeywords}
                    </p>
                    <p className="text-xs text-muted-foreground">Queued</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Eye className="h-3 w-3" />
                    </div>
                    <p className="text-lg font-semibold">
                      {website.totalViews}
                    </p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/dashboard/websites/${website.id}`}>
                    Open Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add New Website Card */}
          <Card className="border-dashed flex flex-col items-center justify-center min-h-[280px] hover:shadow-md transition-shadow">
            <CardContent className="text-center py-8">
              <div className="rounded-full bg-muted p-3 mb-3 inline-block">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Add Website</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect another site
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/websites/new">Add Website</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
