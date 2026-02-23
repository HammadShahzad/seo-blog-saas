/**
 * Twitter/X Integration — post a tweet thread on publish
 * Uses Twitter API v2 with OAuth 1.0a (API key + access token)
 */

interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
}

interface TweetResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

function parseTwitterConfig(raw: string): TwitterConfig | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Create an OAuth 1.0a Authorization header for Twitter API v2
 */
async function buildOAuthHeader(
  method: string,
  url: string,
  config: TwitterConfig,
  bodyParams: Record<string, string> = {}
): Promise<string> {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: config.apiKey,
    oauth_nonce: require("crypto").randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA256",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: config.accessToken,
    oauth_version: "1.0",
  };

  const allParams = { ...bodyParams, ...oauthParams };
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join("&");

  const sigBase = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const sigKey = `${encodeURIComponent(config.apiSecret)}&${encodeURIComponent(config.accessSecret)}`;

  const { createHmac } = await import("crypto");
  const signature = createHmac("sha256", sigKey).update(sigBase).digest("base64");

  oauthParams.oauth_signature = signature;

  const authHeader = "OAuth " + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(", ");

  return authHeader;
}

export async function postTweet(
  text: string,
  configRaw: string
): Promise<TweetResult> {
  const config = parseTwitterConfig(configRaw);
  if (!config?.apiKey) return { success: false, error: "Invalid Twitter config" };

  const url = "https://api.twitter.com/2/tweets";
  const body = { text: text.slice(0, 280) };

  try {
    const authHeader = await buildOAuthHeader("POST", url, config);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || `Twitter error ${res.status}` };
    }

    const tweetId = data.data?.id;
    return {
      success: true,
      tweetId,
      tweetUrl: tweetId ? `https://twitter.com/i/web/status/${tweetId}` : undefined,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Tweet failed" };
  }
}

export function buildTweetText(post: {
  title: string;
  excerpt?: string | null;
  slug: string;
  tags?: string[];
}, postUrl: string): string {
  const hashtags = (post.tags || [])
    .slice(0, 3)
    .map(t => `#${t.replace(/\s+/g, "")}`)
    .join(" ");

  const base = `${post.title}\n\n${postUrl}`;
  const withTags = hashtags ? `${base}\n\n${hashtags}` : base;
  return withTags.slice(0, 280);
}
