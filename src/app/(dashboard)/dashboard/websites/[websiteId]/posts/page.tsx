import { getWebsite } from "@/lib/get-session";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Send,
  Archive,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  REVIEW: "outline",
  SCHEDULED: "outline",
  ARCHIVED: "secondary",
};

export default async function PostsPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;
  const { website } = await getWebsite(websiteId);

  const posts = await prisma.blogPost.findMany({
    where: { websiteId },
    orderBy: { createdAt: "desc" },
    include: {
      keyword: true,
    },
  });

  const statusCounts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    draft: posts.filter((p) => p.status === "DRAFT").length,
    review: posts.filter((p) => p.status === "REVIEW").length,
    scheduled: posts.filter((p) => p.status === "SCHEDULED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <p className="text-muted-foreground">
            Manage blog content for {website.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/websites/${websiteId}/generator`}>
              AI Generate
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/websites/${websiteId}/posts/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Filter Badges */}
      <div className="flex items-center gap-2">
        <Badge variant="default">All ({statusCounts.all})</Badge>
        <Badge variant="outline">Published ({statusCounts.published})</Badge>
        <Badge variant="outline">Drafts ({statusCounts.draft})</Badge>
        <Badge variant="outline">Review ({statusCounts.review})</Badge>
        <Badge variant="outline">Scheduled ({statusCounts.scheduled})</Badge>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Generate your first blog post using AI or create one manually.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href={`/dashboard/websites/${websiteId}/generator`}>
                  Generate with AI
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/websites/${websiteId}/posts/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Manually
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-[300px]">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          /{post.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[post.status] || "secondary"}>
                        {post.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {post.focusKeyword || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-1 text-sm">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {post.contentScore ? (
                        <Badge
                          variant={
                            post.contentScore >= 80
                              ? "default"
                              : post.contentScore >= 60
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {post.contentScore}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/websites/${websiteId}/posts/${post.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Live
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
