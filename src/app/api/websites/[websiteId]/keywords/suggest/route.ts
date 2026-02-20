import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateJSON } from "@/lib/ai/gemini";
import { verifyWebsiteAccess } from "@/lib/api-helpers";

export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { niche: true, targetAudience: true, brandName: true },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Get existing keywords to avoid duplicates
    const existing = await prisma.blogKeyword.findMany({
      where: { websiteId },
      select: { keyword: true },
    });
    const existingSet = new Set(existing.map((k) => k.keyword.toLowerCase()));

    interface SuggestionsResponse {
      keywords: Array<{
        keyword: string;
        intent: "informational" | "commercial" | "navigational" | "transactional";
        difficulty: "low" | "medium" | "high";
        priority: number;
        rationale: string;
      }>;
    }

    const result = await generateJSON<SuggestionsResponse>(
      `Generate 20 high-value SEO keyword ideas for a "${website.niche}" website targeting "${website.targetAudience}".

Focus on:
- Long-tail keywords with clear search intent
- Mix of informational ("how to..."), commercial ("best..."), and comparison keywords
- Keywords that can support 1000-2000 word blog posts
- Realistic search volume potential (not too competitive, not too niche)

Return JSON:
{
  "keywords": [
    {
      "keyword": "how to create an invoice for freelancers",
      "intent": "informational",
      "difficulty": "low",
      "priority": 8,
      "rationale": "High search volume, directly relevant, easy to rank"
    }
  ]
}`,
      "You are an expert SEO strategist. Return only valid JSON."
    );

    // Filter out already existing keywords
    const filtered = result.keywords.filter(
      (k) => !existingSet.has(k.keyword.toLowerCase())
    );

    return NextResponse.json({ suggestions: filtered });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Keyword suggest error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
