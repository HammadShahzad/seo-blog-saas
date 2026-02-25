/**
 * Webflow CMS API v2 Integration
 * Publishes blog posts as Webflow CMS collection items.
 * Docs: https://docs.developers.webflow.com/data/reference
 */

export interface WebflowConfig {
  accessToken: string;
  siteId: string;
  collectionId: string;
}

export interface WebflowPostInput {
  title: string;
  slug: string;
  contentHtml: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface WebflowPushResult {
  success: boolean;
  itemId?: string;
  error?: string;
}

export interface WebflowConnectionResult {
  success: boolean;
  siteName?: string;
  error?: string;
}

const WEBFLOW_API = "https://api.webflow.com/v2";

function headers(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Validate Webflow credentials by fetching site info
 */
export async function testWebflowConnection(
  config: Pick<WebflowConfig, "accessToken" | "siteId">
): Promise<WebflowConnectionResult> {
  try {
    const res = await fetch(`${WEBFLOW_API}/sites/${config.siteId}`, {
      headers: headers(config.accessToken),
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 401 || res.status === 403) {
      return { success: false, error: "Authentication failed — check your Webflow API token." };
    }
    if (!res.ok) {
      return { success: false, error: `Webflow returned ${res.status}. Check your Site ID.` };
    }

    const data = (await res.json()) as { displayName?: string; shortName?: string };
    return { success: true, siteName: data.displayName || data.shortName || config.siteId };
  } catch {
    return { success: false, error: "Cannot reach Webflow API — check your connection." };
  }
}

/**
 * Create a CMS collection item (blog post) in Webflow
 */
export async function pushToWebflow(
  post: WebflowPostInput,
  config: WebflowConfig
): Promise<WebflowPushResult> {
  try {
    // Check if item with this slug already exists — update instead of creating a duplicate
    let existingItemId: string | undefined;
    const listRes = await fetch(
      `${WEBFLOW_API}/collections/${config.collectionId}/items?limit=100`,
      { headers: headers(config.accessToken), signal: AbortSignal.timeout(10000) }
    ).catch(() => null);
    if (listRes?.ok) {
      const listData = await listRes.json().catch(() => ({})) as { items?: { id: string; fieldData?: { slug?: string } }[] };
      const match = listData.items?.find((i) => i.fieldData?.slug === post.slug);
      if (match) existingItemId = match.id;
    }

    const fieldData = {
      name: post.title,
      slug: post.slug,
      "post-body": post.contentHtml,
      "post-summary": post.excerpt || "",
      "meta-title": post.metaTitle || post.title,
      "meta-description": post.metaDescription || "",
    };

    const payload = { isArchived: false, isDraft: false, fieldData };

    const endpoint = existingItemId
      ? `${WEBFLOW_API}/collections/${config.collectionId}/items/${existingItemId}`
      : `${WEBFLOW_API}/collections/${config.collectionId}/items`;

    const res = await fetch(endpoint, {
      method: existingItemId ? "PATCH" : "POST",
      headers: headers(config.accessToken),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as { message?: string; code?: string };
      return {
        success: false,
        error: errBody.message || `Webflow returned ${res.status}`,
      };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, itemId: data.id || existingItemId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
