import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    return NextResponse.json(access.website);
  } catch (error) {
    console.error("Error fetching website:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;
    const { website } = access;

    const body = await req.json();

    // Only allow updating specific fields
    const allowedFields = [
      "name", "domain", "niche", "description", "targetAudience",
      "tone", "brandName", "brandUrl", "primaryColor", "logoUrl",
      "faviconUrl", "customDomain", "autoPublish", "postsPerWeek",
      "publishTime", "publishDays", "timezone", "hostingMode", "webhookUrl",
      "webhookSecret", "cmsType", "cmsApiUrl", "cmsApiKey",
      "googleAnalyticsId", "gscPropertyUrl", "twitterApiKey",
      "twitterApiSecret", "twitterAccessToken", "twitterAccessSecret",
      "linkedinAccessToken", "sitemapEnabled", "robotsTxt", "indexNowKey",
      "uniqueValueProp", "competitors", "keyProducts", "targetLocation",
      "status",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Restrict status transitions (only when actually changing)
    if (updateData.status && updateData.status !== website.status) {
      const validTransitions: Record<string, string[]> = {
        ACTIVE: ["PAUSED", "DELETED"],
        PAUSED: ["ACTIVE", "DELETED"],
      };
      const allowed = validTransitions[website.status] || [];
      if (!allowed.includes(updateData.status as string)) {
        return NextResponse.json({ error: `Cannot transition from ${website.status} to ${updateData.status}` }, { status: 400 });
      }
    } else if (updateData.status === website.status) {
      delete updateData.status;
    }

    const updated = await prisma.website.update({
      where: { id: websiteId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating website:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    // Soft delete
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: "DELETED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting website:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
