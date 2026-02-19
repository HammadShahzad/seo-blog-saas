import { getWebsite } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Eye,
  FileText,
  TrendingUp,
  Clock,
  KeyRound,
  Bot,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;
  const { website } = await getWebsite(websiteId);

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    topPosts,
    recentPosts,
    totalKeywords,
    completedKeywords,
  ] = await Promise.all([
    prisma.blogPost.count({ where: { websiteId } }),
    prisma.blogPost.count({ where: { websiteId, status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { websiteId, status: "DRAFT" } }),
    prisma.blogPost.aggregate({
      where: { websiteId },
      _sum: { views: true },
    }),
    prisma.blogPost.findMany({
      where: { websiteId, status: "PUBLISHED" },
      orderBy: { views: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
        focusKeyword: true,
        wordCount: true,
      },
    }),
    prisma.blogPost.findMany({
      where: { websiteId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        generatedBy: true,
        wordCount: true,
      },
    }),
    prisma.blogKeyword.count({ where: { websiteId } }),
    prisma.blogKeyword.count({ where: { websiteId, status: "COMPLETED" } }),
  ]);

  const avgWordCount =
    totalPosts > 0
      ? await prisma.blogPost
          .aggregate({
            where: { websiteId },
            _avg: { wordCount: true },
          })
          .then((r) => Math.round(r._avg.wordCount || 0))
      : 0;

  const aiPosts = await prisma.blogPost.count({
    where: { websiteId, generatedBy: "ai" },
  });

  const stats = [
    {
      title: "Total Views",
      value: (totalViews._sum.views || 0).toLocaleString(),
      icon: Eye,
      description: "All-time page views",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Published Posts",
      value: publishedPosts,
      icon: FileText,
      description: `${draftPosts} drafts`,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Avg. Word Count",
      value: avgWordCount.toLocaleString(),
      icon: Clock,
      description: "words per post",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Keywords Used",
      value: `${completedKeywords}/${totalKeywords}`,
      icon: KeyRound,
      description: "completed",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analytics
        </h2>
        <p className="text-muted-foreground mt-1">
          Content performance overview for {website.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium mt-0.5">{stat.title}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Top Posts by Views
            </CardTitle>
            <CardDescription>Best performing published content</CardDescription>
          </CardHeader>
          <CardContent>
            {topPosts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Eye className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No published posts yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topPosts.map((post, i) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg font-bold text-muted-foreground/40 w-5 shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/websites/${websiteId}/posts/${post.id}`}
                          className="text-sm font-medium hover:text-primary truncate block"
                        >
                          {post.title}
                        </Link>
                        {post.focusKeyword && (
                          <p className="text-xs text-muted-foreground truncate">
                            {post.focusKeyword}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground shrink-0 ml-2">
                      <Eye className="h-3 w-3" />
                      {(post.views || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest posts created or generated</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`p-1.5 rounded-md shrink-0 ${
                          post.generatedBy === "ai"
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        {post.generatedBy === "ai" ? (
                          <Bot className="h-3 w-3 text-primary" />
                        ) : (
                          <FileText className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/websites/${websiteId}/posts/${post.id}`}
                          className="text-sm font-medium hover:text-primary truncate block"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()} ·{" "}
                          {post.wordCount
                            ? `${post.wordCount.toLocaleString()} words`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        post.status === "PUBLISHED" ? "default" : "secondary"
                      }
                      className="text-xs shrink-0 ml-2"
                    >
                      {post.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Content Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Bot className="h-3.5 w-3.5" />
                  AI Generated
                </span>
                <span className="font-medium">{aiPosts}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width:
                      totalPosts > 0
                        ? `${(aiPosts / totalPosts) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  Published
                </span>
                <span className="font-medium">{publishedPosts}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width:
                      totalPosts > 0
                        ? `${(publishedPosts / totalPosts) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Drafts
                </span>
                <span className="font-medium">{draftPosts}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{
                    width:
                      totalPosts > 0
                        ? `${(draftPosts / totalPosts) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GA notice */}
      {!website.googleAnalyticsId && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Connect Google Analytics for deeper insights
                </p>
                <p className="text-xs text-muted-foreground">
                  Track real traffic, rankings, and conversions
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/websites/${websiteId}/settings`}
              className="text-sm text-primary hover:underline"
            >
              Add GA4 ID →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
