import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string; keywordId: string }> }
) {
  try {
    const { websiteId, keywordId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    await prisma.blogKeyword.delete({
      where: { id: keywordId, websiteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return NextResponse.json({ error: "Failed to delete keyword" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ websiteId: string; keywordId: string }> }
) {
  try {
    const { websiteId, keywordId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.priority !== undefined) data.priority = Number(body.priority);
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.status !== undefined) data.status = body.status;

    const updated = await prisma.blogKeyword.update({
      where: { id: keywordId, websiteId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating keyword:", error);
    return NextResponse.json({ error: "Failed to update keyword" }, { status: 500 });
  }
}
