import { generateWithContinuation } from "./continuation";
import type { WebsiteContext } from "./types";
import { countWords, deduplicateContent, isCutOff, findMissingSections } from "./helpers";

function truncateAtSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(".\n"), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return lastSentenceEnd > maxChars * 0.5 ? cut.slice(0, lastSentenceEnd + 1) : cut;
}

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
    includeProTips: boolean;
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

  const currentYear = new Date().getFullYear();

  const draftResult = await generateWithContinuation(
    `Write a complete blog post about "${keyword}" for ${ctx.brandName}. Target length: ${opts.targetWords} words. Be concise and value-dense. Every paragraph should earn its place.
IMPORTANT: The current year is ${currentYear}. All year references in the content must use ${currentYear}, not ${currentYear - 1}.

Title: ${outline.title}
Unique angle: ${outline.uniqueAngle}
${brandContext}

Outline to follow (${cappedFullOutline.length} sections — you MUST write ALL of them):
${cappedFullOutline.map((s) => `## ${s.heading}\n${s.points.map((p) => `- ${p}`).join("\n")}`).join("\n\n")}

## Content Gaps to Fill (what competitors miss — cover these thoroughly)
${opts.research.contentGaps.slice(0, 5).map((g, i) => `${i + 1}. ${g}`).join("\n")}
${opts.research.missingSubtopics?.length ? "\nMissing subtopics that will make this article stand out:\n" + opts.research.missingSubtopics.slice(0, 3).map((s) => `- ${s}`).join("\n") : ""}

## Research Data
${truncateAtSentence(opts.research.rawResearch, 3500)}

## Writing Guidelines:

**HOOK (most important rule):**
Your opening MUST be unique. Use this specific hook style: ${(() => {
  const hookStyles = [
    { style: "CONTRARIAN", instruction: `Write a 2-3 sentence opening that challenges a common assumption about "${keyword}". Begin with a COMPLETE sentence that names the misconception and immediately refutes it with a specific, surprising claim. NEVER start with just a number, statistic, or fragment — the first word must be a real subject (a noun or pronoun), not a digit.` },
    { style: "DATA-LEAD", instruction: `Open with a statistic woven into a COMPLETE sentence — never start with a bare number. Example structure: "Non-surgical body contouring procedures [grew/declined/changed] by [X]% in [year], according to [source] — and the reason has nothing to do with marketing." ${opts.research.keyStatistics[0] ? `Use this real data point naturally in the sentence: "${opts.research.keyStatistics[0]}"` : "Pull a compelling number from the research and embed it in a full sentence."} CRITICAL: The first word must NOT be a digit or percentage. Start with the subject of the sentence.` },
    { style: "QUESTION-CHAIN", instruction: `Write a 2-3 sentence opening that poses one sharp, specific question that ${ctx.targetAudience} are actually struggling with right now — then immediately pivot to why the answer matters. Make the question specific to the real problem, not generic. The first sentence must be the question, followed by the setup for the article's answer.` },
    { style: "CASE-STUDY-OPEN", instruction: `Write a 2-sentence opening based on a real, named result from the research data. Structure: "[Specific person/company/clinic] [achieved specific measurable outcome] by [specific action]. Most ${ctx.targetAudience} do the exact opposite — and pay for it." Both sentences must be grammatically complete. Do NOT start with a fragment.` },
    { style: "MYTH-BUSTER", instruction: `Open with 2 complete sentences that name and immediately bust the biggest misconception about "${keyword}" in the ${ctx.niche} space. First sentence: state the myth as fact (what most people believe). Second sentence: contradict it directly with evidence${opts.research.keyStatistics[1] ? ` — use this data: "${opts.research.keyStatistics[1]}"` : ""}. NEVER start with just a number or fragment.` },
    { style: "COST-OF-INACTION", instruction: `Write a 2-sentence opening that names what poor or no action on "${keyword}" actually costs ${ctx.targetAudience} — in specific dollars, hours, customers, or missed outcomes. First sentence states the cost concretely. Second sentence frames why the article solves it. Both must be grammatically complete sentences starting with a subject, not a number.` },
    { style: "PREDICTION", instruction: `Open with a 2-sentence forward-looking statement about where "${keyword}" is heading in 2026 and what that means for ${ctx.targetAudience}. First sentence: a specific, research-backed prediction. Second sentence: the practical implication. NEVER start with a number or fragment — begin with a real subject.` },
    { style: "DIRECT-ADDRESS", instruction: `Open with 2 complete sentences that directly address the reader's specific struggle with "${keyword}". First sentence: name the exact wrong approach most ${ctx.targetAudience} take. Second sentence: state what they should be doing instead${opts.research.contentGaps[0] ? `, referencing this gap: "${opts.research.contentGaps[0]}"` : ""}. NEVER start with a fragment or a number.` },
  ];
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) hash = ((hash << 5) - hash + keyword.charCodeAt(i)) | 0;
  const picked = hookStyles[Math.abs(hash) % hookStyles.length];
  return `**${picked.style}**\n${picked.instruction}`;
})()}

