/**
 * POST /api/cron/generate
 * Cron job that auto-generates blog posts for all active websites
 * Protected with CRON_SECRET env var (required)
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enqueueGenerationJob, checkGenerationLimit, recoverStuckJobs, triggerWorker } from "@/lib/job-queue";
import { runPublishHook } from "@/lib/on-publish";
import { requireCronAuth } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const results: { websiteId: string; name: string; action: string; jobId?: string }[] = [];
  const scheduledResults: { postId: string; title: string }[] = [];

  try {
    const recovered = await recoverStuckJobs();

    const dueScheduledPosts = await prisma.blogPost.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: new Date() },
      },
      select: { id: true, title: true, websiteId: true },
    });

    for (const post of dueScheduledPosts) {
      try {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { status: "PUBLISHED", publishedAt: new Date() },
        });
        runPublishHook({ postId: post.id, websiteId: post.websiteId, triggeredBy: "scheduled" })
          .catch(e => console.error(`[Cron] Publish hook failed for post ${post.id}:`, e));
        scheduledResults.push({ postId: post.id, title: post.title });
      } catch (e) {
        console.error(`[Cron] Failed to publish scheduled post ${post.id}:`, e);
      }
    }

    const websites = await prisma.website.findMany({
      where: {
        status: "ACTIVE",
        blogSettings: { autoPublish: true },
      },
      include: {
        blogSettings: true,
        organization: { include: { subscription: true } },
      },
    });

    for (const website of websites) {
      try {
        const activeJob = await prisma.generationJob.findFirst({
          where: { websiteId: website.id, status: { in: ["QUEUED", "PROCESSING"] } },
        });

        if (activeJob) {
          results.push({ websiteId: website.id, name: website.name, action: "skipped_active_job" });
          continue;
        }

        const limit = await checkGenerationLimit(website.id);
        if (!limit.allowed) {
          results.push({ websiteId: website.id, name: website.name, action: "limit_reached" });
          continue;
        }

        const keyword = await prisma.blogKeyword.findFirst({
          where: { websiteId: website.id, status: "PENDING" },
          orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        });

        if (!keyword) {
          results.push({ websiteId: website.id, name: website.name, action: "no_keywords" });
          continue;
        }

        const jobId = await enqueueGenerationJob({
          keywordId: keyword.id,
          keyword: keyword.keyword,
          websiteId: website.id,
          contentLength: website.blogSettings?.contentLength || "MEDIUM",
          includeImages: website.blogSettings?.includeImages ?? true,
          includeFAQ: website.blogSettings?.includeFAQ ?? true,
          autoPublish: website.blogSettings?.autoPublish ?? false,
        });

        triggerWorker(jobId);
        results.push({ websiteId: website.id, name: website.name, action: "queued", jobId });
      } catch (e) {
        console.error(`[Cron] Error processing website ${website.id}:`, e);
        results.push({ websiteId: website.id, name: website.name, action: "error" });
      }
    }

    return NextResponse.json({
      recoveredJobs: recovered,
      scheduledPublished: scheduledResults.length,
      generated: results.filter((r) => r.action === "queued").length,
      results,
      scheduledResults,
    });
  } catch (error) {
    console.error("[Cron] Fatal error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
