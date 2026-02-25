import type { WordPressConfig, WordPressPostPayload, WordPressPostResult } from "./wordpress-types";
import { normalizeUrl, getAuthHeader, markdownToHtml } from "./wordpress-utils";
import { isSafeUrl } from "../url-safety";

async function uploadFeaturedImage(
  imageUrl: string,
  postTitle: string,
  config: WordPressConfig
): Promise<number | null> {
  const base = normalizeUrl(config.siteUrl);
  const auth = getAuthHeader(config.username, config.appPassword);

  if (!(await isSafeUrl(base)) || !(await isSafeUrl(imageUrl))) {
    console.error("[WP image] Blocked unsafe URL");
    return null;
  }

  try {
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(20000) });
    if (!imgRes.ok) {
      console.error(`[WP image] Failed to download from ${imageUrl}: HTTP ${imgRes.status}`);
      return null;
    }

    let contentType = imgRes.headers.get("content-type") || "";
    if (!contentType || contentType === "application/octet-stream") {
      const lower = imageUrl.toLowerCase();
      if (lower.includes(".png")) contentType = "image/png";
      else if (lower.includes(".webp")) contentType = "image/webp";
      else if (lower.includes(".gif")) contentType = "image/gif";
      else contentType = "image/jpeg";
    }
    contentType = contentType.split(";")[0].trim();

    const ext = contentType === "image/png" ? "png"
      : contentType === "image/webp" ? "webp"
      : contentType === "image/gif" ? "gif"
      : "jpg";

    const slug = postTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
    const filename = `${slug}.${ext}`;
    const buffer = await imgRes.arrayBuffer();

    const uploadRes = await fetch(`${base}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
      },
      body: buffer,
      signal: AbortSignal.timeout(45000),
    });

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text().catch(() => "");
      console.error(`[WP image] Media upload failed: HTTP ${uploadRes.status} — ${errBody.slice(0, 300)}`);
      return null;
    }

    const media = await uploadRes.json();

    if (media.id) {
      fetch(`${base}/wp-json/wp/v2/media/${media.id}`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify({ alt_text: postTitle }),
        signal: AbortSignal.timeout(10000),
      }).catch(() => {});
    }

    return media.id ?? null;
  } catch (err) {
    console.error("[WP image] uploadFeaturedImage threw:", err);
    return null;
  }
}

async function ensureTags(
  tags: string[],
  config: WordPressConfig
): Promise<number[]> {
  const base = normalizeUrl(config.siteUrl);
  const auth = getAuthHeader(config.username, config.appPassword);
  const ids: number[] = [];

  for (const tag of tags.slice(0, 10)) {
    try {
      const searchRes = await fetch(
        `${base}/wp-json/wp/v2/tags?search=${encodeURIComponent(tag)}&per_page=1`,
        { headers: { Authorization: auth }, signal: AbortSignal.timeout(5000) }
      );
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (results.length > 0) {
          ids.push(results[0].id);
          continue;
        }
      }

      const createRes = await fetch(`${base}/wp-json/wp/v2/tags`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tag }),
        signal: AbortSignal.timeout(5000),
      });

      if (createRes.ok) {
        const created = await createRes.json();
        ids.push(created.id);
      }
    } catch {
      // skip this tag
    }
  }

  return ids;
}

export async function pushToWordPress(
  post: WordPressPostPayload,
  config: WordPressConfig
): Promise<WordPressPostResult> {
  const base = normalizeUrl(config.siteUrl);

  if (!(await isSafeUrl(base))) {
    return { success: false, error: "The site URL is not reachable or points to an internal network." };
  }

  const auth = getAuthHeader(config.username, config.appPassword);

  try {
    const htmlContent = markdownToHtml(post.content);

    let featuredMediaId: number | undefined;
    if (post.featuredImageUrl) {
      const mediaId = await uploadFeaturedImage(
        post.featuredImageUrl,
        post.title,
        config
      );
      if (mediaId) featuredMediaId = mediaId;
    }

    let tagIds: number[] = [];
    if (post.tags && post.tags.length > 0) {
      tagIds = await ensureTags(post.tags, config);
    }

    // Check if a post with this slug already exists — update instead of creating a duplicate
    let existingWpId: number | undefined;
    if (post.slug) {
      const searchRes = await fetch(
        `${base}/wp-json/wp/v2/posts?slug=${encodeURIComponent(post.slug)}&status=any&per_page=1`,
        { headers: { Authorization: auth }, signal: AbortSignal.timeout(10000) }
      ).catch(() => null);
      if (searchRes?.ok) {
        const existing = await searchRes.json().catch(() => []);
        if (existing.length > 0) existingWpId = existing[0].id;
      }
    }

    const payload: Record<string, unknown> = {
      title: post.title,
      content: htmlContent,
      status: post.status || config.defaultStatus || "draft",
      excerpt: post.excerpt || "",
      slug: post.slug || undefined,
      tags: tagIds,
    };

    if (featuredMediaId) {
      payload.featured_media = featuredMediaId;
    }

    if (config.defaultCategoryId) {
      payload.categories = [config.defaultCategoryId];
    }

    if (post.metaTitle || post.metaDescription || post.focusKeyword) {
      payload.meta = {
        ...(post.metaTitle && { _yoast_wpseo_title: post.metaTitle }),
        ...(post.metaDescription && {
          _yoast_wpseo_metadesc: post.metaDescription,
        }),
        ...(post.focusKeyword && {
          _yoast_wpseo_focuskw: post.focusKeyword,
        }),
      };
    }

    const endpoint = existingWpId
      ? `${base}/wp-json/wp/v2/posts/${existingWpId}`
      : `${base}/wp-json/wp/v2/posts`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errBody.message ||
          `WordPress returned ${res.status}: ${res.statusText}`,
      };
    }

    const wpPost = await res.json();

    return {
      success: true,
      wpPostId: wpPost.id,
      wpPostUrl: wpPost.link,
      wpEditUrl: `${base}/wp-admin/post.php?post=${wpPost.id}&action=edit`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
