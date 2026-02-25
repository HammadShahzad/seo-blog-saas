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
  const cappedLinks = consolidatedLinks.slice(0, 25);
  let internalLinkBlock = "";
  if (cappedLinks.length) {
    internalLinkBlock = "\n\n## Internal Links (use each URL AT MOST ONCE):\n" +
      cappedLinks.map((l) => `   - "${l.anchor}" → ${l.url}`).join("\n");
  }
  console.log(`[content-gen] Internal links available for SEO step: ${consolidatedLinks.length} (from internalLinks: ${ctx.internalLinks?.length ?? 0}, existingPosts: ${ctx.existingPosts?.length ?? 0})`);

  const toneWords = countWords(toneContent);
  const seoRewriteTokens = Math.max(16384, Math.ceil(toneWords * 1.4 * 1.5));

  const locationRule = (ctx.targetLocation && keyword.toLowerCase().includes(ctx.targetLocation.toLowerCase()))
    ? [
        "   LOCATION KEYWORD RULE: The keyword contains a specific city/location (\"" + ctx.targetLocation + "\"). VERIFY that:",
        "   a) The exact location name \"" + ctx.targetLocation + "\" appears in the intro paragraph (first 100 words) — NOT replaced by a broader area name.",
        "   b) At least one H2 heading contains BOTH a core topic term AND the exact location \"" + ctx.targetLocation + "\".",
        "   If either is missing, rewrite the intro's first paragraph and the most relevant H2 heading to include them.",
      ].join("\n")
    : "";

  const seoResult = await generateWithContinuation(
    `You are an SEO expert. Optimize the following blog post for the keyword "${keyword}" while retaining the same writing style and tone.

## Rules:
1. Use the exact keyword "${keyword}" in the first 100 words, at least one H2 heading, and the final content section (NOT in a "Conclusion" heading — there should be no conclusion heading)
${locationRule}
2. Naturally weave the primary keyword throughout (aim for 1-2% density — not stuffed, but present)
3. Add related/LSI keywords naturally (synonyms, related terms people search for)
4. Ensure proper heading hierarchy (H2, H3) — no heading level skips
${consolidatedLinks.length > 0 ? `5. Add internal links from the list below. ONLY use URLs from this exact list — do NOT invent or create any URLs that are not listed here.${internalLinkBlock}
   RULES FOR INTERNAL LINKS:
   - ONLY use URLs from the list above. If a URL is not in the list, do NOT use it.
   - Do NOT hallucinate, guess, or create any URLs. Every link must match an entry above EXACTLY, character for character.
   - NEVER write partial URLs like "com/path/" — always use the FULL URL starting with https://.
   - Use AS MANY links from the list as possible, aim for at least ${Math.min(cappedLinks.length, 15)} internal links total.
   - Each URL may appear up to 2 times if needed (with different anchor text in different contexts).
   - Spread links throughout ALL sections — every H2 section should contain at least 1-2 internal links where relevant.
   - Use descriptive anchor text that matches the context.
   - Use REAL markdown links only: [anchor text](url).` : `5. Do NOT add any internal links. There are no published posts to link to yet. Do NOT invent or hallucinate any URLs.`}
6. Make sure the intro paragraph contains the keyword naturally
${opts.includeFAQ ? `7. Ensure the FAQ section exists at the end. CRITICAL FORMAT — every answer MUST be directly preceded by its ### question heading. The only valid pattern is:
   ### Question?
   Answer.
   ### Next Question?
   Answer.
   NEVER write an answer without a ### question heading immediately above it. NEVER write any text between the ## FAQ heading and the first ### question. If any answer is missing its question, ADD the question as a ### heading before it.` : "7. Skip FAQ if not present"}
8. Vary paragraph lengths naturally: mix short punchy paragraphs (2-3 sentences) with medium ones (4-5 sentences) and occasionally longer detailed ones (5-6 sentences). NEVER have consecutive paragraphs of the same length. The rhythm should feel like natural human writing, not a uniform wall of text.
9. KEYWORD DENSITY RULES:
   - Use the exact primary keyword "${keyword}" only 3-5 times in the ENTIRE article (intro, one H2, final section, and 1-2 body mentions). NO MORE.
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
17. EXTERNAL REFERENCE LINKS: Add 1-2 external reference links to high-authority, non-competitor websites that support claims or data in the article. Use sources like:
   - Government sites (.gov)
   - News outlets (Reuters, BBC, Forbes, Bloomberg, etc.)
   - Educational institutions (.edu)
   - Wikipedia
   - Industry associations and standards bodies
   - Research organizations and journals
   RULES: The linked site MUST be directly relevant to the content it supports. NEVER link to competitors of ${ctx.brandName}. Use real, well-known domains only. Format as standard markdown links: [descriptive anchor text](https://example.gov/page).
18. HORIZONTAL RULES: Remove ALL horizontal rules (---, ***, ___) from the content. Sections should be separated by headings only, never by divider lines.

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
