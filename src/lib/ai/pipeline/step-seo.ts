import { generateWithContinuation } from "./continuation";
import type { WebsiteContext } from "./types";
import { countWords, deduplicateContent, isCutOff, findMissingSections } from "./helpers";

interface ConsolidatedLink {
  anchor: string;
  url: string;
}

export function buildConsolidatedLinks(ctx: WebsiteContext): ConsolidatedLink[] {
  const seenUrls = new Set<string>();
  const links: ConsolidatedLink[] = [];
  if (ctx.internalLinks?.length) {
    for (const l of ctx.internalLinks) {
      if (!seenUrls.has(l.url)) { seenUrls.add(l.url); links.push({ anchor: l.keyword, url: l.url }); }
    }
  }
  if (ctx.existingPosts?.length) {
    for (const p of ctx.existingPosts) {
      if (!seenUrls.has(p.url)) { seenUrls.add(p.url); links.push({ anchor: p.focusKeyword || p.title, url: p.url }); }
    }
  }
  return links;
}

interface SeoResult {
  content: string;
  words: number;
  missing: number;
  cutoff: boolean;
}

export async function runSeoOptimization(
  keyword: string,
  ctx: WebsiteContext,
  toneContent: string,
  contentSections: { heading: string }[],
  consolidatedLinks: ConsolidatedLink[],
  systemPrompt: string,
  opts: {
    targetWords: string;
    includeFAQ: boolean;
  }
): Promise<SeoResult> {
  let internalLinkBlock = "";
  if (consolidatedLinks.length) {
    internalLinkBlock = "\n\n## Internal Links (use each URL AT MOST ONCE — no duplicate links):\n" +
      consolidatedLinks.map((l) => `   - "${l.anchor}" → ${l.url}`).join("\n");
  }
  console.log(`[content-gen] Internal links available for SEO step: ${consolidatedLinks.length} (from internalLinks: ${ctx.internalLinks?.length ?? 0}, existingPosts: ${ctx.existingPosts?.length ?? 0})`);

  const toneWords = countWords(toneContent);
  const seoRewriteTokens = Math.max(16384, Math.ceil(toneWords * 1.4 * 1.5));

  const seoResult = await generateWithContinuation(
    `You are an SEO expert. Optimize the following blog post for the keyword "${keyword}" while retaining the same writing style and tone.

## Rules:
1. Use the exact keyword "${keyword}" in the first 100 words, at least one H2 heading, and the conclusion
2. Naturally weave the primary keyword throughout (aim for 1-2% density — not stuffed, but present)
3. Add related/LSI keywords naturally (synonyms, related terms people search for)
4. Ensure proper heading hierarchy (H2, H3) — no heading level skips
${consolidatedLinks.length > 0 ? `5. Add internal links from the list below. ONLY use URLs from this exact list — do NOT invent or create any URLs that are not listed here.${internalLinkBlock}
   RULES FOR INTERNAL LINKS:
   - ONLY use URLs from the list above. If a URL is not in the list, do NOT use it.
   - Do NOT hallucinate, guess, or create any URLs. Every link must match an entry above EXACTLY, character for character.
   - NEVER write partial URLs like "com/path/" — always use the FULL URL starting with https://.
   - Use AS MANY links from the list as possible — aim for at least ${Math.min(consolidatedLinks.length, 15)} internal links total. More internal links = better SEO.
   - Each URL may appear up to 2 times if needed (with different anchor text in different contexts).
   - Spread links throughout ALL sections — every H2 section should contain at least 1-2 internal links where relevant.
   - Use descriptive anchor text that matches the context.
   - Use REAL markdown links only: [anchor text](url).` : `5. Do NOT add any internal links. There are no published posts to link to yet. Do NOT invent or hallucinate any URLs.`}
6. Make sure the intro paragraph contains the keyword naturally
${opts.includeFAQ ? `7. Ensure there's a FAQ section at the end with 4-5 common questions (format as proper ## FAQ heading with ### for each question — this helps with Google's FAQ rich snippets)` : "7. Skip FAQ if not present"}
8. Paragraphs should be 3-5 sentences each, developing a complete thought. No single-sentence paragraphs, no walls of text.
9. KEYWORD DENSITY RULES:
   - Use the exact primary keyword "${keyword}" only 3-5 times in the ENTIRE article (intro, one H2, conclusion, and 1-2 body mentions). NO MORE.
   - Use VARIATIONS and LSI keywords instead of repeating the exact phrase. Examples: synonyms, related terms, long-tail variations.
   - NEVER use the exact keyword in consecutive paragraphs
   - H2 headings should use keyword VARIATIONS, not the exact keyword repeatedly
10. Preserve the humor and conversational tone, do not make it robotic
11a. REMOVE any remaining AI phrases: "delve," "dive deep," "game-changer," "leverage," "utilize," "tapestry," "realm," "robust," "cutting-edge," "embark," "navigate the complexities," "unlock the power"
11b. REMOVE all em-dash characters (—) and replace with commas or periods
11c. BRAND MENTIONS: ${ctx.brandName} should appear NO MORE THAN 2-3 times total. If it appears more, remove the extras. Never mention the brand in consecutive sections.
11d. FIRST-PERSON LIMIT: Use "I" or "my" phrases (e.g. "I've found", "From my experience") MAX 3-4 times total, each with DIFFERENT phrasing. Demonstrate expertise through data, process details, and specific technical knowledge instead.
11e. TONE: Do NOT use fear-based or aggressive language toward competitors. Replace "terrifying," "dangerous," "scare tactic" with factual, standards-based language. Elevate your approach rather than attacking alternatives.
12. If there's a table of contents, ensure it matches the actual headings
13. Keep the article length within the ${opts.targetWords} word range. Do not pad or inflate.
14. READABILITY: Include bullet lists or numbered lists where they genuinely help. Use bold text for key terms. Add blockquotes for expert tips.
15. ENDING: Do NOT add "Final Thoughts", "Conclusion", "Wrapping Up" or any concluding section heading. The article should end naturally.
16. ENTITIES: Ensure related entities (tools, standards, organizations, people, places) are naturally present for semantic richness.

## Blog Post (${toneWords} words):
${toneContent}

Output ONLY the optimized blog post in Markdown format.
CRITICAL: Output the COMPLETE article with all sections. Do NOT stop early or drop sections. Tighten prose where possible.
CRITICAL: Do NOT repeat the article. Output it exactly ONCE. If you reach the end, STOP.`,
    systemPrompt,
    { temperature: 0.4, maxTokens: seoRewriteTokens },
    "seo-optimize",
    5,
    Math.floor(toneWords * 0.75)
  );

  const cleanSeo = deduplicateContent(seoResult.text);
  const seoWords = countWords(cleanSeo);
  const seoMissing = findMissingSections(cleanSeo, contentSections);
  const seoShrank = seoWords < toneWords * 0.75;
  const seoCutOff = isCutOff(cleanSeo) || seoShrank;
  if (seoShrank) {
    console.warn(`[content-gen] SEO rewrite shrank significantly: ${seoWords} words vs ${toneWords} input — treating as cut off`);
  }
  console.log(`[content-gen] SEO optimize: ${seoWords} words, missing=${seoMissing.length}, cutoff=${seoCutOff}`);

  return { content: cleanSeo, words: seoWords, missing: seoMissing.length, cutoff: seoCutOff };
}
