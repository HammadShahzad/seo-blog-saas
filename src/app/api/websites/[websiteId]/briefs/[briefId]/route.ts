/**
 * Single Content Brief
 * GET    /api/websites/:id/briefs/:briefId → Get brief details
 * PATCH  /api/websites/:id/briefs/:briefId → Update brief (approve, edit)
 * DELETE /api/websites/:id/briefs/:briefId → Delete brief
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ websiteId: string; briefId: string }> };

export async function GET(req: Request, { params }: Params) {
  const { websiteId, briefId } = await params;
  const access = await verifyWebsiteAccess(websiteId);
  if ("error" in access) return access.error;

  const brief = await prisma.contentBrief.findFirst({ where: { id: briefId, websiteId } });
  if (!brief) return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  return NextResponse.json(brief);
}

export async function PATCH(req: Request, { params }: Params) {
  const { websiteId, briefId } = await params;
  const access = await verifyWebsiteAccess(websiteId);
  if ("error" in access) return access.error;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("title" in body) data.title = body.title;
  if ("outline" in body) data.outline = body.outline;
  if ("status" in body) data.status = body.status;
  if ("approved" in body) data.approved = body.approved;

  const brief = await prisma.contentBrief.update({
    where: { id: briefId },
    data,
  });

  return NextResponse.json(brief);
}

export async function DELETE(req: Request, { params }: Params) {
  const { websiteId, briefId } = await params;
  const access = await verifyWebsiteAccess(websiteId);
  if ("error" in access) return access.error;

  await prisma.contentBrief.delete({ where: { id: briefId } });
  return NextResponse.json({ success: true });
}
