/**
 * GET /api/admin/health — Job queue health dashboard
 * Shows queued, processing, stuck, and recently failed jobs.
 * Admin-only.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { systemRole?: string }).systemRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [queued, processing, stuck, recentFailed, recentCompleted, totalToday] = await Promise.all([
    // Queued jobs waiting to be picked up
    prisma.generationJob.findMany({
      where: { status: "QUEUED" },
      select: { id: true, type: true, createdAt: true, websiteId: true, error: true },
      orderBy: { createdAt: "asc" },
    }),
    // Currently processing
    prisma.generationJob.findMany({
      where: { status: "PROCESSING" },
      select: { id: true, type: true, currentStep: true, progress: true, startedAt: true, websiteId: true },
      orderBy: { startedAt: "asc" },
    }),
    // Stuck (PROCESSING but started > 10 min ago)
    prisma.generationJob.count({
      where: { status: "PROCESSING", startedAt: { lt: tenMinutesAgo } },
    }),
    // Recent failures (last 24h)
    prisma.generationJob.findMany({
      where: { status: "FAILED", completedAt: { gte: oneDayAgo } },
      select: { id: true, type: true, error: true, completedAt: true, websiteId: true },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    // Recent completions (last 24h)
    prisma.generationJob.findMany({
      where: { status: "COMPLETED", completedAt: { gte: oneDayAgo } },
      select: { id: true, type: true, completedAt: true, startedAt: true, websiteId: true },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    // Total jobs today
    prisma.generationJob.count({
      where: { createdAt: { gte: oneDayAgo } },
    }),
  ]);

  // Calculate avg processing time from recent completions
  const durations = recentCompleted
    .filter((j) => j.startedAt && j.completedAt)
    .map((j) => new Date(j.completedAt!).getTime() - new Date(j.startedAt!).getTime());
  const avgDurationMs = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  // Detect if worker is alive: any job completed in last 30 min, or the worker endpoint responds
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const recentActivity = await prisma.generationJob.findFirst({
    where: { completedAt: { gte: thirtyMinAgo } },
    select: { id: true },
  });

  return NextResponse.json({
    timestamp: now.toISOString(),
    summary: {
      queued: queued.length,
      processing: processing.length,
      stuck,
      failedLast24h: recentFailed.length,
      completedLast24h: recentCompleted.length,
      totalJobsToday: totalToday,
      avgProcessingTimeSec: Math.round(avgDurationMs / 1000),
      workerActive: !!recentActivity || processing.length > 0,
    },
    queued,
    processing: processing.map((j) => ({
      ...j,
      runningSec: j.startedAt ? Math.round((now.getTime() - new Date(j.startedAt).getTime()) / 1000) : 0,
      isStuck: j.startedAt ? new Date(j.startedAt) < tenMinutesAgo : false,
    })),
    recentFailed,
    recentCompleted: recentCompleted.map((j) => ({
      ...j,
      durationSec: j.startedAt && j.completedAt
        ? Math.round((new Date(j.completedAt).getTime() - new Date(j.startedAt).getTime()) / 1000)
        : null,
    })),
  });
}
