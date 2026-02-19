/**
 * IndexNow — Submit URLs to Google, Bing, Yandex instantly on publish
 * Docs: https://www.indexnow.org/documentation
 */

const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
];

export async function submitToIndexNow(
  urls: string[],
  host: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  if (!urls.length || !host || !apiKey) {
    return { success: false, error: "Missing urls, host, or apiKey" };
  }

  const body = {
    host,
    key: apiKey,
    keyLocation: `https://${host}/${apiKey}.txt`,
    urlList: urls.slice(0, 10000), // IndexNow max
  };

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      });

      // 200 or 202 = accepted
      if (res.status === 200 || res.status === 202) {
        return { success: true };
      }
    } catch {
      // try next endpoint
    }
  }

  return { success: true }; // silent fail — indexing is best-effort
}

/**
 * Submit a single blog post URL after publish
 */
export async function indexPost(
  postSlug: string,
  websiteDomain: string,
  subdomain?: string | null,
  indexNowKey?: string | null
): Promise<void> {
  if (!indexNowKey) return;

  const baseUrl = subdomain
    ? `${process.env.NEXTAUTH_URL}/blog/${subdomain}`
    : `https://${websiteDomain}`;

  const url = `${baseUrl}/${postSlug}`;
  await submitToIndexNow([url], websiteDomain, indexNowKey);
}
