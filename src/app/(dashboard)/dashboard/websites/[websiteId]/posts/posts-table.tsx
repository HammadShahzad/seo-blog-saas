"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Eye,
  Edit,
  Trash2,
  Send,
  Archive,
  MoreVertical,
  Loader2,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  focusKeyword: string | null;
  views: number;
  contentScore: number | null;
  createdAt: Date;
}

interface Props {
  posts: Post[];
  websiteId: string;
}

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  REVIEW: "outline",
  SCHEDULED: "outline",
  ARCHIVED: "secondary",
};

export function PostsTable({ posts: initialPosts, websiteId }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const patchPost = async (postId: string, data: Record<string, unknown>, optimistic: Partial<Post>) => {
    setLoadingId(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...optimistic } : p));
    try {
      const res = await fetch(`/api/websites/${websiteId}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Action failed");
        // Revert optimistic update on error
      setPosts(initialPosts);
      } else {
        const updated = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: updated.status } : p));
        router.refresh();
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (postId: string, title: string) => {
    setLoadingId(postId);
    try {
      const res = await fetch(`/api/websites/${websiteId}/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success(`"${title}" deleted`);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto w-full">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%] min-w-[180px]">Title</TableHead>
          <TableHead className="min-w-[110px]">Status</TableHead>
          <TableHead className="min-w-[120px]">Keyword</TableHead>
          <TableHead className="text-right min-w-[70px]">Views</TableHead>
          <TableHead className="text-right min-w-[60px]">Score</TableHead>
          <TableHead className="min-w-[100px]">Created</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell>
              <div>
                <p className="font-medium truncate max-w-[300px]">{post.title}</p>
                <p className="text-xs text-muted-foreground">/{post.slug}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <Badge
                  variant={STATUS_BADGE_VARIANT[post.status] || "secondary"}
                  className={post.status === "SCHEDULED" ? "border-blue-400 text-blue-700 bg-blue-50" : ""}
                >
                  {post.status === "SCHEDULED" ? (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      scheduled
                    </span>
                  ) : (
                    post.status.toLowerCase()
                  )}
                </Badge>
                {post.status === "SCHEDULED" && post.scheduledAt && (
                  <p className="text-xs text-blue-600 font-medium whitespace-nowrap">
                    {new Date(post.scheduledAt).toLocaleString(undefined, {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                )}
                {post.status === "PUBLISHED" && post.publishedAt && (
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">{post.focusKeyword || "-"}</span>
            </TableCell>
            <TableCell className="text-right">
              <span className="flex items-center justify-end gap-1 text-sm">
                <Eye className="h-3 w-3" />
                {post.views}
              </span>
            </TableCell>
            <TableCell className="text-right">
              {post.contentScore ? (
                <Badge variant={post.contentScore >= 80 ? "default" : post.contentScore >= 60 ? "outline" : "secondary"}>
                  {post.contentScore}
                </Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </TableCell>
            <TableCell>
              {loadingId === post.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />
              ) : (
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
                    {post.status === "SCHEDULED" && (
                      <DropdownMenuItem
                        onClick={() => patchPost(post.id, { status: "DRAFT", scheduledAt: null }, { status: "DRAFT" })}
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Unschedule (→ Draft)
                      </DropdownMenuItem>
                    )}
                    {post.status !== "REVIEW" && post.status !== "PUBLISHED" && post.status !== "SCHEDULED" && (
                      <DropdownMenuItem
                        onClick={() => patchPost(post.id, { status: "REVIEW" }, { status: "REVIEW" })}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Mark Ready
                      </DropdownMenuItem>
                    )}
                    {post.status !== "ARCHIVED" && (
                      <DropdownMenuItem
                        onClick={() => patchPost(post.id, { status: "ARCHIVED" }, { status: "ARCHIVED" })}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        toast(`Delete "${post.title.slice(0, 40)}..."?`, {
                          action: {
                            label: "Delete",
                            onClick: () => handleDelete(post.id, post.title),
                          },
                          cancel: { label: "Cancel", onClick: () => {} },
                          duration: 8000,
                        });
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
