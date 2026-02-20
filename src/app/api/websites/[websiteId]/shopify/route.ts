/**
 * GET  /api/websites/[websiteId]/shopify  — get Shopify connection status
 * POST /api/websites/[websiteId]/shopify  — test or save credentials
 * DELETE /api/websites/[websiteId]/shopify — disconnect
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { testShopifyConnection, listShopifyBlogs } from "@/lib/cms/shopify";

type Params = { params: Promise<{ websiteId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { websiteId } = await params;
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { shopifyConfig: true },
    });

    if (!website?.shopifyConfig) return NextResponse.json({ connected: false });

    const config = JSON.parse(website.shopifyConfig) as {
      storeUrl: string;
      blogId?: string;
      blogTitle?: string;
    };

    return NextResponse.json({
      connected: true,
      storeUrl: config.storeUrl,
      blogId: config.blogId || null,
      blogTitle: config.blogTitle || null,
    });
  } catch (error) {
    console.error("[Shopify GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { websiteId } = await params;
    const body = await req.json() as {
      action?: string;
      storeUrl?: string;
      accessToken?: string;
      blogId?: string;
      blogTitle?: string;
    };
    const { action, storeUrl, accessToken, blogId, blogTitle } = body;

    if (!storeUrl || !accessToken) {
      return NextResponse.json({ error: "storeUrl and accessToken are required" }, { status: 400 });
    }

    // ── Test connection ───────────────────────────────────────────────
    if (action === "test") {
      const result = await testShopifyConnection({ storeUrl, accessToken });
      return NextResponse.json(result);
    }

    // ── Fetch available blogs ─────────────────────────────────────────
    if (action === "list-blogs") {
      const blogs = await listShopifyBlogs({ storeUrl, accessToken });
      return NextResponse.json({ blogs });
    }

    // ── Save credentials ──────────────────────────────────────────────
    const config = {
      storeUrl: storeUrl.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
      accessToken,
      blogId: blogId || null,
      blogTitle: blogTitle || null,
    };

    await prisma.website.update({
      where: { id: websiteId },
      data: { shopifyConfig: JSON.stringify(config) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Shopify POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { websiteId } = await params;
    await prisma.website.update({
      where: { id: websiteId },
      data: { shopifyConfig: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Shopify DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
