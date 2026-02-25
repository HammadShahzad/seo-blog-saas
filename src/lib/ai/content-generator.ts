/**
 * Core AI Blog Generation Pipeline
 * 7-step process: Research -> Outline -> Draft -> Tone -> SEO -> Metadata -> Image
 *
 * Orchestrator module — delegates to pipeline/* for each step.
 */
import { generateJSON, setModelOverride } from "./gemini";
import { researchKeyword } from "./research";
import { generateBlogImage, generateInlineImage, resetPexelsTracking, type ImageSourceType } from "../storage/image-generator";
import { generateWithContinuation } from "./pipeline/continuation";
import { buildSystemPrompt, slugify, countWords, deduplicateContent, isCutOff, findMissingSections } from "./pipeline/helpers";
import { buildConsolidatedLinks, runSeoOptimization } from "./pipeline/step-seo";
import { generateDraft } from "./pipeline/step-draft";
import { postProcess } from "./pipeline/post-process";
import {
  type WebsiteWithSettings,
  type WebsiteContext,
  type GeneratedPost,
  type ProgressCallback,
  STEPS,
  WORD_TARGETS,
  DRAFT_TOKENS,
  MIN_WORDS,
  MAX_CONTENT_SECTIONS,
} from "./pipeline/types";

export type { WebsiteContext, GeneratedPost, GenerationProgress, ProgressCallback } from "./pipeline/types";

function truncateAtSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(".\n"), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return lastSentenceEnd > maxChars * 0.5 ? cut.slice(0, lastSentenceEnd + 1) : cut;
}

export async function generateBlogPost(
  keyword: string,
  website: WebsiteWithSettings,
  contentLength: "SHORT" | "MEDIUM" | "LONG" | "PILLAR" = "MEDIUM",
  options: {
    includeImages?: boolean;
    imageSource?: ImageSourceType;
    includeFAQ?: boolean;
    includeProTips?: boolean;
    includeTableOfContents?: boolean;
    onProgress?: ProgressCallback;
    existingPosts?: { title: string; slug: string; url: string; focusKeyword: string }[];
    internalLinks?: { keyword: string; url: string }[];
    customDirection?: string;
  } = {}
): Promise<GeneratedPost> {
  const { includeImages = true, imageSource = "AI_GENERATED", includeFAQ = true, includeProTips = true, includeTableOfContents = true, onProgress } = options;

  const preferredModel = website.blogSettings?.preferredModel;
  if (preferredModel && preferredModel !== "gemini-3.1-pro-preview") {
    setModelOverride(preferredModel);
  }

  try {
  return await _runPipeline(keyword, website, contentLength, options, { includeImages, imageSource, includeFAQ, includeProTips, includeTableOfContents, onProgress });
  } finally {
    setModelOverride(null);
  }
}

