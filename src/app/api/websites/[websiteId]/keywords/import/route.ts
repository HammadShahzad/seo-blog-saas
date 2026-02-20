import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;
    const { keywords } = await req.json();

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: "keywords array is required" }, { status: 400 });
    }

    // Get existing to avoid duplicates
    const existing = await prisma.blogKeyword.findMany({
      where: { websiteId },
      select: { keyword: true },
    });
    const existingSet = new Set(existing.map((k) => k.keyword.toLowerCase().trim()));

    const toCreate = keywords
      .map((k: string) => k.trim())
      .filter((k) => k.length > 0 && !existingSet.has(k.toLowerCase()))
      .slice(0, 500); // safety limit

    if (toCreate.length === 0) {
      return NextResponse.json({
        imported: 0,
        skipped: keywords.length,
        message: "All keywords already exist",
      });
    }

    await prisma.blogKeyword.createMany({
      data: toCreate.map((keyword, i) => ({
        keyword,
        websiteId,
        status: "PENDING",
        priority: i + 1,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      imported: toCreate.length,
      skipped: keywords.length - toCreate.length,
      message: `Imported ${toCreate.length} keywords`,
    });
  } catch (error) {
    console.error("Keyword import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
