import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";
import { runPublishHook } from "@/lib/on-publish";
import { calculateContentScore } from "@/lib/seo-scorer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ websiteId: string; postId: string }> }
) {
  try {
    const { websiteId, postId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const post = await prisma.blogPost.findFirst({ where: { id: postId, websiteId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ websiteId: string; postId: string }> }
) {
  try {
    const { websiteId, postId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;
    const { session } = access;

    const body = await req.json();
    const allowedFields = [
      "title", "content", "excerpt", "metaTitle", "metaDescription",
      "focusKeyword", "secondaryKeywords", "featuredImage", "featuredImageAlt",
      "tags", "category", "status", "scheduledAt",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field];
    }

    // Snapshot current post state as a version before applying edits
    if (body.title || body.content || body.metaTitle || body.metaDescription) {
      const currentPost = await prisma.blogPost.findUnique({
        where: { id: postId },
        select: { title: true, content: true, metaTitle: true, metaDescription: true },
      });
      if (currentPost) {
        const lastVersion = await prisma.postVersion.findFirst({
          where: { blogPostId: postId },
          orderBy: { version: "desc" },
          select: { version: true },
        });
        await prisma.postVersion.create({
          data: {
            blogPostId: postId,
            version: (lastVersion?.version ?? 0) + 1,
            title: currentPost.title,
            content: currentPost.content,
            metaTitle: currentPost.metaTitle,
            metaDescription: currentPost.metaDescription,
            editedBy: session.user.id,
          },
        });
      }
    }

    // Auto-set publishedAt when publishing
    if (body.status === "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    // Recalculate word count if content changed
    if (body.content) {
      const wc = body.content.split(/\s+/).filter(Boolean).length;
      updateData.wordCount = wc;
      updateData.readingTime = Math.ceil(wc / 200);
    }

    // Recalculate SEO content score when relevant fields change
    if (body.content || body.title || body.metaTitle || body.metaDescription || body.focusKeyword || body.featuredImage) {
      const current = await prisma.blogPost.findUnique({
        where: { id: postId },
        select: { title: true, content: true, metaTitle: true, metaDescription: true, focusKeyword: true, featuredImage: true, featuredImageAlt: true },
      });
      if (current) {
        const { score } = calculateContentScore({
          content: (body.content as string) || current.content,
          title: (body.title as string) || current.title,
          metaTitle: (body.metaTitle as string) ?? current.metaTitle,
          metaDescription: (body.metaDescription as string) ?? current.metaDescription,
          focusKeyword: (body.focusKeyword as string) ?? current.focusKeyword,
          featuredImage: (body.featuredImage as string) ?? current.featuredImage,
          featuredImageAlt: (body.featuredImageAlt as string) ?? current.featuredImageAlt,
        });
        updateData.contentScore = score;
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: postId, websiteId },
      data: updateData,
    });

    // Fire publish hook whenever status is explicitly set to PUBLISHED
    // (handles both first publish and re-saves that should sync to CMS)
    if (body.status === "PUBLISHED") {
      runPublishHook({ postId, websiteId, triggeredBy: "manual" }).catch(console.error);
    }

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ websiteId: string; postId: string }> }
) {
  try {
    const { websiteId, postId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    // Unlink keyword first (non-blocking on failure)
    await prisma.blogKeyword.updateMany({
      where: { blogPostId: postId },
      data: { blogPostId: null },
    }).catch(() => {});

    // Delete all child records before the post
    await Promise.all([
      prisma.blogAnalytics.deleteMany({ where: { blogPostId: postId } }).catch(() => {}),
      prisma.generationJob.deleteMany({ where: { blogPostId: postId } }).catch(() => {}),
      prisma.postVersion.deleteMany({ where: { blogPostId: postId } }).catch(() => {}),
    ]);

    await prisma.blogPost.delete({ where: { id: postId, websiteId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[delete-post]", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
