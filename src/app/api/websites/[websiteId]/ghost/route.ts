import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { testGhostConnection } from "@/lib/cms/ghost";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ websiteId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { ghostConfig: true },
    });

    if (!website?.ghostConfig) return NextResponse.json({ connected: false });

    try {
      const config = JSON.parse(website.ghostConfig as string);
      return NextResponse.json({ connected: true, siteUrl: config.siteUrl });
    } catch {
      return NextResponse.json({ connected: false });
    }
  } catch (error) {
    console.error("[Ghost GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const body = await req.json();
    const { action, siteUrl, adminApiKey } = body;

    if (!siteUrl || typeof siteUrl !== "string") {
      return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
    }
    if (!adminApiKey || typeof adminApiKey !== "string") {
      return NextResponse.json({ error: "adminApiKey is required" }, { status: 400 });
    }

    if (action === "test") {
      const result = await testGhostConnection({ siteUrl, adminApiKey });
      return NextResponse.json(result);
    }

    await prisma.website.update({
      where: { id: websiteId },
      data: {
        ghostConfig: JSON.stringify({ siteUrl, adminApiKey }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Ghost POST]", error);
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
      data: { ghostConfig: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Ghost DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
