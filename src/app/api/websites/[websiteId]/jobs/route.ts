import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const jobs = await prisma.generationJob.findMany({
      where: {
        websiteId,
        OR: [
          { status: { in: ["QUEUED", "PROCESSING"] } },
          { status: "FAILED", completedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        currentStep: true,
        progress: true,
        error: true,
        keywordId: true,
        startedAt: true,
        createdAt: true,
        blogPostId: true,
        input: true,
      },
    });

    for (const job of jobs) {
      if (job.status === "PROCESSING" && job.startedAt && new Date(job.startedAt) < tenMinutesAgo) {
        await prisma.generationJob.update({
          where: { id: job.id },
          data: { status: "FAILED", error: "Job timed out. Click Retry to try again.", completedAt: new Date() },
        });
        if (job.keywordId) {
          await prisma.blogKeyword.update({
            where: { id: job.keywordId },
            data: { status: "FAILED", errorMessage: "Generation timed out" },
          }).catch(() => {});
        }
        job.status = "FAILED";
        job.error = "Job timed out. Click Retry to try again.";
      }
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
