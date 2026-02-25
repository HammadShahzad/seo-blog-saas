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
    // Recover any stuck jobs (auto-retries up to 2x, then marks FAILED)
    const recovered = await recoverStuckJobs();
    if (recovered > 0) {
      console.log(`[WORKER] Recovered ${recovered} stuck job(s)`);
    }

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

    const startTime = Date.now();
    console.log(`[WORKER] Processing job ${job.id} (type: ${job.type}, website: ${job.websiteId})`);

    await processJob(job.id);

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[WORKER] Job ${job.id} completed in ${durationSec}s`);

    return NextResponse.json({ processed: true, jobId: job.id, durationSec });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[WORKER] Processing error: ${msg}`);
    return NextResponse.json(
      { error: "Worker processing failed", detail: msg },
      { status: 500 }
    );
  }
}
