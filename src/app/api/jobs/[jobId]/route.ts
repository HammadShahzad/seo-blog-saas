/**
 * GET /api/jobs/[jobId]
 * Poll generation job status and progress
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getJobStatus } from "@/lib/job-queue";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = await getJobStatus(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get blog post details if completed
    let blogPost = null;
    if (job.status === "COMPLETED" && job.blogPostId) {
      blogPost = await prisma.blogPost.findUnique({
        where: { id: job.blogPostId },
        select: { id: true, title: true, slug: true, status: true, websiteId: true },
      });
    }

    return NextResponse.json({
      ...job,
      blogPost,
    });
  } catch (error) {
    console.error("Job status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
