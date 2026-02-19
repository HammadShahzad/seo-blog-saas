/**
 * Ghost CMS Integration
 * Uses Ghost Admin API to publish posts
 * Docs: https://ghost.org/docs/admin-api/
 */
import crypto from "crypto";

export interface GhostConfig {
  siteUrl: string;      // e.g. https://myblog.ghost.io
  adminApiKey: string;  // Format: {id}:{secret} from Ghost Admin → Integrations
}

export interface GhostPostPayload {
  title: string;
  html?: string;
  mobiledoc?: string;
  excerpt?: string;
  slug?: string;
  status?: "draft" | "published";
  tags?: string[];
  featureImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

function generateGhostJWT(adminApiKey: string): string {
  const [id, secret] = adminApiKey.split(":");
  if (!id || !secret) throw new Error("Invalid Ghost Admin API key format. Should be id:secret");

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", kid: id })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + 300, aud: "/admin/" })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export async function testGhostConnection(config: GhostConfig): Promise<{ success: boolean; siteName?: string; error?: string }> {
  const base = config.siteUrl.replace(/\/$/, "");
  try {
    const token = generateGhostJWT(config.adminApiKey);
    const res = await fetch(`${base}/ghost/api/admin/site/`, {
      headers: { Authorization: `Ghost ${token}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return { success: false, error: `Ghost returned ${res.status}. Check your Admin API key.` };
    }

    const data = await res.json();
    return { success: true, siteName: data.site?.title || base };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Connection failed" };
  }
}

export async function pushToGhost(post: GhostPostPayload, config: GhostConfig): Promise<{ success: boolean; postUrl?: string; editUrl?: string; error?: string }> {
  const base = config.siteUrl.replace(/\/$/, "");

  try {
    const token = generateGhostJWT(config.adminApiKey);

    const payload = {
      posts: [{
        title: post.title,
        html: post.html || "",
        custom_excerpt: post.excerpt || undefined,
        slug: post.slug || undefined,
        status: post.status || "draft",
        tags: (post.tags || []).map((name) => ({ name })),
        feature_image: post.featureImageUrl || undefined,
        meta_title: post.metaTitle || undefined,
        meta_description: post.metaDescription || undefined,
      }],
    };

    const res = await fetch(`${base}/ghost/api/admin/posts/`, {
      method: "POST",
      headers: {
        Authorization: `Ghost ${token}`,
        "Content-Type": "application/json",
        "Accept-Version": "v5.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.errors?.[0]?.message || `Ghost returned ${res.status}` };
    }

    const data = await res.json();
    const created = data.posts?.[0];

    return {
      success: true,
      postUrl: created?.url,
      editUrl: created?.id ? `${base}/ghost/#/editor/post/${created.id}` : undefined,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Push failed" };
  }
}
