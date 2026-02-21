/**
 * POST /api/websites/[websiteId]/posts/[postId]/regenerate-image
 * Generates a new featured image for the post via Imagen + uploads to B2
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

    // Allow optional custom prompt override from body
    const body = await req.json().catch(() => ({})) as { prompt?: string };

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

    // Build base prompt — Gemini inside generateBlogImage will enhance it creatively
    const basePrompt = body.prompt ||
      `Create an image that directly represents "${post.focusKeyword || post.title}" for a ${website?.niche || "business"} brand. Related to: "${post.title}". No text, words, or watermarks.`;

    // Generate the image — Gemini crafts a creative prompt, then Imagen renders it
    const imageUrl = await generateBlogImage(
      basePrompt,
      post.slug,
      websiteId,
      undefined,
      post.focusKeyword || post.title,
      website?.niche || "business",
    );

    // Persist the new URL
    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: { featuredImage: imageUrl },
      select: { featuredImage: true },
    });

    return NextResponse.json({
      success: true,
      imageUrl: updated.featuredImage,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[regenerate-image]", msg);

    // Return a helpful error if B2 / Imagen isn't configured yet
    if (msg.includes("B2") || msg.includes("Backblaze")) {
      return NextResponse.json(
        { error: "Image storage not configured. Add B2_ACCOUNT_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, and B2_ENDPOINT to your environment variables." },
        { status: 503 }
      );
    }
    if (msg.includes("GOOGLE_AI_API_KEY") || msg.includes("Imagen")) {
      return NextResponse.json(
        { error: "Image generation not configured. Add GOOGLE_AI_API_KEY to your environment variables." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
