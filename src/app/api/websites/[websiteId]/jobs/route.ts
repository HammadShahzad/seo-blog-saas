import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;

    const jobs = await prisma.generationJob.findMany({
      where: {
        websiteId,
        status: { in: ["QUEUED", "PROCESSING"] },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        currentStep: true,
        progress: true,
        error: true,
        keyword: true,
        createdAt: true,
        blogPostId: true,
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
