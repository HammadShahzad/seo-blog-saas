/**
 * POST /api/websites/[websiteId]/posts/[postId]/regenerate-image
 * Generates a new featured image for the post via Imagen + uploads to B2
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateBlogImage } from "@/lib/storage/image-generator";

export const maxDuration = 60; // 60s max duration for image generation
import { generateText } from "@/lib/ai/gemini";

type Params = { params: Promise<{ websiteId: string; postId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId, postId } = await params;

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

    // Build or use provided image prompt
    let imagePrompt = body.prompt;
    if (!imagePrompt) {
      imagePrompt = await generateText(
        `Create a professional, eye-catching image prompt for a blog post titled: "${post.title}"
Topic: "${post.focusKeyword || post.title}" in the context of ${website?.niche || "business"}.
Brand: ${website?.brandName || ""}
Style: Clean, modern, professional. Suitable for a business blog. No text in the image.
Describe the scene in 2-3 sentences for an AI image generator.
Return only the image prompt, nothing else.`,
        "You are a creative director specializing in B2B content marketing visuals."
      );
    }

    // Generate the image and upload to B2
    const imageUrl = await generateBlogImage(imagePrompt, post.slug, websiteId);

    // Persist the new URL
    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: { featuredImage: imageUrl },
      select: { featuredImage: true },
    });

    return NextResponse.json({
      success: true,
      imageUrl: updated.featuredImage,
      prompt: imagePrompt,
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
