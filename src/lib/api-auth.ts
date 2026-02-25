/**
 * API key authentication for public v1 API
 * Validates Bearer token, checks scopes, updates lastUsed
 */
import { createHash } from "crypto";
import prisma from "./prisma";

export interface ApiKeyContext {
  userId: string;
  keyId: string;
  scopes: string[];
}

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function authenticateApiKey(
  req: Request
): Promise<{ ctx: ApiKeyContext } | { error: string; status: number }> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { error: "Missing Authorization: Bearer <api_key>", status: 401 };
  }

  const raw = auth.slice(7).trim();
  if (!raw) return { error: "Empty API key", status: 401 };

  const hashed = hashKey(raw);

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: hashed },
    select: {
      id: true,
      userId: true,
      scopes: true,
      isActive: true,
      expiresAt: true,
    },
  });

  if (!apiKey || !apiKey.isActive) {
    return { error: "Invalid or revoked API key", status: 401 };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { error: "API key has expired", status: 401 };
  }

  prisma.apiKey
    .update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } })
    .catch(() => {});

  return {
    ctx: { userId: apiKey.userId, keyId: apiKey.id, scopes: apiKey.scopes },
  };
}

export function hasScope(ctx: ApiKeyContext, required: string): boolean {
  return ctx.scopes.includes(required);
}

export function generateRawKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const { randomBytes } = require("crypto") as typeof import("crypto");
  const bytes = randomBytes(40);
  return "bf_" + Array.from(bytes as Uint8Array, (b: number) => chars[b % chars.length]).join("");
}

export { hashKey };
