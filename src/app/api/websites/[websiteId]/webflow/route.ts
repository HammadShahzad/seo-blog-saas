import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { testWebflowConnection } from "@/lib/cms/webflow";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ websiteId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const body = await req.json();
    const { accessToken, siteId } = body;

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json({ error: "accessToken is required" }, { status: 400 });
    }
    if (!siteId || typeof siteId !== "string") {
      return NextResponse.json({ error: "siteId is required" }, { status: 400 });
    }

    const result = await testWebflowConnection({ accessToken, siteId });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Webflow POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const body = await req.json();
    const { accessToken, siteId, collectionId } = body;

    if (!accessToken || !siteId || !collectionId) {
      return NextResponse.json(
        { error: "accessToken, siteId, and collectionId are required" },
        { status: 400 }
      );
    }

    const webflowConfig = JSON.stringify({ accessToken, siteId, collectionId });

    await prisma.website.update({
      where: { id: websiteId },
      data: {
        cmsType: "WEBFLOW",
        cmsApiKey: webflowConfig,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webflow PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { cmsType: true, cmsApiKey: true },
    });

    if (!website || website.cmsType !== "WEBFLOW" || !website.cmsApiKey) {
      return NextResponse.json({ connected: false });
    }

    try {
      const config = JSON.parse(website.cmsApiKey);
      return NextResponse.json({
        connected: true,
        siteId: config.siteId,
        collectionId: config.collectionId,
      });
    } catch {
      return NextResponse.json({ connected: false });
    }
  } catch (error) {
    console.error("[Webflow GET]", error);
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
      data: { cmsType: null, cmsApiKey: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webflow DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
