/**
 * POST /api/websites/[websiteId]/wordpress/push
 * Push a specific blog post to the connected WordPress site
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pushToWordPress } from "@/lib/cms/wordpress";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;
    const { postId, status = "draft" } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    // Load website WP config
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { cmsType: true, cmsApiUrl: true, cmsApiKey: true },
    });

    if (!website?.cmsApiUrl || !website?.cmsApiKey) {
      return NextResponse.json(
        { error: "WordPress not connected. Configure it in Website Settings → WordPress." },
        { status: 400 }
      );
    }

    // Decode stored credentials
    const decoded = Buffer.from(website.cmsApiKey, "base64").toString("utf-8");
    const [username, appPassword] = decoded.split(":::");

    if (!username || !appPassword) {
      return NextResponse.json(
        { error: "Invalid WordPress credentials stored. Please reconnect." },
        { status: 400 }
      );
    }

    // Load the post
    const post = await prisma.blogPost.findFirst({
      where: { id: postId, websiteId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Push to WordPress
    const result = await pushToWordPress(
      {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || undefined,
        slug: post.slug,
        status: status as "draft" | "publish",
        featuredImageUrl: post.featuredImage || undefined,
        metaTitle: post.metaTitle || undefined,
        metaDescription: post.metaDescription || undefined,
        focusKeyword: post.focusKeyword || undefined,
        tags: post.tags || [],
        category: post.category || undefined,
      },
      {
        siteUrl: website.cmsApiUrl,
        username,
        appPassword,
        defaultStatus: status as "draft" | "publish",
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      wpPostId: result.wpPostId,
      wpPostUrl: result.wpPostUrl,
      wpEditUrl: result.wpEditUrl,
    });
  } catch (error) {
    console.error("WordPress push error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
