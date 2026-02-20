/**
 * Shared API route helpers — website ownership verification & input validation
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function verifyWebsiteAccess(websiteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });

  if (!membership) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const website = await prisma.website.findFirst({
    where: {
      id: websiteId,
      organizationId: membership.organizationId,
      status: { not: "DELETED" },
    },
  });

  if (!website) {
    return { error: NextResponse.json({ error: "Website not found" }, { status: 404 }) };
  }

  return { session, website, organizationId: membership.organizationId };
}

export function requireCronAuth(req: Request): NextResponse | null {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export function validateEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const IP_RATE_STORE = new Map<string, { count: number; resetAt: number }>();
const IP_WINDOW_MS = 60_000;
const IP_MAX_REQUESTS = 10;

export function checkIpRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  let bucket = IP_RATE_STORE.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + IP_WINDOW_MS };
    IP_RATE_STORE.set(identifier, bucket);
  }

  bucket.count++;

  if (bucket.count > IP_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: IP_MAX_REQUESTS - bucket.count };
}
