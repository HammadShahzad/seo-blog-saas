/**
 * API Key Management
 * GET  /api/api-keys → List user's API keys
 * POST /api/api-keys → Create a new API key
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateRawKey, hashKey } from "@/lib/api-auth";

const ALLOWED_SCOPES = [
  "posts:read",
  "posts:write",
  "keywords:read",
  "keywords:write",
  "generate:write",
  "analytics:read",
];

function filterScopes(input: unknown): string[] {
  if (!Array.isArray(input)) return ["posts:read", "posts:write"];
  const valid = input.filter(
    (s): s is string => typeof s === "string" && ALLOWED_SCOPES.includes(s)
  );
  return valid.length > 0 ? valid : ["posts:read", "posts:write"];
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      lastUsed: true,
      expiresAt: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const rawKey = generateRawKey();
  const hashed = hashKey(rawKey);
  const prefix = rawKey.slice(0, 11); // "bf_" + first 8 chars

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key: hashed,
      prefix,
      scopes: filterScopes(body.scopes),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      userId: session.user.id,
    },
    select: { id: true, name: true, prefix: true, scopes: true, createdAt: true },
  });

  return NextResponse.json({ ...apiKey, rawKey }, { status: 201 });
}
