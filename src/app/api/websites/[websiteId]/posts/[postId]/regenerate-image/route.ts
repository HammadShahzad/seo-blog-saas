/**
 * POST /api/websites/[websiteId]/posts/[postId]/regenerate-image
 * Generates a new featured OR inline image for the post via Imagen + uploads to B2.
 *
 * Body:
 *   prompt?        — custom prompt override
 *   type?          — "featured" (default) | "inline"
 *   inlineIndex?   — 0-based index of the inline image to replace (required when type=inline)
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBlogImage } from "@/lib/storage/image-generator";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export const maxDuration = 60;

type Params = { params: Promise<{ websiteId: string; postId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { websiteId, postId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const body = await req.json().catch(() => ({})) as {
      prompt?: string;
      type?: "featured" | "inline";
      inlineIndex?: number;
    };

    const imageType = body.type || "featured";

    const [post, website] = await Promise.all([
      prisma.blogPost.findFirst({
        where: { id: postId, websiteId },
        select: {
          id: true,
          title: true,
          slug: true,
          focusKeyword: true,
          content: true,
        },
      }),
      prisma.website.findUnique({
        where: { id: websiteId },
        select: { niche: true, brandName: true },
      }),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const basePrompt = body.prompt ||
      `Create an image that directly represents "${post.focusKeyword || post.title}" for a ${website?.niche || "business"} brand. Related to: "${post.title}". No text, words, or watermarks.`;

    const imageUrl = await generateBlogImage(
      basePrompt,
      `${post.slug}-${imageType === "inline" ? `inline-${body.inlineIndex ?? 0}` : "featured"}`,
      websiteId,
      undefined,
      post.focusKeyword || post.title,
      website?.niche || "business",
      "high",
    );

    if (imageType === "inline" && typeof body.inlineIndex === "number") {
      const inlineRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let matchIndex = 0;
      const updatedContent = (post.content || "").replace(inlineRegex, (full, alt, url) => {
        if (matchIndex++ === body.inlineIndex) {
          return `![${alt}](${imageUrl})`;
        }
        return full;
      });

      const updated = await prisma.blogPost.update({
        where: { id: postId },
        data: { content: updatedContent },
        select: { content: true },
      });

      return NextResponse.json({ success: true, imageUrl, content: updated.content });
    }

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: { featuredImage: imageUrl },
      select: { featuredImage: true },
    });

    return NextResponse.json({ success: true, imageUrl: updated.featuredImage });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[regenerate-image]", msg);

    if (msg.includes("B2") || msg.includes("Backblaze")) {
      return NextResponse.json(
        { error: "Image storage not configured. Add B2_ACCOUNT_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, and B2_ENDPOINT to your environment variables." },
        { status: 503 },
      );
    }
    if (msg.includes("GOOGLE_AI_API_KEY") || msg.includes("Imagen")) {
      return NextResponse.json(
        { error: "Image generation not configured. Add GOOGLE_AI_API_KEY to your environment variables." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
