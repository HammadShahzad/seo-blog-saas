import type { WordPressConfig, WordPressConnectionResult } from "./wordpress-types";
import { normalizeUrl, getAuthHeader } from "./wordpress-utils";
import { isSafeUrl } from "../url-safety";

export async function testWordPressConnection(
  config: WordPressConfig
): Promise<WordPressConnectionResult> {
  const base = normalizeUrl(config.siteUrl);

  if (!(await isSafeUrl(base))) {
    return { success: false, error: "The site URL is not reachable or points to an internal network." };
  }

  const auth = getAuthHeader(config.username, config.appPassword);

  try {
    const [siteRes, userRes] = await Promise.all([
      fetch(`${base}/wp-json`, {
        headers: { Authorization: auth },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${base}/wp-json/wp/v2/users/me`, {
        headers: { Authorization: auth },
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    if (!userRes.ok) {
      if (userRes.status === 401 || userRes.status === 403) {
        return {
          success: false,
          error:
            "Authentication failed. Check your username and Application Password.",
        };
      }
      return {
        success: false,
        error: `WordPress returned ${userRes.status}. Make sure the REST API is enabled.`,
      };
    }

    const user = await userRes.json();
    let siteName = base;
    let wpVersion: string | undefined;

    if (siteRes.ok) {
      const site = await siteRes.json();
      siteName = site.name || base;
      wpVersion = site.namespaces?.includes("wp/v2") ? site.url : undefined;
    }

    return {
      success: true,
      siteName,
      siteUrl: base,
      wpVersion,
      userName: user.name,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("fetch")) {
      return {
        success: false,
        error: `Cannot reach ${base}. Check the URL and make sure the site is online.`,
      };
    }
    return { success: false, error: msg };
  }
}
