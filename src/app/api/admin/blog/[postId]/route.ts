import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.systemRole !== "ADMIN") {
    return null;
  }
  return session.user;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return new NextResponse("Unauthorized", { status: 401 });

    const { postId } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[Admin Blog GET post]", error);
    return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return new NextResponse("Unauthorized", { status: 401 });

    const { postId } = await params;
    const body = await req.json();

    const existing = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const wasPublished = existing.status === "PUBLISHED";
    const isPublishing = body.status === "PUBLISHED" && !wasPublished;

    const wordCount = body.content
      ? body.content.split(/\s+/).filter(Boolean).length
      : existing.wordCount;

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
        ...(body.focusKeyword !== undefined && { focusKeyword: body.focusKeyword }),
        ...(body.secondaryKeywords !== undefined && { secondaryKeywords: body.secondaryKeywords }),
        ...(body.featuredImage !== undefined && { featuredImage: body.featuredImage }),
        ...(body.featuredImageAlt !== undefined && { featuredImageAlt: body.featuredImageAlt }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.socialCaptions !== undefined && { socialCaptions: body.socialCaptions }),
        wordCount,
        readingTime: Math.ceil((wordCount || 0) / 200),
        ...(isPublishing ? { publishedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[Admin Blog PATCH]", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return new NextResponse("Unauthorized", { status: 401 });

    const { postId } = await params;
    await prisma.blogPost.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Blog DELETE]", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
