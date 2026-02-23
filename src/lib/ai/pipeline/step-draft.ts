import { generateWithContinuation } from "./continuation";
import type { WebsiteContext } from "./types";
import { countWords, deduplicateContent, isCutOff, findMissingSections } from "./helpers";

interface DraftResult {
  content: string;
  words: number;
  truncated: boolean;
  contentSections: { heading: string; points: string[] }[];
}

export async function generateDraft(
  keyword: string,
  ctx: WebsiteContext,
  outline: { title: string; sections: { heading: string; points: string[] }[]; uniqueAngle: string },
  contentSections: { heading: string; points: string[] }[],
  systemPrompt: string,
  opts: {
    targetWords: string;
    draftTokens: number;
    minExpectedWords: number;
    contentLength: string;
    includeTableOfContents: boolean;
    includeFAQ: boolean;
    isComparisonArticle: boolean;
    customDirection?: string;
    research: { contentGaps: string[]; missingSubtopics?: string[]; keyStatistics: string[]; rawResearch: string };
    onProgress?: (step: string, message: string) => Promise<void>;
  }
): Promise<DraftResult> {
  const nonContentSections = outline.sections.filter(s =>
    /^(key takeaways?|table of contents|faq|frequently asked|conclusion)/i.test(s.heading)
  );
  const cappedFullOutline = [...contentSections, ...nonContentSections];

  const brandContext = [
    ctx.targetLocation ? `Geographic context: Write for a ${ctx.targetLocation} audience — use relevant pricing, tools, and examples.` : "",
    ctx.uniqueValueProp ? `Brand USP to highlight: "${ctx.uniqueValueProp}" — weave this into the conclusion and any tool/solution recommendations.` : "",
    ctx.keyProducts?.length ? `Products/features to mention naturally where relevant: ${ctx.keyProducts.join(", ")}` : "",
    ctx.competitors?.length ? `Context: ${ctx.brandName} competes with ${ctx.competitors.join(", ")} — don't mention competitors by name, but make ${ctx.brandName}'s approach clearly superior through specific examples.` : "",
  ].filter(Boolean).join("\n");

  const draftResult = await generateWithContinuation(
    `Write a complete blog post about "${keyword}" for ${ctx.brandName}. Target length: ${opts.targetWords} words. Be concise and value-dense. Every paragraph should earn its place.

Title: ${outline.title}
Unique angle: ${outline.uniqueAngle}
${brandContext}

Outline to follow (${cappedFullOutline.length} sections — you MUST write ALL of them):
${cappedFullOutline.map((s) => `## ${s.heading}\n${s.points.map((p) => `- ${p}`).join("\n")}`).join("\n\n")}

## Content Gaps to Fill (what competitors miss — cover these thoroughly)
${opts.research.contentGaps.slice(0, 5).map((g, i) => `${i + 1}. ${g}`).join("\n")}
${opts.research.missingSubtopics?.length ? "\nMissing subtopics that will make this article stand out:\n" + opts.research.missingSubtopics.slice(0, 3).map((s) => `- ${s}`).join("\n") : ""}

## Research Data
${opts.research.rawResearch.substring(0, 3500)}

## Writing Guidelines:

**HOOK (most important rule):**
Your opening MUST be unique. Use this specific hook style: ${(() => {
  const hookStyles = [
    { style: "CONTRARIAN", instruction: `Open with a bold, contrarian statement that challenges conventional wisdom about "${keyword}". State something surprising that makes the reader think 'Wait, really?' Do NOT use "Most advice about X is wrong." Be original. Make a specific, testable claim.` },
    { style: "DATA-LEAD", instruction: `Open with a specific number or statistic. ${opts.research.keyStatistics[0] ? `Use this real data: "${opts.research.keyStatistics[0]}"` : "Pull a compelling number from the research below."} Frame it as: "[Number]. That's [what it means]. Here's why that matters to you."` },
    { style: "QUESTION-CHAIN", instruction: `Open with 3 increasingly specific questions about "${keyword}" that ${ctx.targetAudience} are asking right now. Make the third question surprisingly specific. Then answer with: "The answer to all three is the same."` },
    { style: "CASE-STUDY-OPEN", instruction: `Open with a real 2-sentence result. Name a real company, tool, or person from the research data. "[Name] achieved [specific measurable result] by [specific action]. Most ${ctx.targetAudience} do the exact opposite."` },
    { style: "MYTH-BUSTER", instruction: `Name the single biggest misconception about "${keyword}" in the ${ctx.niche} space. State it as fact, then immediately contradict it with evidence. "Everyone tells you [myth]. ${opts.research.keyStatistics[1] ? `The data says otherwise: ${opts.research.keyStatistics[1]}` : "The data tells a completely different story."}"` },
    { style: "COST-OF-INACTION", instruction: `Open with what "${keyword}" done wrong actually costs. Be specific: dollars, hours, lost customers, or missed opportunities. "${ctx.targetAudience} who ignore [aspect of ${keyword}] lose [specific amount] per [time period]. Here's the math."` },
    { style: "PREDICTION", instruction: `Open with a forward-looking prediction about "${keyword}" that's backed by research. "By [timeframe], [specific change will happen]. The ${ctx.targetAudience} who prepare now will [benefit]. The rest will [consequence]."` },
    { style: "DIRECT-ADDRESS", instruction: `Open by directly telling the reader what they're doing wrong, with zero preamble. "You're spending too much time on [wrong thing] and not enough on [right thing]. ${opts.research.contentGaps[0] ? `And the biggest gap? ${opts.research.contentGaps[0]}` : "Here's proof."}"` },
  ];
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) hash = ((hash << 5) - hash + keyword.charCodeAt(i)) | 0;
  const picked = hookStyles[Math.abs(hash) % hookStyles.length];
  return `**${picked.style}**\n${picked.instruction}`;
})()}

BANNED OPENING PATTERNS (never use these):
- "It is [time] on a [day]. You are [doing something]..." — this is the most cliché AI opening. NEVER use it.
- "Picture this..." or "Imagine this..."
- "In today's [anything]..."
- "You're sitting at your desk..." or any "You are..." second-person scene-setting
- Starting with a time of day or day of the week
- Generic scene descriptions where someone is frustrated at a computer

**Structure:**
${opts.customDirection ? `- CUSTOM DIRECTION FROM USER: "${opts.customDirection}" — use this to guide how the blog opens and the overall direction/angle of the content.` : ""}
- Open with a HOOK that goes directly into providing value. Do NOT announce what the article covers.
- Key Takeaways / Quick Summary box (bulleted, 4-5 points)
${opts.includeTableOfContents ? `- Table of Contents with CLICKABLE anchor links. Use this EXACT format:
## Table of Contents
- [First Section Heading](#first-section-heading)
- [Second Section Heading](#second-section-heading)
Each entry MUST be a markdown link with the heading text as anchor text and a #slug as the URL. The slug is the heading in lowercase with spaces replaced by hyphens and special characters removed.` : "- Do NOT include a Table of Contents"}
- Main sections following the outline
${opts.isComparisonArticle ? `- Include a markdown comparison table where it makes sense (usually early in the article).` : ""}
${opts.includeFAQ ? "- FAQ section (4-5 questions with detailed answers)" : ""}
- Do NOT add a "Conclusion", "Final Thoughts", "Wrapping Up" or similar ending section. End the article naturally after covering all content.${ctx.ctaText ? ` Weave the CTA naturally into the last content section.` : ""}

**Content personality for THIS article:**
${(() => {
  const personalities = [
    "Write like a practitioner sharing notes from the field. Heavy on 'here's what I actually did' and 'here's what happened.' Minimal theory, maximum real-world tactics.",
    "Write like an investigative journalist who uncovered something most people missed. Cite specific data, name real tools/companies, and connect dots the reader hasn't considered.",
    "Write like a mentor who's seen others make expensive mistakes. Be direct, slightly blunt. 'Stop doing X. Start doing Y. Here's why.' Practical above all.",
    "Write like a strategist briefing a CEO. Every paragraph should answer 'so what?' or 'what do I do with this?' Include frameworks, decision criteria, and trade-offs.",
    "Write like a technical expert simplifying complex ideas. Use analogies specific to ${ctx.targetAudience}. Break down the 'how' behind the 'what.'",
    "Write like someone who just ran an experiment and is sharing the results. Include specific before/after numbers, what surprised you, and what you'd do differently.",
  ];
  let h = 0;
  for (let i = 0; i < keyword.length; i++) h = ((h << 7) - h + keyword.charCodeAt(i)) | 0;
  return personalities[Math.abs(h) % personalities.length];
})()}

**Content rules:**
- Write ${opts.targetWords} words. Stay within the target range. Be concise, not padded.
- Every section must have a DIFFERENT internal structure: mix of prose, bullet lists, numbered steps, comparison tables (only where genuinely useful), code snippets (if relevant), or callout boxes
- Include real statistics and data from the research with context
- Include related entities naturally (tools, standards, organizations, people, places relevant to the topic) to build semantic richness
- Use the keyword "${keyword}" naturally — in first 100 words, one H2, and in the final section
- Write from an EXPERT perspective using the personality above. Vary your expert voice phrases: "In my testing," "I've found," "From my experience," "What I noticed," "After running this for 6 months," "The data surprised me," "Here's what nobody mentions"
- EXPERT CALLOUTS: use at most 2 total "Pro Tip:" callouts in the ENTIRE article. Make them count — share something non-obvious that only someone with real experience would know. DO NOT add a "Pro Tip" in every section.
- Write focused paragraphs of 3-5 sentences. Each paragraph should develop a complete thought without padding.
- Use active voice, concrete examples, and specific numbers. Clear language that provides genuine value.
- Zero grammar mistakes. Write clean, polished prose.
- NEVER use: "delve," "dive deep," "game-changer," "leverage," "utilize," "tapestry," "landscape" (metaphorical), "realm," "robust," "cutting-edge," "embark on a journey," "navigating the complexities," "unlock the power"
- NEVER use em-dash (—). Use commas or periods instead.
- NEVER start the opening with "In this article we will..." or "In this guide..." or any announcement of what the article covers.
- NEVER end with "Final Thoughts", "Conclusion", "In Closing", "Wrapping Up" or similar. End naturally.
- Write in Markdown format

Output ONLY the blog post content in Markdown. Do not include the title as an H1 — start with the hook paragraph.
CRITICAL: Write the COMPLETE article with ALL sections from the outline. Do NOT stop after the Table of Contents.`,
    systemPrompt,
    { temperature: 0.8, maxTokens: opts.draftTokens },
    "draft",
    5,
    opts.minExpectedWords
  );

  let cleanDraft = deduplicateContent(draftResult.text);
  let draftWords = countWords(cleanDraft);
  console.log(`[content-gen] Draft attempt 1: ${draftWords} words (min: ${opts.minExpectedWords}), finishReason: ${draftResult.finishReason}`);

  const missingSections = findMissingSections(cleanDraft, contentSections);
  let draftTruncated = draftResult.truncated;
  const draftCutOff = isCutOff(cleanDraft);
  const needsRetry = draftWords < opts.minExpectedWords || missingSections.length >= 2 || draftTruncated || draftCutOff;

  if (needsRetry) {
    console.warn(`[content-gen] Draft incomplete: ${draftWords} words, ${missingSections.length} missing sections, truncated=${draftTruncated}, cutoff=${draftCutOff}`);
    if (missingSections.length > 0) console.warn(`[content-gen] Missing: ${missingSections.join(", ")}`);
    if (opts.onProgress) await opts.onProgress("draft", "Draft was incomplete, rebuilding section by section...");

    const sectionParts: string[] = [];
    const wordsPerSection = Math.ceil(parseInt(opts.targetWords.split("-")[1] || "2000") / contentSections.length);

    const introResult = await generateWithContinuation(
      `Write the opening for a blog post about "${keyword}" for ${ctx.brandName}.
${brandContext}

Include:
1. A compelling 2-3 paragraph HOOK. NEVER start with "It is [time] on a [day]" or scene-setting. Instead open with: a shocking statistic, a contrarian claim, a rapid-fire question, or a 2-sentence case study result
2. A "Key Takeaways" section with 4-5 bullet points summarizing the article
${opts.includeTableOfContents ? `3. A Table of Contents with CLICKABLE anchor links using this format:\n${contentSections.map(s => {
  const slug = s.heading.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  return `- [${s.heading}](#${slug})`;
}).join("\n")}` : ""}

Write from an expert perspective. Use active voice. Do NOT use em-dashes.
Do NOT write any of the main sections yet. STOP after the Table of Contents.
Output only Markdown.`,
      systemPrompt,
      { temperature: 0.8, maxTokens: 3072 },
      "intro-section",
      5,
      150
    );
    sectionParts.push(introResult.text.trim());
    console.log(`[content-gen] Intro: ${countWords(introResult.text)} words`);

    for (let i = 0; i < contentSections.length; i++) {
      const section = contentSections[i];
      const isLast = i === contentSections.length - 1;
      const sectionResult = await generateWithContinuation(
        `Write section ${i + 1} of a blog post about "${keyword}" for ${ctx.brandName}.

## ${section.heading}
Points to cover:
${section.points.map(p => `- ${p}`).join("\n")}

Context: This is a ${ctx.niche} article for ${ctx.targetAudience}.
${brandContext}

Rules:
- Write roughly ${wordsPerSection} words for this section. Be concise.
- Start with the H2 heading: ## ${section.heading}
- Use a mix of prose, bullet lists, and data
- Write from expert perspective with first-person insights
- Keep paragraphs under 60 words (2-3 sentences max)
- Do NOT use em-dashes, "delve," "dive deep," "game-changer," "leverage," "utilize"
${isLast ? `- End with a strong conclusion paragraph and CTA for ${ctx.brandName}${ctx.ctaText ? `: "${ctx.ctaText}"` : ""}${ctx.ctaUrl ? ` (${ctx.ctaUrl})` : ""}` : ""}
${opts.isComparisonArticle && i === 0 ? "- Include a markdown comparison table in this section" : ""}

Output ONLY this section in Markdown. Start with ## ${section.heading}`,
        systemPrompt,
        { temperature: 0.8, maxTokens: 4096 },
        `section-${i + 1}`,
        5,
        Math.floor(wordsPerSection * 0.75)
      );
      sectionParts.push(sectionResult.text.trim());
      console.log(`[content-gen] Section ${i + 1} "${section.heading}": ${countWords(sectionResult.text)} words`);
    }

    if (opts.includeFAQ) {
      const faqResult = await generateWithContinuation(
        `Write a FAQ section for a blog post about "${keyword}" for ${ctx.brandName}.

Write 4-5 frequently asked questions with detailed answers (2-3 sentences each).
Format as:
## Frequently Asked Questions
### Question here?
Answer here.

Output ONLY the FAQ section in Markdown.`,
        systemPrompt,
        { temperature: 0.7, maxTokens: 2048 },
        "faq-section",
        5,
        200
      );
      sectionParts.push(faqResult.text.trim());
    }

    const stitchedDraft = sectionParts.join("\n\n");
    const stitchedWords = countWords(stitchedDraft);
    console.log(`[content-gen] Section-by-section total: ${stitchedWords} words`);

    if (stitchedWords >= 200) {
      cleanDraft = stitchedDraft;
      draftWords = stitchedWords;
      draftTruncated = false;
    }
  }

  return { content: cleanDraft, words: draftWords, truncated: draftTruncated, contentSections };
}
