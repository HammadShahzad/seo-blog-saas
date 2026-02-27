/**
 * POST /api/websites/[websiteId]/generate
 * Enqueue a blog generation job for the next pending keyword (or a specific one).
 * The job is picked up and processed by the Droplet worker — NOT by Vercel.
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enqueueGenerationJob, checkGenerationLimit, triggerWorker } from "@/lib/job-queue";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;
    const { website } = access;

    const limitCheck = await checkGenerationLimit(websiteId);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.reason }, { status: 403 });
    }

    if (website.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Website is paused or deleted. Resume it from settings to generate content." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      keywordId,
      contentLength = "MEDIUM",
      includeImages = true,
      imageSource = "AI_GENERATED",
      includeFAQ = true,
      includeProTips = true,
      includeTableOfContents = true,
      autoPublish = false,
      customDirection,
    } = body;

    if (!["SHORT", "MEDIUM", "LONG", "PILLAR"].includes(contentLength)) {
      return NextResponse.json({ error: "Invalid contentLength" }, { status: 400 });
    }

    const validImageSources = ["AI_GENERATED", "WEB_IMAGES", "ILLUSTRATION"];
    const safeImageSource = validImageSources.includes(imageSource) ? imageSource : "AI_GENERATED";

    let keyword;
    if (keywordId) {
      keyword = await prisma.blogKeyword.findFirst({
        where: { id: keywordId, websiteId, status: "PENDING" },
      });
    } else {
      keyword = await prisma.blogKeyword.findFirst({
        where: { websiteId, status: "PENDING" },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      });
    }

    if (!keyword) {
      return NextResponse.json(
        { error: "No pending keywords in queue. Add keywords first." },
        { status: 400 }
      );
    }

    const activeJob = await prisma.generationJob.findFirst({
      where: {
        websiteId,
        type: "BLOG_GENERATION",
        status: { in: ["QUEUED", "PROCESSING"] },
      },
    });

    if (activeJob) {
      return NextResponse.json(
        { error: "A generation job is already running for this website.", jobId: activeJob.id },
        { status: 409 }
      );
    }

    const jobId = await enqueueGenerationJob({
      keywordId: keyword.id,
      keyword: keyword.keyword,
      websiteId,
      contentLength,
      includeImages,
      imageSource: safeImageSource,
      includeFAQ,
      includeProTips,
      includeTableOfContents,
      autoPublish,
      customDirection: typeof customDirection === "string" ? customDirection.trim() : undefined,
    });

    // Notify the Droplet worker to pick up the job (fire-and-forget).
    // Even if this fails, the worker polls every 5s and will find the QUEUED job.
    triggerWorker(jobId);

    return NextResponse.json({
      jobId,
      keyword: keyword.keyword,
      message: "Generation started. Poll /api/jobs/[jobId] for progress.",
      remaining: limitCheck.remaining,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
