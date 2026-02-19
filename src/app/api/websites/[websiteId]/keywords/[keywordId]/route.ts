import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ websiteId: string; keywordId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId, keywordId } = await params;

    // Verify access
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { organization: { include: { websites: true } } },
    });

    const website = membership?.organization.websites.find(
      (w) => w.id === websiteId
    );
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    await prisma.blogKeyword.delete({
      where: { id: keywordId, websiteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const body = await req.json();

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { organization: { include: { websites: true } } },
    });

    const website = membership?.organization.websites.find(
      (w) => w.id === websiteId
    );
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const updated = await prisma.blogKeyword.update({
      where: { id: keywordId, websiteId },
      data: {
        priority: body.priority,
        notes: body.notes,
        status: body.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating keyword:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
