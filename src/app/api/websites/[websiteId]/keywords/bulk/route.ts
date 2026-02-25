import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Provide an array of keyword ids" }, { status: 400 });
    }

    const result = await prisma.blogKeyword.deleteMany({
      where: { id: { in: ids }, websiteId },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("Error bulk deleting keywords:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
      return NextResponse.json(
        { error: "Provide an array of keywords" },
        { status: 400 }
      );
    }

    // Get existing keywords to avoid duplicates
    const existing = await prisma.blogKeyword.findMany({
      where: { websiteId },
      select: { keyword: true },
    });
    const existingSet = new Set(existing.map((k) => k.keyword.toLowerCase()));

    const newKeywords = keywords
      .map((k: string) => k.trim())
      .filter((k: string) => k && !existingSet.has(k.toLowerCase()));

    if (newKeywords.length === 0) {
      return NextResponse.json(
        { error: "All keywords already exist", added: 0 },
        { status: 200 }
      );
    }

    const created = await prisma.blogKeyword.createMany({
      data: newKeywords.map((keyword: string, index: number) => ({
        keyword,
        websiteId,
        priority: newKeywords.length - index, // Higher priority for first items
      })),
    });

    return NextResponse.json({ added: created.count }, { status: 201 });
  } catch (error) {
    console.error("Error bulk creating keywords:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
