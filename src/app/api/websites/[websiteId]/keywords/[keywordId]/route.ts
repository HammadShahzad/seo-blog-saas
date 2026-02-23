import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function verifyWebsiteAccess(websiteId: string, userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true },
  });
  const orgIds = memberships.map((m) => m.organizationId);
  return prisma.website.findFirst({
    where: { id: websiteId, organizationId: { in: orgIds } },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string; keywordId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId, keywordId } = await params;
    const website = await verifyWebsiteAccess(websiteId, session.user.id);
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId, keywordId } = await params;
    const website = await verifyWebsiteAccess(websiteId, session.user.id);
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

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