BANNED OPENING PATTERNS (never use these):
- Starting the article with a bare number, percentage, or statistic fragment like "25%." or "47." or "$3,000." — ALWAYS embed numbers in a complete sentence.
- "It is [time] on a [day]. You are [doing something]..." — this is the most cliché AI opening. NEVER use it.
- "Picture this..." or "Imagine this..."
- "In today's [anything]..."
- "You're sitting at your desk..." or any "You are..." second-person scene-setting
- Starting with a time of day or day of the week
- Generic scene descriptions where someone is frustrated at a computer
- Abbreviations or acronyms as the first word (e.g. "ASAPS states..." or "U.S. data shows...")

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
${opts.includeFAQ ? `- FAQ section at the END with 4-5 questions. STRICT FORMAT — the ### question heading MUST come BEFORE its answer every single time. NEVER write an answer without the ### heading above it:

## Frequently Asked Questions
### First question written exactly as a user would search it?
Answer in 2-3 complete sentences.

### Second question written exactly as a user would search it?
Answer in 2-3 complete sentences.

### Third question written exactly as a user would search it?
Answer in 2-3 complete sentences.

CRITICAL: The pattern is ALWAYS: ### Question? → Answer. NEVER write an answer before its ### question heading. NEVER skip the ### heading for any entry.` : ""}
- Do NOT add a "Conclusion", "Final Thoughts", "Wrapping Up" or similar ending section. End the article naturally after covering all content.${ctx.ctaText ? ` Weave the CTA naturally into the last content section.` : ""}

**Content personality for THIS article:**
${(() => {
  const personalities = [
    "Write like a practitioner sharing notes from the field. Heavy on 'here's what I actually did' and 'here's what happened.' Minimal theory, maximum real-world tactics.",
    "Write like an investigative journalist who uncovered something most people missed. Cite specific data, name real tools/companies, and connect dots the reader hasn't considered.",
    "Write like a mentor who's seen others make expensive mistakes. Be direct, slightly blunt. 'Stop doing X. Start doing Y. Here's why.' Practical above all.",
    "Write like a strategist briefing a CEO. Every paragraph should answer 'so what?' or 'what do I do with this?' Include frameworks, decision criteria, and trade-offs.",
    `Write like a technical expert simplifying complex ideas. Use analogies specific to ${ctx.targetAudience}. Break down the 'how' behind the 'what.'`,
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
${ctx.targetLocation && keyword.toLowerCase().includes(ctx.targetLocation.toLowerCase())
  ? "- LOCATION RULE (critical for SEO): The keyword includes a specific location (\"" + ctx.targetLocation + "\"). You MUST use BOTH the core topic AND the exact location name \"" + ctx.targetLocation + "\" together in: (1) the first 2 sentences of the intro, and (2) at least one H2 heading. Do NOT substitute \"" + ctx.targetLocation + "\" with a broader area name — use the EXACT location name."
  : ""}
- Write from an EXPERT perspective using the personality above. Vary your expert voice phrases: "In my testing," "I've found," "From my experience," "What I noticed," "After running this for 6 months," "The data surprised me," "Here's what nobody mentions"
${opts.includeProTips ? '- EXPERT CALLOUTS: use at most 2 total "Pro Tip:" callouts in the ENTIRE article. Make them count — share something non-obvious that only someone with real experience would know. DO NOT add a "Pro Tip" in every section.' : '- Do NOT include any "Pro Tip:" callout boxes in the article. Share expert insights naturally within the prose instead.'}
- Vary paragraph lengths naturally throughout the article. Mix short punchy paragraphs (2-3 sentences) with medium ones (4-5 sentences) and occasionally longer detailed ones (5-6 sentences). NEVER write paragraphs of the same length back-to-back. The rhythm should feel natural, not uniform.
- Use active voice, concrete examples, and specific numbers. Clear language that provides genuine value.
- Do NOT use horizontal rules (---, ***, ___) anywhere in the article. Sections are separated by headings, not divider lines.
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
IMPORTANT: The current year is ${currentYear}. All year references MUST use ${currentYear}, not ${currentYear - 1}.
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
IMPORTANT: The current year is ${currentYear}. All year references MUST use ${currentYear}, not ${currentYear - 1}.

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

Write 4-5 frequently asked questions with detailed, specific answers (2-3 sentences each).

STRICT FORMAT — you MUST write the ### question heading BEFORE its answer every time.
NEVER write an answer without its question. NEVER write a paragraph before the first ### heading.
The ONLY correct pattern is: ### Question? followed immediately by its answer.

Example of the EXACT format required:
## Frequently Asked Questions
### How long does the process take?
Answer to question 1 in 2-3 complete sentences. Be specific and practical.

### What documents do I need?
Answer to question 2 in 2-3 complete sentences.

### Can I sell a car that still has a loan?
Answer to question 3 in 2-3 complete sentences.

### What affects the offer price?
Answer to question 4 in 2-3 complete sentences.

CRITICAL: ### heading FIRST, then answer. Every single time. Zero exceptions.
Output ONLY the FAQ section in Markdown. Start with ## Frequently Asked Questions.`,
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

    if (stitchedWords >= Math.max(200, opts.minExpectedWords * 0.5)) {
      cleanDraft = stitchedDraft;
      draftWords = stitchedWords;
      draftTruncated = false;
    }
  }

  return { content: cleanDraft, words: draftWords, truncated: draftTruncated, contentSections };
}
