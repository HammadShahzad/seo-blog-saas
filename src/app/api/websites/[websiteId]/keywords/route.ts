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

    const keywords = await prisma.blogKeyword.findMany({
      where: { websiteId },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Error fetching keywords:", error);
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

    const { keyword, notes, priority } = await req.json();

    if (!keyword?.trim()) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }
    if (typeof keyword !== "string" || keyword.trim().length > 300) {
      return NextResponse.json({ error: "Keyword too long (max 300 characters)" }, { status: 400 });
    }

    // Check for duplicate
    const existing = await prisma.blogKeyword.findFirst({
      where: { websiteId, keyword: keyword.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This keyword already exists" },
        { status: 409 }
      );
    }

    const newKeyword = await prisma.blogKeyword.create({
      data: {
        keyword: keyword.trim(),
        notes: notes || null,
        priority: priority || 0,
        websiteId,
      },
    });

    return NextResponse.json(newKeyword, { status: 201 });
  } catch (error) {
    console.error("Error creating keyword:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
