import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { testGhostConnection } from "@/lib/cms/ghost";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { websiteId } = await params;
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
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { websiteId } = await params;
  const body = await req.json();
  const { action, siteUrl, adminApiKey } = body;

  if (action === "test") {
    const result = await testGhostConnection({ siteUrl, adminApiKey });
    return NextResponse.json(result);
  }

  // Save credentials
  await prisma.website.update({
    where: { id: websiteId },
    data: {
      ghostConfig: JSON.stringify({ siteUrl, adminApiKey }),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { websiteId } = await params;
  await prisma.website.update({
    where: { id: websiteId },
    data: { ghostConfig: null },
  });

  return NextResponse.json({ success: true });
}
