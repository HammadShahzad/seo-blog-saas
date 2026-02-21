import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateJSON } from "@/lib/ai/gemini";
import { crawlWebsite } from "@/lib/website-crawler";

export const maxDuration = 60;

export interface SuggestedLink {
  keyword: string;
  url: string;
  reason: string;
}

export interface SuggestResponse {
  suggestions: SuggestedLink[];
  steps: {
    crawl: "ok" | "failed";
    ai: "ok" | "failed";
    error?: string;
    pagesFound: number;
  };
  error?: string;
}

async function generateLinkPairsWithGemini(
  domain: string,
  websiteName: string,
  niche: string,
  crawledPages: { title: string; url: string }[],
  existingKeywords: string[]
): Promise<{ links: SuggestedLink[]; status: "ok" | "failed"; error?: string }> {
  if (!process.env.GOOGLE_AI_API_KEY) return { links: [], status: "failed" };
  if (crawledPages.length === 0) return { links: [], status: "failed", error: "No pages crawled" };

  const existingList =
    existingKeywords.length > 0
      ? `\n\nAlready mapped keywords (skip these): ${existingKeywords.join(", ")}`
      : "";

  // Build a strict list of ONLY crawled URLs for the AI to choose from
  const pagesList = crawledPages
    .map((p, i) => `${i + 1}. "${p.title}" → ${p.url}`)
    .join("\n");

  const prompt = `You are an SEO internal linking expert. Generate keyword → URL pairs for the website "${websiteName}" (${domain}) in the "${niche}" niche.

STRICT RULES:
- You MUST ONLY use URLs from the list below. Do NOT invent or guess any URLs.
- Every URL in your response must exactly match one of the URLs provided below.
- Do not use any external URLs or URLs from other domains.
${existingList}

Crawled pages from the website (use ONLY these URLs):
${pagesList}

For each page, create 1-2 natural keyword phrases that someone might write in a blog post.
Generate up to 25 keyword → URL pairs. Return a JSON array:
[
  {
    "keyword": "natural phrase 2-5 words",
    "url": "exact URL from the list above",
    "reason": "one sentence why this link is valuable"
  }
]`;

  try {
    const links = await generateJSON<SuggestedLink[]>(
      prompt,
      "You are an SEO internal linking expert. Return a JSON array only. Only use URLs provided to you."
    );
    return { links: Array.isArray(links) ? links : [], status: Array.isArray(links) && links.length > 0 ? "ok" : "failed" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Links Gemini error]", msg);
    return { links: [], status: "failed", error: msg };
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: {
        id: true,
        name: true,
        domain: true,
        brandUrl: true,
        niche: true,
        organizationId: true,
        faviconUrl: true,
        internalLinks: { select: { keyword: true } },
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const org = await prisma.organization.findFirst({
      where: {
        id: website.organizationId,
        members: { some: { userId: session.user.id } },
      },
    });
    if (!org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const domain = (website.brandUrl || `https://${website.domain}`).replace(/\/$/, "");
    const existingKeywords = website.internalLinks.map((l: { keyword: string }) => l.keyword);

    // Crawl the actual website directly — no Perplexity needed
    let crawlStatus: "ok" | "failed" = "failed";
    let crawledPages: { title: string; url: string }[] = [];
    let pagesFound = 0;

    try {
      const crawlResult = await crawlWebsite(domain);

      // Auto-update favicon if we found one and it's not set
      if (crawlResult.favicon && !website.faviconUrl) {
        await prisma.website.update({
          where: { id: websiteId },
          data: { faviconUrl: crawlResult.favicon },
        }).catch(() => {});
      }

      if (crawlResult.pages.length > 0) {
        crawlStatus = "ok";
        pagesFound = crawlResult.pages.length;
        crawledPages = crawlResult.pages;
      }
    } catch (err) {
      console.error("[Crawl error]", err);
    }

    // If crawl failed, return early — we only use real crawled URLs
    if (crawlStatus !== "ok" || crawledPages.length === 0) {
      return NextResponse.json({
        suggestions: [],
        steps: { crawl: "failed", ai: "failed", pagesFound: 0 },
      } as SuggestResponse);
    }

    // Build a set of valid crawled URLs for strict post-filter
    const crawledUrlSet = new Set(crawledPages.map((p) => p.url.replace(/\/$/, "")));
    const domainOrigin = new URL(domain).origin;

    // Generate keyword→URL pairs with Gemini using only crawled pages
    const geminiResult = await generateLinkPairsWithGemini(
      domain,
      website.name,
      website.niche ?? "general",
      crawledPages,
      existingKeywords
    );

    // Strict filter: only allow URLs that were actually crawled from this domain
    const existing = new Set(existingKeywords.map((k) => k.toLowerCase()));
    const filtered = geminiResult.links.filter((s) => {
      if (!s.keyword?.trim() || !s.url?.trim()) return false;
      if (existing.has(s.keyword.toLowerCase())) return false;
      // Must be a real URL from the crawled set
      const normalizedUrl = s.url.replace(/\/$/, "");
      if (!crawledUrlSet.has(normalizedUrl)) return false;
      // Must be same-origin as the website
      try {
        return new URL(s.url).origin === domainOrigin;
      } catch {
        return false;
      }
    });

    const response: SuggestResponse = {
      suggestions: filtered,
      steps: {
        crawl: crawlStatus,
        ai: geminiResult.status,
        error: geminiResult.error,
        pagesFound,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating link suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
