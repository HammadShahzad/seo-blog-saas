/**
 * GET  /api/websites/[websiteId]/wordpress — get WP config
 * POST /api/websites/[websiteId]/wordpress — save WP config
 * DELETE /api/websites/[websiteId]/wordpress — remove WP config
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { testWordPressConnection } from "@/lib/cms/wordpress";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: {
        cmsType: true,
        cmsApiUrl: true,
        cmsApiKey: true,
        webhookUrl: true,
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    return NextResponse.json({
      connected: !!(website.cmsApiUrl && website.cmsApiKey),
      siteUrl: website.cmsApiUrl || "",
      // Never return the actual password, just indicate it's set
      hasPassword: !!(website.cmsApiKey),
      cmsType: website.cmsType,
    });
  } catch (error) {
    console.error("WordPress GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { action, siteUrl, username, appPassword, defaultStatus } = await req.json();

    // Test connection action
    if (action === "test") {
      if (!siteUrl || !username || !appPassword) {
        return NextResponse.json(
          { error: "siteUrl, username, and appPassword are required" },
          { status: 400 }
        );
      }

      const result = await testWordPressConnection({
        siteUrl,
        username,
        appPassword,
        defaultStatus: defaultStatus || "draft",
      });

      return NextResponse.json(result);
    }

    // Save credentials action
    if (!siteUrl || !username || !appPassword) {
      return NextResponse.json(
        { error: "siteUrl, username, and appPassword are required" },
        { status: 400 }
      );
    }

    // Encode username + password together for storage
    const encoded = Buffer.from(`${username}:::${appPassword}`).toString("base64");

    await prisma.website.update({
      where: { id: websiteId },
      data: {
        cmsType: "WORDPRESS",
        cmsApiUrl: siteUrl.replace(/\/$/, ""),
        cmsApiKey: encoded,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WordPress POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;

    await prisma.website.update({
      where: { id: websiteId },
      data: {
        cmsType: null,
        cmsApiUrl: null,
        cmsApiKey: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WordPress DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
