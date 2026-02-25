import { NextResponse } from "next/server";
import { verifyWebsiteAccess } from "@/lib/api-helpers";
import { enqueueKeywordSuggestJob, triggerWorker } from "@/lib/job-queue";

export const maxDuration = 10;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    let seedKeyword = "";
    try {
      const body = await req.json();
      seedKeyword = body.seedKeyword?.trim() || "";
    } catch {
      // No body — proceed without seed keyword
    }

    // Create a queued job — processed by the Droplet worker (no Vercel timeout)
    const jobId = await enqueueKeywordSuggestJob({ websiteId, seedKeyword: seedKeyword || undefined });
    triggerWorker(jobId);

    return NextResponse.json({ jobId, queued: true });
  } catch (error) {
    console.error("Keyword suggest enqueue error:", error);
    return NextResponse.json({ error: "Failed to queue suggestion job" }, { status: 500 });
  }
}
