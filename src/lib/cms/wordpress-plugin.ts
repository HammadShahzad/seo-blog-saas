import type { WordPressPostPayload, WordPressPostResult } from "./wordpress-types";
import { normalizeUrl, markdownToHtml } from "./wordpress-utils";

const PLUGIN_NAMESPACES = ["stackserp", "blogforge"];

async function detectPluginNamespace(
  base: string,
  apiKey: string,
): Promise<{ namespace: string; headerKey: string } | null> {
  for (const ns of PLUGIN_NAMESPACES) {
    const headerKey = ns === "stackserp" ? "X-StackSerp-Key" : "X-BlogForge-Key";
    try {
      const res = await fetch(`${base}/wp-json/${ns}/v1/status`, {
        headers: { [headerKey]: apiKey, "X-StackSerp-Key": apiKey, "X-BlogForge-Key": apiKey },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return { namespace: ns, headerKey };
    } catch {
      // try next
    }
  }
  return null;
}

export async function pushToWordPressPlugin(
  post: WordPressPostPayload,
  siteUrl: string,
  pluginApiKey: string
): Promise<WordPressPostResult> {
  const base = normalizeUrl(siteUrl);
  const htmlContent = markdownToHtml(post.content);

  try {
    const detected = await detectPluginNamespace(base, pluginApiKey);
    if (!detected) {
      return {
        success: false,
        error: "Could not reach the WordPress plugin. Make sure the StackSerp Connector (or BlogForge Connector) plugin is installed and activated.",
      };
    }

    let featuredImageData: string | undefined;
    let featuredImageMime: string | undefined;
    if (post.featuredImageUrl) {
      try {
        const imgRes = await fetch(post.featuredImageUrl, { signal: AbortSignal.timeout(20000) });
        if (imgRes.ok) {
          let mime = (imgRes.headers.get("content-type") || "").split(";")[0].trim();
          if (!mime || mime === "application/octet-stream") {
            const lower = post.featuredImageUrl.toLowerCase();
            mime = lower.includes(".png") ? "image/png"
              : lower.includes(".webp") ? "image/webp"
              : lower.includes(".gif") ? "image/gif"
              : "image/jpeg";
          }
          const buf = await imgRes.arrayBuffer();
          featuredImageData = Buffer.from(buf).toString("base64");
          featuredImageMime = mime;
        } else {
          console.error(`[WP plugin image] Could not download ${post.featuredImageUrl}: HTTP ${imgRes.status}`);
        }
      } catch (imgErr) {
        console.error("[WP plugin image] Download error:", imgErr);
      }
    }

    const res = await fetch(`${base}/wp-json/${detected.namespace}/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-StackSerp-Key": pluginApiKey,
        "X-BlogForge-Key": pluginApiKey,
      },
      body: JSON.stringify({
        title: post.title,
        content: htmlContent,
        excerpt: post.excerpt || "",
        slug: post.slug || "",
        status: post.status || "draft",
        tags: post.tags || [],
        category: post.category || "",
        meta_title: post.metaTitle || "",
        meta_description: post.metaDescription || "",
        focus_keyword: post.focusKeyword || "",
        featured_image_url: post.featuredImageUrl || "",
        ...(featuredImageData && {
          featured_image_data: featuredImageData,
          featured_image_mime: featuredImageMime,
        }),
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as Record<string, string>;
      return { success: false, error: errBody.error || `WordPress plugin returned ${res.status}` };
    }

    const data = await res.json() as { post_id: number; post_url: string; edit_url: string };
    return {
      success: true,
      wpPostId: data.post_id,
      wpPostUrl: data.post_url,
      wpEditUrl: data.edit_url,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
