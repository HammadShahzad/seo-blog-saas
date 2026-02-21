import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function verifyAccess(websiteId: string, userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: { include: { websites: true } } },
  });
  return membership?.organization.websites.find((w) => w.id === websiteId) || null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { websiteId } = await params;
    if (!await verifyAccess(websiteId, session.user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const settings = await prisma.blogSettings.findUnique({ where: { websiteId } });
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error("Error fetching blog settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { websiteId } = await params;
    if (!await verifyAccess(websiteId, session.user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    const allowedFields = [
      "ctaText", "ctaUrl", "avoidTopics", "requiredSections",
      "writingStyle", "contentLength", "includeImages",
      "includeFAQ", "includeTableOfContents", "preferredModel",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) data[field] = body[field];
    }

    const settings = await prisma.blogSettings.upsert({
      where: { websiteId },
      update: data,
      create: { websiteId, ...data },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating blog settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
