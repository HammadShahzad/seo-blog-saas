import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

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
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

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
