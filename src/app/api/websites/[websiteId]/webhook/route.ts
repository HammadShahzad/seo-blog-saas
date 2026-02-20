import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWebhook } from "@/lib/cms/webhook";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ websiteId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { webhookUrl: true },
    });

    return NextResponse.json({
      connected: !!website?.webhookUrl,
      webhookUrl: website?.webhookUrl || null,
    });
  } catch (error) {
    console.error("[Webhook GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const body = await req.json();
    const { action, webhookUrl, webhookSecret } = body;

    if (action === "test") {
      const website = await prisma.website.findUnique({
        where: { id: websiteId },
        select: { brandName: true, domain: true },
      });
      if (!webhookUrl || typeof webhookUrl !== "string") {
        return NextResponse.json({ success: false, error: "A valid webhook URL is required" }, { status: 400 });
      }

      const result = await sendWebhook({
        id: "test-" + Date.now(),
        title: "StackSerp Webhook Test",
        slug: "test-post",
        content: "# Test\n\nThis is a test webhook from StackSerp.",
        contentHtml: "<h1>Test</h1><p>This is a test webhook from StackSerp.</p>",
        excerpt: "Test webhook",
        status: "PUBLISHED",
        publishedAt: new Date().toISOString(),
        wordCount: 10,
        readingTime: 1,
        websiteId,
        websiteDomain: website?.domain || "",
        brandName: website?.brandName || "",
        tags: ["test"],
      }, { webhookUrl, webhookSecret });

      return NextResponse.json(result);
    }

    if (!webhookUrl || typeof webhookUrl !== "string") {
      return NextResponse.json({ error: "A valid webhook URL is required" }, { status: 400 });
    }

    await prisma.website.update({
      where: { id: websiteId },
      data: { webhookUrl, webhookSecret: webhookSecret || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    await prisma.website.update({
      where: { id: websiteId },
      data: { webhookUrl: null, webhookSecret: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
