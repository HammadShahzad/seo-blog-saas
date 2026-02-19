/**
 * POST /api/cron/generate
 * Cron job that auto-generates blog posts for all active websites
 * Call this endpoint every hour (or daily) via Vercel Cron / external scheduler
 *
 * Protected with CRON_SECRET env var
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enqueueGenerationJob, processJob, checkGenerationLimit } from "@/lib/job-queue";

export async function POST(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { websiteId: string; name: string; action: string; jobId?: string }[] = [];

  try {
    // Find all active websites with autoPublish enabled and pending keywords
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
      // Skip if already has an active job
      const activeJob = await prisma.generationJob.findFirst({
        where: { websiteId: website.id, status: { in: ["QUEUED", "PROCESSING"] } },
      });

      if (activeJob) {
        results.push({ websiteId: website.id, name: website.name, action: "skipped_active_job" });
        continue;
      }

      // Check plan limits
      const limit = await checkGenerationLimit(website.id);
      if (!limit.allowed) {
        results.push({ websiteId: website.id, name: website.name, action: "limit_reached" });
        continue;
      }

      // Get next pending keyword
      const keyword = await prisma.blogKeyword.findFirst({
        where: { websiteId: website.id, status: "PENDING" },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      });

      if (!keyword) {
        results.push({ websiteId: website.id, name: website.name, action: "no_keywords" });
        continue;
      }

      // Enqueue and process
      const jobId = await enqueueGenerationJob({
        keywordId: keyword.id,
        keyword: keyword.keyword,
        websiteId: website.id,
        contentLength: website.blogSettings?.contentLength || "MEDIUM",
        includeImages: website.blogSettings?.includeImages ?? true,
        includeFAQ: website.blogSettings?.includeFAQ ?? true,
        autoPublish: website.blogSettings?.autoPublish ?? false,
      });

      // Process inline for cron (can be moved to queue worker)
      await processJob(jobId);
      results.push({ websiteId: website.id, name: website.name, action: "generated", jobId });
    }

    return NextResponse.json({
      processed: results.filter((r) => r.action === "generated").length,
      results,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed", details: String(error) }, { status: 500 });
  }
}