async function _runPipeline(
  keyword: string,
  website: WebsiteWithSettings,
  contentLength: "SHORT" | "MEDIUM" | "LONG" | "PILLAR",
  options: {
    includeImages?: boolean;
    imageSource?: ImageSourceType;
    includeFAQ?: boolean;
    includeProTips?: boolean;
    includeTableOfContents?: boolean;
    onProgress?: ProgressCallback;
    existingPosts?: { title: string; slug: string; url: string; focusKeyword: string }[];
    internalLinks?: { keyword: string; url: string }[];
    customDirection?: string;
  },
  resolved: { includeImages: boolean; imageSource: ImageSourceType; includeFAQ: boolean; includeProTips: boolean; includeTableOfContents: boolean; onProgress?: ProgressCallback }
): Promise<GeneratedPost> {
  const { includeImages, imageSource, includeFAQ, includeProTips, includeTableOfContents, onProgress } = resolved;

  const ctx: WebsiteContext = {
    id: website.id,
    brandName: website.brandName,
    brandUrl: website.brandUrl,
    niche: website.niche,
    targetAudience: website.targetAudience,
    tone: website.tone,
    description: website.description,
    existingPosts: options.existingPosts,
    internalLinks: options.internalLinks,
    ctaText: website.blogSettings?.ctaText ?? undefined,
    ctaUrl: website.blogSettings?.ctaUrl ?? undefined,
    avoidTopics: website.blogSettings?.avoidTopics ?? undefined,
    writingStyle: website.blogSettings?.writingStyle ?? undefined,
    requiredSections: website.blogSettings?.requiredSections?.length ? website.blogSettings.requiredSections : undefined,
    uniqueValueProp: website.uniqueValueProp ?? undefined,
    competitors: website.competitors?.length ? website.competitors : undefined,
    keyProducts: website.keyProducts?.length ? website.keyProducts : undefined,
    targetLocation: website.targetLocation ?? undefined,
  };

  const targetWords = WORD_TARGETS[contentLength] || WORD_TARGETS.MEDIUM;
  const draftTokens = DRAFT_TOKENS[contentLength] || DRAFT_TOKENS.MEDIUM;
  const minExpectedWords = MIN_WORDS[contentLength] || MIN_WORDS.MEDIUM;

  const progress = async (step: string, message: string) => {
    const stepIndex = STEPS.indexOf(step as typeof STEPS[number]);
    if (onProgress) {
      await onProgress({
        step,
        stepIndex,
        totalSteps: STEPS.length,
        message,
        percentage: Math.round(((stepIndex + 1) / STEPS.length) * 100),
      });
    }
  };

  const systemPrompt = buildSystemPrompt(ctx);
  // "best practices", "best time to", "best way to" are NOT comparison articles.
  // Only trigger comparison mode for real comparisons: "X vs Y", "best tools", "top 5 X", "alternatives".
  const isComparisonArticle = /\b(vs\.?|compare|comparison|top \d+|alternatives?|ranking|ranked|versus)\b/i.test(keyword)
    || /\bbest\s+(?!practices?|ways?|time|approach|strategy|strategies|tips?|methods?|advice|guide)\w/i.test(keyword);
  const currentYear = new Date().getFullYear();

  // ─── STEP 1: RESEARCH ───────────────────────────────────────────
  await progress("research", `Researching "${keyword}"...`);
  const research = await researchKeyword(keyword, ctx);

  // ─── STEP 2: OUTLINE ────────────────────────────────────────────
  await progress("outline", "Creating content outline and structure...");
  const outline = await generateJSON<{
    title: string;
    sections: { heading: string; points: string[] }[];
    uniqueAngle: string;
  }>(
    `Create a detailed blog post outline for the keyword: "${keyword}"

## Brand Context
- Brand: ${ctx.brandName} (${ctx.niche})
- Target audience: ${ctx.targetAudience}
- Target word count: ${targetWords} words
${ctx.targetLocation ? `- Geographic focus: ${ctx.targetLocation}` : ""}
${ctx.uniqueValueProp ? `- ${ctx.brandName}'s USP: ${ctx.uniqueValueProp}` : ""}
${ctx.keyProducts?.length ? `- Products/features to reference: ${ctx.keyProducts.join(", ")}` : ""}

## What Competitors Are MISSING (these gaps MUST become dedicated sections or deep sub-points)
${research.contentGaps.length ? research.contentGaps.slice(0, 6).map((g, i) => `${i + 1}. ${g}`).join("\n") : "- Cover more specific, actionable advice than generic guides"}
${research.missingSubtopics?.length ? "\nMissing subtopics no current article covers:\n" + research.missingSubtopics.slice(0, 4).map((s) => `- ${s}`).join("\n") : ""}

## Winning Angle (what makes this article beat everything ranking now)
${research.suggestedAngle || "Take a more specific, practitioner-level perspective than generic overviews"}

## Questions People Ask That Current Articles Ignore
${research.commonQuestions.slice(0, 5).map((q) => `- ${q}`).join("\n")}

## Key Statistics to Use
${research.keyStatistics.slice(0, 4).map((s) => `- ${s}`).join("\n")}

## Research Summary
${truncateAtSentence(research.rawResearch, 3000)}

## Outline Rules
- H1 title: MUST contain the EXACT focus keyword "${keyword}" (or very close variant). SEO-optimized (50-70 chars), reflects the winning angle. If you cannot fit the exact keyword, use as many of its words as possible in the title.
- YEAR IN TITLE: If the title references a year (e.g. "Guide for [year]", "[year] Edition"), it MUST be ${currentYear}. NEVER use ${currentYear - 1}. The current year is ${currentYear}.
- STRICT section count based on target word count (${targetWords} words):
  ${contentLength === "SHORT"  ? "• SHORT article → MAXIMUM 3 content H2 sections (each ~200-250 words)" : ""}
  ${contentLength === "MEDIUM" ? "• MEDIUM article → MAXIMUM 4 content H2 sections (each ~300 words)" : ""}
  ${contentLength === "LONG"   ? "• LONG article → MAXIMUM 6 content H2 sections (each ~350 words)" : ""}
  ${contentLength === "PILLAR" ? "• PILLAR article → MAXIMUM 8 content H2 sections (each ~400 words)" : ""}
  DO NOT exceed this section limit. Fewer, deeper sections beat many shallow ones.
- At least 2 sections must directly address the content gaps identified above
- Each section: 3-4 bullet points showing exactly what will be covered
- Vary section types: how-to, comparison table, case study, data breakdown, common mistakes
- Include a "Key Takeaways" box near the top (does NOT count toward the section limit)
${isComparisonArticle ? `- This is a comparison/listicle article ("${keyword}"). Include a comparison table section (2nd or 3rd position) like "Quick Comparison: [Options] at a Glance" with a markdown table comparing options by key criteria.` : "- Include a comparison table ONLY if it genuinely helps the reader compare options, specs, or features. Do not force a table where it does not add value."}
${includeFAQ ? "- Include 1 FAQ section (does NOT count toward the section limit)" : ""}
${ctx.requiredSections?.length ? `- MUST include these sections: ${ctx.requiredSections.join(", ")}` : ""}
- Do NOT include a "Conclusion", "Final Thoughts", "Wrapping Up" or any concluding section. The article should end naturally after the last content section.${ctx.ctaText ? ` Weave the CTA for ${ctx.brandName} into the final content section naturally.` : ""}
- "uniqueAngle" field: the specific take that makes this article clearly better than the top 5 results

Return JSON: { "title": "...", "sections": [{ "heading": "...", "points": ["..."] }], "uniqueAngle": "..." }`,
    systemPrompt
  );

  if (!outline.title || !outline.sections?.length) {
    throw new Error(`Outline generation failed: empty title or no sections for keyword "${keyword}"`);
  }
  if (outline.sections.length < 2) {
    console.warn(`[content-gen] Outline has only ${outline.sections.length} section(s) — adding placeholder`);
    outline.sections.push({ heading: `Understanding ${keyword}`, points: ["Cover the core concept", "Provide actionable advice"] });
  }

  // Fix outdated year in title
  const lastYear = String(currentYear - 1);
  if (outline.title.includes(lastYear)) {
    outline.title = outline.title.replace(new RegExp(lastYear, "g"), String(currentYear));
    console.log(`[content-gen] Title year fixed: ${lastYear} → ${currentYear}`);
  }

  // Ensure the title contains the focus keyword
  const keywordLower = keyword.toLowerCase();
  if (!outline.title.toLowerCase().includes(keywordLower)) {
    const keywordWords = keywordLower.split(/\s+/);
    const titleLower = outline.title.toLowerCase();
    const hasPartial = keywordWords.length > 2 && keywordWords.filter(w => titleLower.includes(w)).length >= keywordWords.length - 1;
    if (!hasPartial) {
      const colonTitle = `${outline.title}: ${keyword.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`;
      if (colonTitle.length <= 75) {
        outline.title = colonTitle;
      } else {
        outline.title = `${keyword.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}: ${outline.title}`;
        if (outline.title.length > 75) outline.title = outline.title.slice(0, 72) + "...";
      }
      console.log(`[content-gen] Title fixed to include keyword: "${outline.title}"`);
    }
  }

  // Filter/cap content sections
  const nonContentPattern = /^(key takeaways?|table of contents|faq|frequently asked|conclusion)/i;
  let contentSections = outline.sections.filter(s => !nonContentPattern.test(s.heading));
  const sectionCap = MAX_CONTENT_SECTIONS[contentLength] ?? 5;
  if (contentSections.length > sectionCap) {
    console.warn(`[content-gen] Outline had ${contentSections.length} content sections — capping to ${sectionCap} for ${contentLength} article`);
    contentSections = contentSections.slice(0, sectionCap);
  }

  // ─── STEP 3: DRAFT ───────────────────────────────────────────────
  await progress("draft", "Writing full article draft...");
  const draftResult = await generateDraft(keyword, ctx, outline, contentSections, systemPrompt, {
    targetWords,
    draftTokens,
    minExpectedWords,
    contentLength,
    includeTableOfContents,
    includeFAQ,
    includeProTips,
    isComparisonArticle,
    customDirection: options.customDirection,
    research,
    onProgress: progress,
  });
  const { content: cleanDraft, words: draftWords, truncated: draftTruncated } = draftResult;
  const requiredH2s = contentSections.map(s => s.heading);
  console.log(`[content-gen] Required H2s (${requiredH2s.length}): ${requiredH2s.join(" | ")}`);

  // ─── STEP 4: TONE POLISH ───────────────────────────────────────
  await progress("tone", "Polishing voice — removing generic patterns...");
  const estimatedDraftTokens = Math.ceil(draftWords * 1.4);
  const rewriteTokens = Math.max(16384, Math.ceil(estimatedDraftTokens * 1.5));

  const toneResult = await generateWithContinuation(
    `You are a senior editor at a sharp, opinionated media publication. Your job is to take a decent blog draft and make it genuinely great — the kind of article someone shares because it's actually useful AND enjoyable to read.

Brand voice for ${ctx.brandName}: "${ctx.tone}"
Audience: ${ctx.targetAudience}

## Your editing checklist (apply ALL of these):

**Kill generic patterns:**
- CHECK THE OPENING FIRST: If it starts with "It is [time]...", "Picture this...", "Imagine...", "You're sitting at...", or any time-based scene-setting, COMPLETELY rewrite it. Replace with a bold stat, contrarian claim, or 2-sentence case study.
- If the opening paragraph sounds like every other article on this topic, rewrite it with a shocking stat, a provocative question, or a counterintuitive insight
${includeProTips ? '- Count the "Pro Tip:" labels. If there are more than 2, delete the weakest ones and fold those insights naturally into the surrounding prose' : '- Remove ALL "Pro Tip:" callout boxes. Fold any useful insights from them naturally into the surrounding prose'}
- If any paragraph starts with "It is important to...", "In today's...", "As a [profession]...", or "With the rise of...", rewrite it completely
- If any two sections have the same rhythm/structure, change one of them

**Add genuine personality:**
- One well-placed analogy or relatable comparison per 500 words (don't force it)
- Use relatable comparisons specific to ${ctx.targetAudience}
- Where the draft states a generic opinion, replace it with specific data, process details, or industry standards

**BRAND & VOICE LIMITS (critical):**
- ${ctx.brandName} should appear NO MORE THAN 2-3 times in the entire article. If the draft mentions it more, CUT the extras.
- First-person phrases ("I've found", "From my experience", "In my testing", "What I noticed") — use MAX 3-4 total across the whole article, each with DIFFERENT wording. Replace the rest with objective expertise (data, process descriptions, certifications).
- Do NOT use fear-based or aggressive language about competitors. Replace words like "terrifying," "dangerous oversight," "corporate scare tactic" with neutral, standards-focused language. Elevate your approach, don't attack alternatives.
- CTAs: If the same CTA text appears more than twice, vary the phrasing (e.g. "Get your free assessment", "Book a consultation", "See our process").

**Tighten language:**
- Eliminate all em-dashes (—) — replace with commas or periods
- No "Furthermore," "Moreover," "Additionally" — use normal transitions
- No starting sentences with "So," or "Well,"
- Kill every instance of: "delve," "dive deep," "game-changer," "leverage," "utilize," "tapestry," "realm," "robust," "cutting-edge," "embark on a journey," "navigate the complexities," "unlock the power"
- Vary paragraph lengths: mix short punchy paragraphs (2-3 sentences) with medium (4-5 sentences) and occasionally longer detailed ones (5-6 sentences). NEVER have consecutive paragraphs of the same length. Merge single-sentence paragraphs. Cut filler and fluff.
- Remove ALL horizontal rules (---, ***, ___). Sections are separated by headings only.
- Ensure zero grammar mistakes.

**Kill conclusion patterns:**
- If the article ends with "Final Thoughts", "Conclusion", "In Closing", "Wrapping Up", "The Bottom Line" or similar, REMOVE that heading and fold any useful content into the previous section
- The article should end naturally after the last content section, not with a labeled ending

**Preserve everything structural:**
- Keep ALL headings exactly as written (character for character — the TOC depends on them matching)
- Keep all facts, data, statistics, and internal links
- Keep Markdown formatting, tables, code blocks, bullet lists
- Do NOT add new H2 sections

## Draft to edit (${draftWords} words):
${cleanDraft}

Output ONLY the polished blog post in Markdown. Start directly with the content.
CRITICAL: Output the COMPLETE article with every section. Do NOT stop early or drop sections. If anything, tighten the prose to be more concise.`,
    systemPrompt,
    { temperature: 0.65, maxTokens: rewriteTokens },
    "tone-polish",
    5,
    Math.floor(draftWords * 0.75)
  );

  const cleanTone = deduplicateContent(toneResult.text);
  const toneWords = countWords(cleanTone);
  const toneMissing = findMissingSections(cleanTone, contentSections);
  const draftMissing = findMissingSections(cleanDraft, contentSections);
  const toneCutOff = isCutOff(cleanTone);
  console.log(`[content-gen] Tone polish: ${toneWords} words (draft was ${draftWords}), missing=${toneMissing.length}, cutoff=${toneCutOff}`);

  let toneToUse: string;
  // Only fall back to draft if tone is severely truncated (< 60% of draft), not just tighter prose.
  // A good edit can easily cut 20-30% of fluff — don't penalise quality rewrites.
  if (toneCutOff || toneWords < draftWords * 0.60 || toneMissing.length > draftMissing.length) {
    console.warn(`[content-gen] Tone degraded after continuation attempts. Falling back to draft.`);
    toneToUse = cleanDraft;
  } else {
    toneToUse = cleanTone;
  }

  // ─── STEP 5: SEO OPTIMIZATION ──────────────────────────────────
  await progress("seo", "Optimizing for SEO — keywords, links, structure...");
  const consolidatedLinks = buildConsolidatedLinks(ctx);
  const seoResult = await runSeoOptimization(keyword, ctx, toneToUse, contentSections, consolidatedLinks, systemPrompt, {
    targetWords,
    includeFAQ,
    verifiedCitations: research.citations || [],
  });

  const toneToUseMissing = findMissingSections(toneToUse, contentSections);
  const toneToUseWords = countWords(toneToUse);

  // Pick best version and post-process
  const candidates = [
    { label: "SEO",   content: seoResult.content, words: seoResult.words,  missing: seoResult.missing,    cutoff: seoResult.cutoff },
    { label: "tone",  content: toneToUse,          words: toneToUseWords,   missing: toneToUseMissing.length, cutoff: isCutOff(toneToUse) },
    { label: "draft", content: cleanDraft,          words: draftWords,       missing: draftMissing.length,    cutoff: draftTruncated || isCutOff(cleanDraft) },
  ];

  let finalContent = postProcess(candidates, ctx, consolidatedLinks, contentSections, research.citations);

  // ─── STEP 6: METADATA ────────────────────────────────────────────
  await progress("metadata", "Generating SEO metadata, schema, and social captions...");

  interface MetadataResult {
    title: string;
    metaTitle: string;
    metaDescription: string;
    excerpt: string;
    slug: string;
    secondaryKeywords: string[];
    tags: string[];
    category: string;
    twitterCaption: string;
    linkedinCaption: string;
    instagramCaption: string;
    facebookCaption: string;
    structuredData: object;
    featuredImageAlt: string;
  }

  let metadata: MetadataResult;
  try {
    metadata = await generateJSON<MetadataResult>(
      `Generate SEO metadata and social media captions for this blog post about "${keyword}" for ${ctx.brandName} (${ctx.brandUrl}).

## Blog Post:
${truncateAtSentence(finalContent, 3000)}

Output ONLY valid JSON (no markdown code fences) with this exact structure:
{
  "title": "Compelling blog title (50-70 chars, include keyword)",
  "slug": "url-friendly-slug-with-keyword (lowercase, hyphens, no stop words, ≤60 chars)",
  "excerpt": "2-3 sentence summary for preview cards (160-200 chars)",
  "metaTitle": "SEO title tag (under 60 chars, keyword near front)",
  "metaDescription": "SEO meta description (under 155 chars, include keyword, call to action)",
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "category": "Single category name relevant to ${ctx.niche}",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "twitterCaption": "Engaging tweet under 280 chars with hashtags",
  "linkedinCaption": "Professional LinkedIn post (2-3 paragraphs with emojis and hashtags)",
  "instagramCaption": "Instagram caption with emojis and hashtags",
  "facebookCaption": "Facebook post (2-3 sentences, conversational)",
  "structuredData": { "@context": "https://schema.org", "@type": "Article", "headline": "...", "description": "...", "author": { "@type": "Organization", "name": "${ctx.brandName}" } },
  "featuredImageAlt": "Descriptive alt text for featured image (includes keyword)"
}`,
      "You are an SEO specialist and social media expert. Return valid JSON only."
    );
  } catch (metaErr) {
    console.error("[content-gen] Metadata generation failed, using defaults:", metaErr instanceof Error ? metaErr.message : metaErr);
    metadata = {
      title: outline.title,
      slug: slugify(outline.title),
      metaTitle: outline.title.slice(0, 60),
      metaDescription: finalContent.replace(/[#*\[\]()]/g, "").slice(0, 155),
      excerpt: finalContent.replace(/[#*\[\]()]/g, "").slice(0, 200),
      secondaryKeywords: [],
      tags: [ctx.niche],
      category: ctx.niche,
      twitterCaption: "",
      linkedinCaption: "",
      instagramCaption: "",
      facebookCaption: "",
      structuredData: { "@context": "https://schema.org", "@type": "Article", "headline": outline.title, "author": { "@type": "Organization", "name": ctx.brandName } },
      featuredImageAlt: `${keyword} - ${outline.title}`,
    };
  }

  // ─── STEP 7: IMAGE GENERATION ──────────────────────────────────
  let featuredImageUrl: string | undefined;
  let featuredImageAlt = metadata.featuredImageAlt || keyword;
  const postSlug = metadata.slug || slugify(outline.title);

  if (includeImages && process.env.GOOGLE_AI_API_KEY) {
    await progress("image", "Generating featured image + 2 inline images…");
    resetPexelsTracking();

    try {
      const featPrompt = `Create an image that directly represents the concept of "${keyword}" for a ${ctx.niche} business. The image should clearly relate to "${outline.title}". No text, words, letters, or watermarks.`;
      featuredImageUrl = await generateBlogImage(featPrompt, `${postSlug}-featured`, website.id, keyword, ctx.niche, "fast", imageSource);
      featuredImageAlt = metadata.featuredImageAlt || `${keyword} - ${outline.title}`;
      console.log(`[content-gen] Featured image generated: ${featuredImageUrl}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error(`[content-gen] Featured image generation failed: ${reason}`);
      featuredImageUrl = undefined;
    }

    const h2Regex = /^## .+$/gm;
    const h2Matches: { index: number; text: string }[] = [];
    let h2Match;
    while ((h2Match = h2Regex.exec(finalContent)) !== null) {
      h2Matches.push({ index: h2Match.index, text: h2Match[0] });
    }
    const insertAfterIndices = h2Matches.length >= 4 ? [1, 3] : h2Matches.length >= 2 ? [0, Math.min(1, h2Matches.length - 1)] : [];

    for (let imgIdx = 0; imgIdx < insertAfterIndices.length; imgIdx++) {
      const sectionIdx = insertAfterIndices[imgIdx];
      const sectionHeading = h2Matches[sectionIdx]?.text?.replace(/^## /, "") || keyword;
      try {
        const inlinePrompt = imageSource === "ILLUSTRATION"
          ? `Create a modern illustration for the section "${sectionHeading}" of a blog post about "${keyword}" in ${ctx.niche}. Stylized vector art, clean design. No text or words.`
          : `Create a photorealistic image for the section "${sectionHeading}" of a blog post about "${keyword}" in ${ctx.niche}. Must look like a real photograph, not a cartoon or illustration. No text or words.`;
        const inlineUrl = await generateInlineImage(inlinePrompt, postSlug, imgIdx + 1, website.id, keyword, ctx.niche, imageSource, sectionHeading);
        const sectionStart = h2Matches[sectionIdx].index;
        const nextH2 = h2Matches[sectionIdx + 1]?.index ?? finalContent.length;
        const sectionContent = finalContent.slice(sectionStart, nextH2);
        const firstParaBreak = sectionContent.indexOf("\n\n", sectionContent.indexOf("\n") + 1);
        if (firstParaBreak > 0) {
          const insertPos = sectionStart + firstParaBreak;
          const imgAlt = `${sectionHeading} - ${keyword}`;
          const imgMarkdown = `\n\n![${imgAlt}](${inlineUrl})\n`;
          finalContent = finalContent.slice(0, insertPos) + imgMarkdown + finalContent.slice(insertPos);
          const shift = imgMarkdown.length;
          for (let j = sectionIdx + 1; j < h2Matches.length; j++) h2Matches[j].index += shift;
          console.log(`[content-gen] Inline image ${imgIdx + 1} inserted after "${sectionHeading}"`);
        }
      } catch (err) {
        console.warn(`[content-gen] Inline image ${imgIdx + 1} failed:`, err instanceof Error ? err.message : err);
      }
    }
  } else if (includeImages) {
    console.warn(`[content-gen] Skipping image generation: ${!process.env.GOOGLE_AI_API_KEY ? "GOOGLE_AI_API_KEY not configured" : "B2 storage not configured"}`);
  }

  const wordCount = countWords(finalContent);
  const readingTime = Math.ceil(wordCount / 200);

  return {
    title: outline.title,
    slug: metadata.slug || slugify(outline.title),
    content: finalContent,
    excerpt: metadata.excerpt || "",
    metaTitle: metadata.metaTitle || outline.title,
    metaDescription: metadata.metaDescription || "",
    focusKeyword: keyword,
    secondaryKeywords: metadata.secondaryKeywords || [],
    featuredImageUrl,
    featuredImageAlt,
    structuredData: metadata.structuredData || {},
    socialCaptions: {
      twitter: metadata.twitterCaption || "",
      linkedin: metadata.linkedinCaption || "",
      instagram: metadata.instagramCaption || "",
      facebook: metadata.facebookCaption || "",
    },
    wordCount,
    readingTime,
    tags: metadata.tags || [],
    category: metadata.category || ctx.niche,
    researchData: research,
  };
}
