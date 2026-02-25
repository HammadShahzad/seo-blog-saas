import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string; postId: string }> }
) {
  try {
    const { websiteId, postId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const post = await prisma.blogPost.findFirst({
      where: { id: postId, websiteId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const versions = await prisma.postVersion.findMany({
      where: { blogPostId: postId },
      orderBy: { version: "desc" },
    });

    return NextResponse.json(versions);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
