import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateJSON } from "@/lib/ai/gemini";
import { checkAiRateLimit } from "@/lib/api-helpers";
import { crawlWebsite } from "@/lib/website-crawler";

interface WebsiteAnalysis {
  brandName: string;
  brandUrl: string;
  primaryColor: string[];
  niche: string[];
  description: string[];
  targetAudience: string[];
  tone: string[];
  uniqueValueProp: string[];
  competitors: string[];
  keyProducts: string[];
  targetLocation: string;
  suggestedCtaText: string[];
  suggestedCtaUrl: string;
  suggestedWritingStyle: string[];
}

export const maxDuration = 60;

async function fetchPerplexity(domain: string, name: string, homepageText: string): Promise<string> {
  let apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return "";
  apiKey = apiKey.replace(/\\n/g, "").trim();

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a business analyst. Concise factual summary only. If unsure, say so." },
          {
            role: "user",
            content: `Research "${domain}" (brand: "${name}").${homepageText ? `\nHomepage excerpt: ${homepageText.slice(0, 800)}` : ""}
What does the business do? Target audience? Niche? Top 3-5 competitors? Key products? Geographic market? Under 200 words. Do NOT invent.`,
          },
        ],
        max_tokens: 300,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitErr = checkAiRateLimit(session.user.id, "analyze", 10);
    if (rateLimitErr) return rateLimitErr;

    const { name, domain } = await req.json();

    if (!name || !domain) {
      return NextResponse.json({ error: "name and domain are required" }, { status: 400 });
    }
    if (typeof name === "string" && name.length > 200) {
      return NextResponse.json({ error: "name too long" }, { status: 400 });
    }
    if (typeof domain === "string" && domain.length > 253) {
      return NextResponse.json({ error: "domain too long" }, { status: 400 });
    }

    const fullUrl = domain.startsWith("http") ? domain : `https://${domain}`;

    // Step 1: Crawl website AND research Perplexity IN PARALLEL
    const [crawlResult, perplexityRaw] = await Promise.all([
      crawlWebsite(fullUrl).catch(() => null),
      fetchPerplexity(domain, name, ""),
    ]);

    const homepageText = crawlResult?.pageText || "";
    const metaDesc = crawlResult?.metaDescription || "";
    const sitePages = (crawlResult?.pages || []).slice(0, 15).map(p => p.title ? `${p.title}: ${p.url}` : p.url);

    // If we got homepage text, re-query Perplexity with it for better results (only if first call returned little)
    const perplexityData = perplexityRaw || "";

    // Step 2: Use Gemini with REAL data — homepage text is the primary source
    const hasRealContent = homepageText.length > 100;

    const prompt = `Generate an accurate website profile for AI content marketing. Base answers on REAL website data.

Website: "${name}" (${domain})
${metaDesc ? `Meta: "${metaDesc}"` : ""}
${hasRealContent ? `\n## HOMEPAGE TEXT (PRIMARY SOURCE — this IS what the business does):\n${homepageText.slice(0, 2500)}` : ""}
${sitePages.length > 0 ? `\n## Site Pages:\n${sitePages.join("\n")}` : ""}
${perplexityData ? `\n## Research (secondary — do NOT override homepage):\n${perplexityData}` : ""}

## RULES:
- Homepage text = TRUTH. Describe what the business ACTUALLY does.
- Do NOT invent features/services not on the website.
- If B2B, say B2B. If B2C, say B2C. Read the homepage.
- "keyProducts": ONLY list services/features explicitly mentioned on the site.
- Competitors must be real companies. List fewer if unsure.

Return JSON with 3 different options per field (option 1=literal, 2=specific, 3=marketing angle):
{"brandName":"...","brandUrl":"https://...","primaryColor":["#hex","#hex","#hex"],"niche":["...","...","..."],"description":["...","...","..."],"targetAudience":["...","...","..."],"tone":["...","...","..."],"uniqueValueProp":["...","...","..."],"competitors":["real1","real2",...max5],"keyProducts":["actual1",...max5],"targetLocation":"...","suggestedCtaText":["...","...","..."],"suggestedCtaUrl":"URL from site","suggestedWritingStyle":["style1","style2","style3"]}

suggestedWritingStyle: pick 3 from informative/conversational/technical/storytelling/persuasive/humorous. Descriptions: 2-3 sentences max.`;

    const analysis = await generateJSON<WebsiteAnalysis>(prompt);

    if (analysis.brandUrl && !analysis.brandUrl.startsWith("http")) {
      analysis.brandUrl = `https://${analysis.brandUrl}`;
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Website analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze website" },
      { status: 500 }
    );
  }
}
