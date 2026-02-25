/**
 * Shared SSRF protection utility.
 * Validates URLs are safe to fetch server-side (no internal network access).
 */
import { lookup } from "dns/promises";

const PRIVATE_IP_RE =
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.|::1|fc00:|fe80:)/i;

/**
 * Validate a URL is safe to fetch (no SSRF).
 * Checks: valid URL, http(s) only, not localhost/private, DNS resolves to public IP.
 */
export async function isSafeUrl(rawUrl: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || PRIVATE_IP_RE.test(host)) return false;
  try {
    const { address } = await lookup(host);
    if (PRIVATE_IP_RE.test(address)) return false;
  } catch {
    return false;
  }
  return true;
}
