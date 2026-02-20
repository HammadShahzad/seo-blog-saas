/**
 * POST /api/worker/process
 * Worker endpoint that processes QUEUED generation jobs.
 * Protected by CRON_SECRET (required).
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processJob, recoverStuckJobs } from "@/lib/job-queue";
import { requireCronAuth } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  try {
    await recoverStuckJobs();

    const body = await req.json().catch(() => ({}));
    const { jobId } = body as { jobId?: string };

    let job;

    if (jobId && typeof jobId === "string") {
      job = await prisma.generationJob.findFirst({
        where: { id: jobId, status: "QUEUED" },
      });
    }

    if (!job) {
      job = await prisma.generationJob.findFirst({
        where: { status: "QUEUED" },
        orderBy: { createdAt: "asc" },
      });
    }

    if (!job) {
      return NextResponse.json({ processed: false, reason: "no_queued_jobs" });
    }

    await processJob(job.id);

    return NextResponse.json({ processed: true, jobId: job.id });
  } catch (error) {
    console.error("[WORKER] Error:", error);
    return NextResponse.json(
      { error: "Worker processing failed" },
      { status: 500 }
    );
  }
}
