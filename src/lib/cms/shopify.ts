/**
 * Shopify Admin REST API Integration
 * Publishes AI-generated blog posts as Shopify Articles
 *
 * Requires: Private App or Custom App with write_content + read_content scopes
 * Credentials: storeUrl (e.g. mystore.myshopify.com) + Admin API access token
 */

import { isSafeUrl } from "../url-safety";

const SHOPIFY_API_VERSION = "2025-01";

export interface ShopifyConfig {
  storeUrl: string;       // e.g. "mystore.myshopify.com"
  accessToken: string;    // Admin API access token
  blogId?: string;        // Shopify blog ID (leave blank to auto-pick first blog)
  blogTitle?: string;     // Blog display name (cached)
}

export interface ShopifyBlog {
  id: number;
  title: string;
  handle: string;
}

export interface ShopifyConnectionResult {
  success: boolean;
  shopName?: string;
  shopDomain?: string;
  email?: string;
  plan?: string;
  error?: string;
}

export interface ShopifyPushResult {
  success: boolean;
  articleId?: number;
  articleUrl?: string;
  adminUrl?: string;
  error?: string;
}

function storeBase(storeUrl: string): string {
  const host = storeUrl
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .trim();
  return `https://${host}`;
}

function apiBase(storeUrl: string): string {
  return `${storeBase(storeUrl)}/admin/api/${SHOPIFY_API_VERSION}`;
}

function headers(accessToken: string) {
  return {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  };
}

/**
 * Test credentials by fetching shop info
 */
export async function testShopifyConnection(
  config: Pick<ShopifyConfig, "storeUrl" | "accessToken">
): Promise<ShopifyConnectionResult> {
  const base = storeBase(config.storeUrl);
  if (!(await isSafeUrl(base))) {
    return { success: false, error: "The store URL is not reachable or points to an internal network." };
  }
  try {
    const res = await fetch(`${apiBase(config.storeUrl)}/shop.json`, {
      headers: headers(config.accessToken),
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 401 || res.status === 403) {
      return { success: false, error: "Authentication failed — check your Access Token and make sure it has read_content scope." };
    }
    if (!res.ok) {
      return { success: false, error: `Shopify returned ${res.status} — check your store URL.` };
    }

    const data = await res.json() as { shop: { name: string; domain: string; email: string; plan_name: string } };
    return {
      success: true,
      shopName: data.shop.name,
      shopDomain: data.shop.domain,
      email: data.shop.email,
      plan: data.shop.plan_name,
    };
  } catch {
    return { success: false, error: `Cannot reach ${config.storeUrl} — check the store URL.` };
  }
}

/**
 * List all blogs in the store
 */
export async function listShopifyBlogs(
  config: Pick<ShopifyConfig, "storeUrl" | "accessToken">
): Promise<ShopifyBlog[]> {
  const base = storeBase(config.storeUrl);
  if (!(await isSafeUrl(base))) return [];
  try {
    const res = await fetch(`${apiBase(config.storeUrl)}/blogs.json`, {
      headers: headers(config.accessToken),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { blogs: ShopifyBlog[] };
    return data.blogs || [];
  } catch {
    return [];
  }
}

/**
 * Push a blog post as a Shopify article
 */
export async function pushToShopify(
  post: {
    title: string;
    contentHtml: string;
    excerpt?: string;
    slug?: string;
    tags?: string[];
    featuredImageUrl?: string;
    status?: "published" | "draft";
    metaTitle?: string;
    metaDescription?: string;
  },
  config: ShopifyConfig
): Promise<ShopifyPushResult> {
  const base = storeBase(config.storeUrl);
  if (!(await isSafeUrl(base))) {
    return { success: false, error: "The store URL is not reachable or points to an internal network." };
  }
  try {
    // Resolve the blog ID — use configured one or fetch the first available
    let blogId = config.blogId;
    if (!blogId) {
      const blogs = await listShopifyBlogs(config);
      if (!blogs.length) {
        return { success: false, error: "No blogs found in your Shopify store. Create a blog in Shopify admin first (Online Store → Blog Posts → Manage blogs)." };
      }
      blogId = String(blogs[0].id);
    }

    const isPublished = post.status !== "draft";

    // Check if article with this handle already exists — update instead of creating a duplicate
    let existingArticleId: number | undefined;
    if (post.slug) {
      const searchRes = await fetch(
        `${apiBase(config.storeUrl)}/blogs/${blogId}/articles.json?handle=${encodeURIComponent(post.slug)}&limit=1`,
        { headers: headers(config.accessToken), signal: AbortSignal.timeout(10000) }
      ).catch(() => null);
      if (searchRes?.ok) {
        const data = await searchRes.json().catch(() => ({})) as { articles?: { id: number }[] };
        if (data.articles?.length) existingArticleId = data.articles[0].id;
      }
    }

    const payload: Record<string, unknown> = {
      article: {
        title: post.title,
        body_html: post.contentHtml,
        summary_html: post.excerpt || "",
        tags: (post.tags || []).join(", "),
        published: isPublished,
        ...(post.slug && { handle: post.slug }),
        ...(post.metaTitle && { metafields: [
          { namespace: "seo", key: "title", value: post.metaTitle, type: "single_line_text_field" },
          ...(post.metaDescription ? [{ namespace: "seo", key: "description", value: post.metaDescription, type: "single_line_text_field" }] : []),
        ]}),
        ...(post.featuredImageUrl && { image: { src: post.featuredImageUrl } }),
      },
    };

    const endpoint = existingArticleId
      ? `${apiBase(config.storeUrl)}/blogs/${blogId}/articles/${existingArticleId}.json`
      : `${apiBase(config.storeUrl)}/blogs/${blogId}/articles.json`;

    const res = await fetch(endpoint, {
      method: existingArticleId ? "PUT" : "POST",
      headers: headers(config.accessToken),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as { errors?: unknown };
      return {
        success: false,
        error: typeof errBody.errors === "string"
          ? errBody.errors
          : `Shopify returned ${res.status} — ${JSON.stringify(errBody.errors || "")}`,
      };
    }

    const data = await res.json() as { article: { id: number; handle: string } };
    const articleId = data.article.id;
    const base = storeBase(config.storeUrl);

    return {
      success: true,
      articleId,
      articleUrl: `${base}/blogs/${blogId}/${data.article.handle}`,
      adminUrl: `${base}/admin/articles/${articleId}`,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
