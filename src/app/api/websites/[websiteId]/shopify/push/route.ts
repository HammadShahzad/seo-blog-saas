/**
 * POST /api/websites/[websiteId]/shopify/push
 * Push a specific blog post to the connected Shopify store
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pushToShopify, ShopifyConfig } from "@/lib/cms/shopify";
import { markdownToHtml } from "@/lib/cms/wordpress";

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
    const { postId, status = "draft" } = await req.json() as { postId: string; status?: string };

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { shopifyConfig: true },
    });

    if (!website?.shopifyConfig) {
      return NextResponse.json(
        { error: "Shopify not connected. Configure it in Website Settings → Shopify." },
        { status: 400 }
      );
    }

    const config = JSON.parse(website.shopifyConfig) as ShopifyConfig;

    const post = await prisma.blogPost.findFirst({ where: { id: postId, websiteId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const result = await pushToShopify(
      {
        title: post.title,
        contentHtml: markdownToHtml(post.content),
        excerpt: post.excerpt || undefined,
        slug: post.slug,
        tags: post.tags || [],
        featuredImageUrl: post.featuredImage || undefined,
        status: status === "published" ? "published" : "draft",
        metaTitle: post.metaTitle || undefined,
        metaDescription: post.metaDescription || undefined,
      },
      config
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      articleId: result.articleId,
      articleUrl: result.articleUrl,
      adminUrl: result.adminUrl,
    });
  } catch (error) {
    console.error("[Shopify push]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
