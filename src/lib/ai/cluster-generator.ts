/**
 * Topic Cluster Generator
 * Seed → Research (crawl website) → Structure with Gemini → Preview/Queue
 */
import { generateJSON } from "./gemini";
import { crawlWebsite } from "../website-crawler";

export interface ClusterKeyword {
  keyword: string;
  role: "pillar" | "supporting";
  searchIntent: "informational" | "transactional" | "commercial";
  suggestedWordCount: number;
  description: string;
}

export interface ClusterPreview {
  pillarTitle: string;
  description: string;
  keywords: ClusterKeyword[];
}

async function researchSeedTopic(
  seedTopic: string,
  brandUrl: string,
  niche: string,
  brandName: string,
): Promise<string> {
  // Crawl the website directly instead of wasting Perplexity credits
  let siteContext = "";
  try {
    const crawl = await crawlWebsite(brandUrl);
    if (crawl.pages.length > 0) {
      siteContext = "\n\nPages found on the website:\n" +
        crawl.pages.slice(0, 30).map(p => `- ${p.title}: ${p.url}`).join("\n");
    }
  } catch {
    // Non-fatal
  }

  // Use Perplexity for competitive research (this IS a valid use — researching what competitors write)
  let apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return siteContext || `Topic: ${seedTopic} in the ${niche} space for ${brandName}.`;
  apiKey = apiKey.replace(/\\n/g, "").trim();

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `You are an SEO content strategist specializing in the ${niche} niche. Provide detailed keyword research and competitor analysis.`,
          },
          {
            role: "user",
            content: `Research the topic "${seedTopic}" for a content cluster strategy for ${brandName} (${brandUrl}).

I need:
1. What are the top 10 ranking articles for this topic? List their titles and what they cover.
2. What are 20-25 related long-tail keywords people search for?
3. What subtopics do top-ranking pages cover that we should include?
4. What questions do people frequently ask about this topic?
5. What content gaps exist (things competitors miss)?

Focus on keywords relevant to ${niche} and ${brandName}'s target audience.`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return siteContext || `Topic: ${seedTopic} for ${brandName} in ${niche}.`;
    const data = await res.json();
    const research = data.choices?.[0]?.message?.content || "";
    return research + siteContext;
  } catch {
    return siteContext || `Topic: ${seedTopic} for ${brandName} in ${niche}.`;
  }
}

export async function generateClusterPreview(
  seedTopic: string,
  website: {
    brandUrl: string;
    brandName: string;
    niche: string;
    description: string;
    targetAudience: string;
  },
  existingKeywords: string[] = [],
): Promise<ClusterPreview> {
  const research = await researchSeedTopic(
    seedTopic,
    website.brandUrl,
    website.niche,
    website.brandName,
  );

  const existingSection = existingKeywords.length > 0
    ? `\n\nExisting keywords already in the queue (avoid duplicates):\n${existingKeywords.slice(0, 40).join(", ")}`
    : "";

  const result = await generateJSON<ClusterPreview>(
    `You are an expert SEO content strategist. Based on the research below, create a topic cluster for "${seedTopic}".

## Business Context:
- Brand: ${website.brandName} (${website.brandUrl})
- Niche: ${website.niche}
- Description: ${website.description}
- Target audience: ${website.targetAudience}

## Research Data:
${research.substring(0, 5000)}${existingSection}

## Instructions:
Create a topic cluster with:
1. ONE pillar article (broad, comprehensive, 2500-4000 word target) that covers the main topic
2. 10-15 supporting articles (specific long-tail keywords, 1200-2000 word target each)

## Rules:
- All keywords must be specific to ${website.brandName}'s niche: ${website.niche}
- Pillar keyword should be broad with high search volume potential
- Supporting keywords should be specific long-tail (3-6 words)
- Each keyword must be unique and target a distinct angle
- Include a mix of search intents: informational, transactional, commercial
- Do NOT duplicate any existing keywords listed above
- Each keyword gets a brief description of what the article should cover

Return valid JSON only:
{
  "pillarTitle": "The pillar cluster theme name",
  "description": "Brief description of the cluster theme (1-2 sentences)",
  "keywords": [
    {
      "keyword": "exact keyword to target",
      "role": "pillar",
      "searchIntent": "informational",
      "suggestedWordCount": 3000,
      "description": "What this article should cover in 1-2 sentences"
    },
    {
      "keyword": "long tail supporting keyword",
      "role": "supporting",
      "searchIntent": "informational",
      "suggestedWordCount": 1500,
      "description": "What this article should cover"
    }
  ]
}`,
    `You are an expert SEO content strategist for ${website.brandName}. Return valid JSON only.`,
  );

  // Ensure exactly one pillar
  if (result.keywords?.length > 0) {
    const pillarCount = result.keywords.filter(k => k.role === "pillar").length;
    if (pillarCount !== 1) {
      result.keywords[0].role = "pillar";
      for (let i = 1; i < result.keywords.length; i++) {
        result.keywords[i].role = "supporting";
      }
    }
  }

  return result;
}
