/**
 * LinkedIn Integration — share a post to LinkedIn feed on publish
 * Uses LinkedIn v2 API with OAuth 2.0 access token
 * Requires w_member_social scope
 */

interface LinkedInResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export async function shareToLinkedIn(
  post: {
    title: string;
    excerpt?: string | null;
    slug: string;
    tags?: string[];
  },
  postUrl: string,
  accessToken: string
): Promise<LinkedInResult> {
  if (!accessToken) return { success: false, error: "No LinkedIn access token" };

  // First get the person URN
  let personUrn: string;
  try {
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!profileRes.ok) {
      return { success: false, error: `LinkedIn auth failed (${profileRes.status})` };
    }
    const profile = await profileRes.json();
    personUrn = `urn:li:person:${profile.sub}`;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "LinkedIn profile fetch failed" };
  }

  const commentary = [
    post.title,
    "",
    post.excerpt ? post.excerpt.slice(0, 200) + (post.excerpt.length > 200 ? "..." : "") : "",
    "",
    `Read more: ${postUrl}`,
    "",
    (post.tags || []).slice(0, 5).map(t => `#${t.replace(/\s+/g, "")}`).join(" "),
  ].filter(l => l !== undefined).join("\n").trim();

  const shareBody = {
    author: personUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: commentary.slice(0, 3000) },
        shareMediaCategory: "ARTICLE",
        media: [{
          status: "READY",
          description: { text: (post.excerpt || post.title).slice(0, 256) },
          originalUrl: postUrl,
          title: { text: post.title.slice(0, 200) },
        }],
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  try {
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(shareBody),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `LinkedIn error ${res.status}: ${err.slice(0, 200)}` };
    }

    const data = await res.json();
    return { success: true, postId: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "LinkedIn share failed" };
  }
}
