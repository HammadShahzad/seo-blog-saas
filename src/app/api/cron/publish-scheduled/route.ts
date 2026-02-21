/**
 * POST /api/cron/publish-scheduled
 * Runs every minute (or every 5 minutes) via Vercel Cron.
 * Finds all posts with status=SCHEDULED and scheduledAt <= now, publishes them.
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runPublishHook } from "@/lib/on-publish";
import { requireCronAuth } from "@/lib/api-helpers";

export const maxDuration = 60;

export async function POST(req: Request) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const now = new Date();

  // Find all posts that are scheduled and due to publish
  const duePosts = await prisma.blogPost.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    include: {
      website: {
        include: { blogSettings: true },
      },
    },
    take: 50, // process up to 50 at a time
  });

  if (duePosts.length === 0) {
    return NextResponse.json({ published: 0, message: "No scheduled posts due" });
  }

  const results: { id: string; title: string; success: boolean; error?: string }[] = [];

  for (const post of duePosts) {
    try {
      // Mark as published
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          status: "PUBLISHED",
          publishedAt: now,
        },
      });

      // Run publish hooks (IndexNow, social media, webhooks, internal linking)
      try {
        await runPublishHook({ postId: post.id, websiteId: post.websiteId, triggeredBy: "scheduled" });
      } catch (hookErr) {
        console.error(`[publish-scheduled] Hook error for post ${post.id}:`, hookErr);
        // Non-fatal — post is already published
      }

      results.push({ id: post.id, title: post.title, success: true });
      console.log(`[publish-scheduled] Published: "${post.title}" (${post.id})`);
    } catch (err) {
      console.error(`[publish-scheduled] Failed to publish post ${post.id}:`, err);
      results.push({ id: post.id, title: post.title, success: false, error: String(err) });
    }
  }

  return NextResponse.json({
    published: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  });
}

// Also support GET for manual trigger / health check
export async function GET(req: Request) {
  return POST(req);
}
