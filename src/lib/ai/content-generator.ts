/**
 * Core AI Blog Generation Pipeline
 * 7-step process: Research → Outline → Draft → Tone → SEO → Metadata → Image
 *
 * Ported from InvoiceCave's proven 680-line blog-generator.ts with
 * multi-website parameterization.
 */
import { generateText, generateTextWithMeta, generateJSON, setModelOverride } from "./gemini";
import { researchKeyword, ResearchResult } from "./research";
import { generateBlogImage, generateInlineImage } from "../storage/image-generator";
import type { Website, BlogSettings } from "@prisma/client";

type WebsiteWithSettings = Website & {
  blogSettings?: BlogSettings | null;
  // Brand Intelligence fields (added in migration 20260221000003)
  uniqueValueProp?: string | null;
  competitors?: string[];
  keyProducts?: string[];
  targetLocation?: string | null;
};

export interface WebsiteContext {
  id: string;
  brandName: string;
  brandUrl: string;
  niche: string;
  targetAudience: string;
  tone: string;
  description: string;
  existingPosts?: { title: string; slug: string; url: string; focusKeyword: string }[];
  internalLinks?: { keyword: string; url: string }[];
  ctaText?: string;
  ctaUrl?: string;
  avoidTopics?: string[];
  writingStyle?: string;
  requiredSections?: string[];
  // Brand Intelligence
  uniqueValueProp?: string;
  competitors?: string[];
  keyProducts?: string[];
  targetLocation?: string;
}

export interface GeneratedPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  structuredData: object;
  socialCaptions: {
    twitter: string;
    linkedin: string;
    instagram: string;
    facebook: string;
  };
  wordCount: number;
  readingTime: number;
  tags: string[];
  category: string;
  researchData: ResearchResult;
}

export interface GenerationProgress {
  step: string;
  stepIndex: number;
  totalSteps: number;
  message: string;
  percentage: number;
}

export type ProgressCallback = (progress: GenerationProgress) => Promise<void>;

const STEPS = [
  "research",
  "outline",
  "draft",
  "tone",
  "seo",
  "metadata",
  "image",
] as const;

function getImageStyle(niche: string): string {
  const n = niche.toLowerCase();
  if (/food|restaurant|cook|recipe|bak/i.test(n))
    return "appetizing professional food photography style, warm lighting, shallow depth of field";
  if (/fashion|beauty|cosmetic|skincare/i.test(n))
    return "clean editorial photography style, soft natural lighting, modern aesthetic";
  if (/tech|saas|software|ai|developer|coding|startup/i.test(n))
    return "clean modern flat illustration with a professional tech aesthetic, minimal and sleek";
  if (/health|fitness|medical|wellness|yoga/i.test(n))
    return "bright clean lifestyle photography style, natural and uplifting";
  if (/finance|banking|invest|insurance|accounting/i.test(n))
    return "professional corporate illustration, clean lines, trustworthy blue-toned palette";
  if (/travel|hotel|tourism|adventure/i.test(n))
    return "vivid landscape photography style, cinematic composition, natural colors";
  if (/education|learning|school|course|tutoring/i.test(n))
    return "friendly modern illustration, approachable and colorful, educational context";
  if (/real.?estate|property|home|interior/i.test(n))
    return "professional architectural photography style, bright and inviting interiors";
  if (/marketing|seo|content|social.?media|agency/i.test(n))
    return "clean modern flat illustration with bold accent colors, professional and data-driven feel";
  if (/ecommerce|shop|retail|product/i.test(n))
    return "clean product photography style on minimal background, professional commercial look";
  return "clean professional illustration, modern and relevant to the topic";
}

const WRITING_STYLE_GUIDANCE: Record<string, string> = {
  informative: "Clear, factual, and educational. Use data, examples, and step-by-step explanations. Authoritative but accessible.",
  conversational: "Friendly and approachable, like talking to a knowledgeable colleague. Use contractions, direct address ('you'), and relatable analogies.",
  technical: "Precise and detailed, written for practitioners. Use correct terminology, include code snippets or configs where relevant, avoid over-simplifying.",
  storytelling: "Narrative-driven. Open with a story or scenario. Use anecdotes, case studies, and real-world examples to illustrate points.",
  persuasive: "Benefit-focused and compelling. Lead with outcomes, use social proof, and create urgency. Every section should move the reader toward action.",
  humorous: "Light-hearted, witty, and fun — but always substantive. Use humor to make complex topics memorable, never at the expense of accuracy.",
};

function buildSystemPrompt(ctx: WebsiteContext): string {
  const styleGuidance = ctx.writingStyle && WRITING_STYLE_GUIDANCE[ctx.writingStyle]
    ? WRITING_STYLE_GUIDANCE[ctx.writingStyle]
    : null;

  let prompt = `You are a professional blog writer for ${ctx.brandName} (${ctx.brandUrl}).
${ctx.brandName} is a ${ctx.description}.
Your target audience is: ${ctx.targetAudience}
Writing tone: ${ctx.tone}${styleGuidance ? `\nWriting style: ${ctx.writingStyle} — ${styleGuidance}` : ""}
Niche: ${ctx.niche}
${ctx.targetLocation ? `Geographic focus: ${ctx.targetLocation} — use locally relevant data, examples, pricing, and market references.` : ""}
${ctx.uniqueValueProp ? `${ctx.brandName}'s unique value: ${ctx.uniqueValueProp}` : ""}
${ctx.keyProducts?.length ? `Key products/features to reference naturally when relevant: ${ctx.keyProducts.join(", ")}` : ""}
${ctx.competitors?.length ? `Main competitors: ${ctx.competitors.join(", ")} — write content that positions ${ctx.brandName} as the better choice without directly attacking them.` : ""}

RULES:
- Write in a ${ctx.tone} style${styleGuidance ? `, applying the ${ctx.writingStyle} writing approach described above` : ""}
- Mention ${ctx.brandName} NO MORE THAN 2-3 times in the entire article. One in the intro, one mid-article. Never in consecutive sections. Do NOT overuse the brand name.
${ctx.uniqueValueProp ? `- Reference ${ctx.brandName}'s value proposition ONCE, naturally: "${ctx.uniqueValueProp}"` : ""}
${ctx.ctaText && ctx.ctaUrl ? `- Include ONE primary CTA: "${ctx.ctaText}" (${ctx.ctaUrl}) — make it specific, time-sensitive, and benefit-driven. Do NOT repeat the same CTA text. Vary the phrasing each time (e.g. "Book a free assessment", "See pricing", "Talk to a specialist").` : ""}
${ctx.avoidTopics?.length ? `- Never mention: ${ctx.avoidTopics.join(", ")}` : ""}
- Format: Markdown with proper H2/H3 hierarchy
- Write for humans first, search engines second
- Use active voice, clear language that delivers value to readers and search engines
- Write focused paragraphs: 3-5 sentences each. Each paragraph should develop a complete thought. No single-sentence paragraphs, but don't pad either.
- Use bullet points and numbered lists where they genuinely help, not forced into every section
- Add visual breaks: bold key phrases, use blockquotes for expert tips
- Include comparison tables ONLY where they genuinely serve the reader (side-by-side comparisons, specs, pricing). Do not force tables.
- Include related entities (people, places, tools, standards, organizations) naturally throughout the content to build semantic richness
- Cover the topic thoroughly but concisely. Stay within the target word count. Every sentence should earn its place.

OPENING PARAGRAPH RULE:
- NEVER start with "In this article we will guide you" or "In this guide we inform you" or any variation of announcing what the article covers
- NEVER start a blog post with "It is [time] on a [day]" or any time-based scene-setting
- NEVER use "Picture this" or "Imagine this" or "You're sitting at your desk"
- The opening must be unique, natural, and go directly into the topic with value
- Every article should open DIFFERENTLY — with data, a question, a contrarian take, or a micro case study

ENDING RULE:
- NEVER end with a "Final Thoughts", "Conclusion", "In Closing", "Wrapping Up", "The Bottom Line", or any similar concluding section heading
- The article should end naturally and organically after the last content section
- The last section should complete the topic naturally without signaling "this is the end"
- If there is a CTA, weave it into the final content section naturally, not as a separate conclusion

EEAT (Experience, Expertise, Authority, Trust) RULES:
- Write from the perspective of an experienced professional, but VARY your phrasing
- Use first-person sparingly — MAX 3-4 times in the whole article, spread across different sections
- NEVER repeat the same first-person phrase twice (e.g. don't use "From my experience" more than once)
- Instead of saying "from my experience," demonstrate expertise through specific details, data, process descriptions, and tool references
- Reference industry certifications, standards, and methodologies (e.g. I-CAR, ASE, OEM procedures, ISO standards) to build authority through credentials, not just claims
- Include real statistics, case study results, or industry data — not just opinions
- When mentioning competitors or alternatives, be objective and fair. Elevate your standards rather than attacking others. Avoid fear-based language like "terrifying," "dangerous oversight," "scare tactic"

BANNED AI PHRASES (NEVER USE):
- "Delve" or "delve into"
- "Dive deep" or "deep dive"
- "In today's fast-paced world" or "In today's digital landscape"
- "Buckle up"
- "Game-changer" or "game changing"
- "Leverage" (use "use" instead)
- "Utilize" (use "use" instead)
- "Tapestry"
- "Landscape" (when used metaphorically)
- "Realm"
- "Robust"
- "Cutting-edge" or "state-of-the-art"
- "Embark on a journey"
- "Navigating the complexities"
- "Unlock the power/potential"
- "It's important to note that" or "It's worth noting"
- Em-dash (—) — use commas or periods instead
- Do NOT start sentences with "So," or "Well,"
- Avoid overly formal transitions like "Furthermore," "Moreover," "Additionally"`;



  if (ctx.existingPosts?.length) {
    prompt += `\n- When relevant, link to existing blog articles on the site (links will be provided in the SEO optimization step)`;
  }

  return prompt;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Detect and strip repeated/looped content.
 * Strategy 1: repeated H2 heading (most reliable — AI loops back to the top).
 * Strategy 2: orphaned "## " at end of content (truncated mid-heading — strip it).
 */
function deduplicateContent(text: string): string {
  const lines = text.split("\n");
  if (lines.length < 10) return text;

  // Strategy 1: detect the first H2 heading that appears a second time
  const seenH2s = new Map<string, number>();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (.+)$/);
    if (!m) continue;
    const heading = m[1].trim().toLowerCase();
    if (seenH2s.has(heading)) {
      console.log(`[content-gen] Duplicate H2 "${m[1]}" at line ${i} — truncating loop`);
      return lines.slice(0, i).join("\n").trimEnd();
    }
    seenH2s.set(heading, i);
  }

  // Strategy 2: detect full-content repetition (opening paragraph repeated later)
  // Grab the first substantial paragraph (>80 chars, not a heading/list/image)
  const paragraphs = text.split(/\n\n+/);
  let firstParagraph = "";
  for (const p of paragraphs) {
    const t = p.trim();
    if (t.length > 80 && !/^(#{1,6}\s|[-*]\s|\d+\.\s|!\[|```|<|\|)/.test(t)) {
      firstParagraph = t.slice(0, 200).toLowerCase().replace(/\s+/g, " ");
      break;
    }
  }
  if (firstParagraph) {
    const normalized = text.replace(/\s+/g, " ").toLowerCase();
    const firstIdx = normalized.indexOf(firstParagraph);
    if (firstIdx >= 0) {
      const secondIdx = normalized.indexOf(firstParagraph, firstIdx + firstParagraph.length);
      if (secondIdx > 0) {
        const charPos = secondIdx;
        let cumLen = 0;
        const blocks = text.split(/\n\n+/);
        const keepBlocks: string[] = [];
        for (const block of blocks) {
          const blockNorm = block.replace(/\s+/g, " ").toLowerCase();
          if (cumLen >= charPos - 50) break;
          keepBlocks.push(block);
          cumLen += blockNorm.length + 2;
        }
        if (keepBlocks.length > 0 && keepBlocks.length < blocks.length) {
          console.log(`[content-gen] Full-content repetition detected at ~char ${secondIdx} — truncating`);
          return keepBlocks.join("\n\n").trimEnd();
        }
      }
    }
  }

  // Strategy 3: orphaned heading stub ("## " or "## \n") at very end — strip it
  const trimmed = text.trimEnd();
  const stubMatch = trimmed.match(/([\s\S]*?)\n##\s*$/);
  if (stubMatch) {
    console.log(`[content-gen] Stripped orphaned heading stub at end`);
    return stubMatch[1].trimEnd();
  }

  return text;
}

/**
 * Detect whether text ends abruptly mid-sentence (i.e. the model was cut off).
 */
function isCutOff(content: string): boolean {
  if (!content) return true;
  const trimmed = content.trim();
  if (trimmed.length === 0) return true;
  const validEndings = [".", "!", "?", '"', "'", "\u201D", "\u2019", ")", "]", ">", "*", "`"];
  return !validEndings.includes(trimmed.slice(-1));
}

/**
 * Run a generation and automatically continue if the model stops mid-sentence.
 * Preserves full context — the original prompt is used for the first call;
 * subsequent calls ask the model to continue from the tail of the accumulated text.
 * Returns the fully stitched result, guaranteed to end on a complete sentence.
 */
async function generateWithContinuation(
  prompt: string,
  sysPrompt: string,
  options: { temperature: number; maxTokens: number },
  label = "generation",
  maxContinuations = 5,
  minWords = 0
): Promise<{ text: string; truncated: boolean; finishReason: string; outputTokens: number; promptTokens: number }> {
  const result = await generateTextWithMeta(prompt, sysPrompt, options);
  let accumulated = result.text;

  const needsContinuation = () => {
    if (result.truncated || isCutOff(accumulated)) return true;
    if (minWords > 0 && countWords(accumulated) < minWords) return true;
    return false;
  };

  if (!needsContinuation()) {
    return result;
  }

  for (let attempt = 1; attempt <= maxContinuations; attempt++) {
    const currentWords = countWords(accumulated);
    const belowMin = minWords > 0 && currentWords < minWords;
    console.warn(`[content-gen] ${label} incomplete — continuation ${attempt}/${maxContinuations} (${currentWords} words${belowMin ? `, need ${minWords}` : ""})`);

    const contextTail = accumulated.slice(-1400);

    const contResult = await generateTextWithMeta(
      `A blog post was being written but the output was cut off. Continue writing from exactly where it stopped.
${belowMin ? `\nThe article so far is only ${currentWords} words. It needs to be at least ${minWords} words. There is significant content still missing.\n` : ""}
Here is the tail end of the article so far — do NOT repeat this content:
---
${contextTail}
---

Continue the article from the very next word. Maintain the same writing style, tone, Markdown formatting, and heading structure. Do not add any introduction, preamble, or explanation. Just continue seamlessly.`,
      sysPrompt,
      { temperature: options.temperature, maxTokens: options.maxTokens }
    );

    const contText = contResult.text.trim();
    if (!contText) break;

    // Overlap guard 1: if continuation restarts the article from the beginning,
    // find where the new content diverges from the accumulated text and keep only
    // the new portion (the part after the overlap).
    const accLower = accumulated.toLowerCase();
    const contLower = contText.toLowerCase();
    let restartSkip = 0;
    if (accLower.slice(0, 200) === contLower.slice(0, 200)) {
      // Model restarted from the very beginning — find where the continuation
      // extends beyond the accumulated content and keep only that extension.
      const matchLen = Math.min(accumulated.length, contText.length);
      let divergeAt = 0;
      for (let j = 0; j < matchLen; j++) {
        if (accLower[j] !== contLower[j]) { divergeAt = j; break; }
        divergeAt = j + 1;
      }
      if (divergeAt > accumulated.length * 0.5) {
        restartSkip = divergeAt;
        console.log(`[content-gen] ${label} continuation restarted from beginning — skipping first ${restartSkip} overlapping chars`);
      }
    }

    // Overlap guard 2: if continuation repeats the tail of accumulated
    let joinAt = restartSkip;
    if (joinAt === 0) {
      const tailForOverlap = accumulated.slice(-300).toLowerCase();
      for (let len = Math.min(150, contText.length); len > 30; len -= 10) {
        if (tailForOverlap.includes(contText.slice(0, len).toLowerCase())) {
          joinAt = len;
          break;
        }
      }
    }

    const newContent = contText.slice(joinAt).trim();
    if (!newContent) break;
    accumulated = accumulated.trimEnd() + "\n\n" + newContent;
    const totalNow = countWords(accumulated);
    console.log(`[content-gen] ${label} continuation ${attempt}: +${countWords(contText)} words, total now ${totalNow}`);

    const stillTruncated = contResult.truncated || isCutOff(accumulated);
    const stillBelowMin = minWords > 0 && totalNow < minWords;
    if (!stillTruncated && !stillBelowMin) break;
  }

  return {
    text: accumulated,
    truncated: false,
    finishReason: "STOP",
    promptTokens: result.promptTokens,
    outputTokens: result.outputTokens,
  };
}

export async function generateBlogPost(
  keyword: string,
  website: WebsiteWithSettings,
  contentLength: "SHORT" | "MEDIUM" | "LONG" | "PILLAR" = "MEDIUM",
  options: {
    includeImages?: boolean;
    includeFAQ?: boolean;
    includeTableOfContents?: boolean;
    onProgress?: ProgressCallback;
    existingPosts?: { title: string; slug: string; url: string; focusKeyword: string }[];
    internalLinks?: { keyword: string; url: string }[];
    customDirection?: string;
  } = {}
): Promise<GeneratedPost> {
  const { includeImages = true, includeFAQ = true, includeTableOfContents = true, onProgress } = options;

  // Use the preferred model from BlogSettings if configured
  const preferredModel = website.blogSettings?.preferredModel;
  if (preferredModel && preferredModel !== "gemini-3.1-pro-preview") {
    setModelOverride(preferredModel);
  }

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

  const wordTargets: Record<string, string> = {
    SHORT: "600-800",
    MEDIUM: "1000-1500",
    LONG: "1800-2500",
    PILLAR: "2500-3500",
  };
  const targetWords = wordTargets[contentLength] || wordTargets.MEDIUM;

  const draftTokensForLength: Record<string, number> = {
    SHORT: 4096,
    MEDIUM: 8192,
    LONG: 12288,
    PILLAR: 16384,
  };
  const draftTokens = draftTokensForLength[contentLength] || draftTokensForLength.MEDIUM;

  const minWordsForLength: Record<string, number> = {
    SHORT: 450,
    MEDIUM: 800,
    LONG: 1400,
    PILLAR: 2000,
  };
  const minExpectedWords = minWordsForLength[contentLength] || minWordsForLength.MEDIUM;

  const progress = async (step: typeof STEPS[number], message: string) => {
    const stepIndex = STEPS.indexOf(step);
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

  // Detect comparison/listicle article type to force mandatory table
  const isComparisonArticle = /\b(best|vs\.?|compare|comparison|top \d+|alternatives?|review|which|ranking|ranked|versus)\b/i.test(keyword);

  // ─── STEP 1: RESEARCH ───────────────────────────────────────────
  await progress("research", `Researching "${keyword}"...`);
  const research = await researchKeyword(keyword, {
    ...ctx,
    description: ctx.description,
  });

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
${research.rawResearch.substring(0, 2500)}

## Outline Rules
- H1 title: MUST contain the EXACT focus keyword "${keyword}" (or very close variant). SEO-optimized (50-70 chars), reflects the winning angle. If you cannot fit the exact keyword, use as many of its words as possible in the title.
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

  // ─── STEP 3: DRAFT ───────────────────────────────────────────────
  await progress("draft", "Writing full article draft...");

  // Filter outline sections to only content sections (exclude Key Takeaways, TOC, FAQ, Conclusion)
  const nonContentPattern = /^(key takeaways?|table of contents|faq|frequently asked|conclusion)/i;
  let contentSections = outline.sections.filter(s => !nonContentPattern.test(s.heading));

  // Hard-cap section count to match word budget — the AI often ignores the instruction
  const maxContentSections: Record<string, number> = {
    SHORT: 3, MEDIUM: 4, LONG: 6, PILLAR: 8,
  };
  const sectionCap = maxContentSections[contentLength] ?? 5;
  if (contentSections.length > sectionCap) {
    console.warn(`[content-gen] Outline had ${contentSections.length} content sections — capping to ${sectionCap} for ${contentLength} article`);
    contentSections = contentSections.slice(0, sectionCap);
  }

  // Put the non-content sections (FAQ, Conclusion) back at the end of the full outline for rendering
  const nonContentSections = outline.sections.filter(s => nonContentPattern.test(s.heading));
  const cappedFullOutline = [...contentSections, ...nonContentSections];

  const brandContext = [
    ctx.targetLocation ? `Geographic context: Write for a ${ctx.targetLocation} audience — use relevant pricing, tools, and examples.` : "",
    ctx.uniqueValueProp ? `Brand USP to highlight: "${ctx.uniqueValueProp}" — weave this into the conclusion and any tool/solution recommendations.` : "",
    ctx.keyProducts?.length ? `Products/features to mention naturally where relevant: ${ctx.keyProducts.join(", ")}` : "",
    ctx.competitors?.length ? `Context: ${ctx.brandName} competes with ${ctx.competitors.join(", ")} — don't mention competitors by name, but make ${ctx.brandName}'s approach clearly superior through specific examples.` : "",
  ].filter(Boolean).join("\n");

  const customDirection = options.customDirection;

  const draftResult = await generateWithContinuation(
    `Write a complete blog post about "${keyword}" for ${ctx.brandName}. Target length: ${targetWords} words. Be concise and value-dense. Every paragraph should earn its place.

Title: ${outline.title}
Unique angle: ${outline.uniqueAngle}
${brandContext}

Outline to follow (${cappedFullOutline.length} sections — you MUST write ALL of them):
${cappedFullOutline.map((s) => `## ${s.heading}\n${s.points.map((p) => `- ${p}`).join("\n")}`).join("\n\n")}

## Content Gaps to Fill (what competitors miss — cover these thoroughly)
${research.contentGaps.slice(0, 5).map((g, i) => `${i + 1}. ${g}`).join("\n")}
${research.missingSubtopics?.length ? "\nMissing subtopics that will make this article stand out:\n" + research.missingSubtopics.slice(0, 3).map((s) => `- ${s}`).join("\n") : ""}

## Research Data
${research.rawResearch.substring(0, 3500)}

## Writing Guidelines:

**HOOK (most important rule):**
Your opening MUST be unique. Use this specific hook style: ${(() => {
  const hookStyles = [
    { style: "CONTRARIAN", instruction: `Open with a bold, contrarian statement that challenges conventional wisdom about "${keyword}". State something surprising that makes the reader think 'Wait, really?' Do NOT use "Most advice about X is wrong." Be original. Make a specific, testable claim.` },
    { style: "DATA-LEAD", instruction: `Open with a specific number or statistic. ${research.keyStatistics[0] ? `Use this real data: "${research.keyStatistics[0]}"` : "Pull a compelling number from the research below."} Frame it as: "[Number]. That's [what it means]. Here's why that matters to you."` },
    { style: "QUESTION-CHAIN", instruction: `Open with 3 increasingly specific questions about "${keyword}" that ${ctx.targetAudience} are asking right now. Make the third question surprisingly specific. Then answer with: "The answer to all three is the same."` },
    { style: "CASE-STUDY-OPEN", instruction: `Open with a real 2-sentence result. Name a real company, tool, or person from the research data. "[Name] achieved [specific measurable result] by [specific action]. Most ${ctx.targetAudience} do the exact opposite."` },
    { style: "MYTH-BUSTER", instruction: `Name the single biggest misconception about "${keyword}" in the ${ctx.niche} space. State it as fact, then immediately contradict it with evidence. "Everyone tells you [myth]. ${research.keyStatistics[1] ? `The data says otherwise: ${research.keyStatistics[1]}` : "The data tells a completely different story."}"` },
    { style: "COST-OF-INACTION", instruction: `Open with what "${keyword}" done wrong actually costs. Be specific: dollars, hours, lost customers, or missed opportunities. "${ctx.targetAudience} who ignore [aspect of ${keyword}] lose [specific amount] per [time period]. Here's the math."` },
    { style: "PREDICTION", instruction: `Open with a forward-looking prediction about "${keyword}" that's backed by research. "By [timeframe], [specific change will happen]. The ${ctx.targetAudience} who prepare now will [benefit]. The rest will [consequence]."` },
    { style: "DIRECT-ADDRESS", instruction: `Open by directly telling the reader what they're doing wrong, with zero preamble. "You're spending too much time on [wrong thing] and not enough on [right thing]. ${research.contentGaps[0] ? `And the biggest gap? ${research.contentGaps[0]}` : "Here's proof."}"` },
  ];
  // Use keyword hash for deterministic variety — different keywords always get different hooks
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
${customDirection ? `- CUSTOM DIRECTION FROM USER: "${customDirection}" — use this to guide how the blog opens and the overall direction/angle of the content.` : ""}
- Open with a HOOK that goes directly into providing value. Do NOT announce what the article covers.
- Key Takeaways / Quick Summary box (bulleted, 4-5 points)
${includeTableOfContents ? `- Table of Contents with CLICKABLE anchor links. Use this EXACT format:
## Table of Contents
- [First Section Heading](#first-section-heading)
- [Second Section Heading](#second-section-heading)
Each entry MUST be a markdown link with the heading text as anchor text and a #slug as the URL. The slug is the heading in lowercase with spaces replaced by hyphens and special characters removed.` : "- Do NOT include a Table of Contents"}
- Main sections following the outline
${isComparisonArticle ? `- Include a markdown comparison table where it makes sense (usually early in the article).` : ""}
${includeFAQ ? "- FAQ section (4-5 questions with detailed answers)" : ""}
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
- Write ${targetWords} words. Stay within the target range. Be concise, not padded.
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
    { temperature: 0.8, maxTokens: draftTokens },
    "draft",
    5,
    minExpectedWords
  );

  let cleanDraft = deduplicateContent(draftResult.text);
  let draftWords = countWords(cleanDraft);
  console.log(`[content-gen] Draft attempt 1: ${draftWords} words (min: ${minExpectedWords}), finishReason: ${draftResult.finishReason}`);

  // Check which outline sections are actually present in the draft
  function findMissingSections(content: string, sections: { heading: string }[]): string[] {
    const h2s = (content.match(/^## .+$/gm) || []).map(h => h.replace(/^## /, "").trim().toLowerCase());
    return sections.filter(s => {
      const target = s.heading.toLowerCase();
      return !h2s.some(h => h.includes(target) || target.includes(h) || levenshteinSimilar(h, target));
    }).map(s => s.heading);
  }

  function levenshteinSimilar(a: string, b: string): boolean {
    if (a.length < 5 || b.length < 5) return false;
    const shorter = a.length < b.length ? a : b;
    const longer = a.length < b.length ? b : a;
    return longer.includes(shorter.slice(0, Math.floor(shorter.length * 0.7)));
  }
  const missingSections = findMissingSections(cleanDraft, contentSections);
  let draftTruncated = draftResult.truncated;
  const draftCutOff = isCutOff(cleanDraft);
  const needsRetry = draftWords < minExpectedWords || missingSections.length >= 2 || draftTruncated || draftCutOff;

  if (needsRetry) {
    console.warn(`[content-gen] Draft incomplete: ${draftWords} words, ${missingSections.length} missing sections, truncated=${draftTruncated}, cutoff=${draftCutOff}`);
    if (missingSections.length > 0) console.warn(`[content-gen] Missing: ${missingSections.join(", ")}`);
    await progress("draft", "Draft was incomplete, rebuilding section by section...");

    // Fallback: generate each section independently, then stitch together
    const sectionParts: string[] = [];
    const wordsPerSection = Math.ceil(parseInt(targetWords.split("-")[1] || "2000") / contentSections.length);

    // Generate the intro (hook + key takeaways + TOC)
    const introResult = await generateWithContinuation(
      `Write the opening for a blog post about "${keyword}" for ${ctx.brandName}.
${brandContext}

Include:
1. A compelling 2-3 paragraph HOOK. NEVER start with "It is [time] on a [day]" or scene-setting. Instead open with: a shocking statistic, a contrarian claim, a rapid-fire question, or a 2-sentence case study result
2. A "Key Takeaways" section with 4-5 bullet points summarizing the article
${includeTableOfContents ? `3. A Table of Contents with CLICKABLE anchor links using this format:\n${contentSections.map(s => {
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

    // Generate each content section
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
${isComparisonArticle && i === 0 ? "- Include a markdown comparison table in this section" : ""}

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

    // Generate FAQ if needed
    if (includeFAQ) {
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

    // Always prefer the stitched version when section-by-section was triggered due to
    // missing sections — a complete shorter article beats a truncated longer one.
    // Only skip if stitching produced almost nothing (< 200 words, something went wrong).
    if (stitchedWords >= 200) {
      cleanDraft = stitchedDraft;
      draftWords = stitchedWords;
      draftTruncated = false;
    }
  }

  // Build the definitive section list from the outline for completeness checks later
  const requiredH2s = contentSections.map(s => s.heading);
  console.log(`[content-gen] Required H2s (${requiredH2s.length}): ${requiredH2s.join(" | ")}`);

  // ─── STEP 4: TONE POLISH — full article, auto-continues if cut off ────────────
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
- Count the "Pro Tip:" labels. If there are more than 2, delete the weakest ones and fold those insights naturally into the surrounding prose
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
- Ensure paragraphs are focused: 3-5 sentences each. Merge single-sentence paragraphs. Cut filler and fluff.
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
  if (toneCutOff || toneWords < draftWords * 0.75 || toneMissing.length > draftMissing.length) {
    console.warn(`[content-gen] Tone degraded after continuation attempts. Falling back to draft.`);
    toneToUse = cleanDraft;
  } else {
    toneToUse = cleanTone;
  }

  // ─── STEP 5: SEO OPTIMIZATION — full article, auto-continues if cut off ───────
  await progress("seo", "Optimizing for SEO — keywords, links, structure...");

  // Build a single deduplicated internal link list (one entry per URL)
  const seenUrls = new Set<string>();
  const consolidatedLinks: { anchor: string; url: string }[] = [];
  if (ctx.internalLinks?.length) {
    for (const l of ctx.internalLinks) {
      if (!seenUrls.has(l.url)) { seenUrls.add(l.url); consolidatedLinks.push({ anchor: l.keyword, url: l.url }); }
    }
  }
  if (ctx.existingPosts?.length) {
    for (const p of ctx.existingPosts) {
      if (!seenUrls.has(p.url)) { seenUrls.add(p.url); consolidatedLinks.push({ anchor: p.focusKeyword || p.title, url: p.url }); }
    }
  }

  let internalLinkBlock = "";
  if (consolidatedLinks.length) {
    internalLinkBlock = "\n\n## Internal Links (use each URL AT MOST ONCE — no duplicate links):\n" +
      consolidatedLinks.map((l) => `   - "${l.anchor}" → ${l.url}`).join("\n");
  }
  console.log(`[content-gen] Internal links available for SEO step: ${consolidatedLinks.length} (from internalLinks: ${ctx.internalLinks?.length ?? 0}, existingPosts: ${ctx.existingPosts?.length ?? 0})`);

  const toneToUseWords = countWords(toneToUse);
  const seoRewriteTokens = Math.max(16384, Math.ceil(toneToUseWords * 1.4 * 1.5));

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
${includeFAQ ? `7. Ensure there's a FAQ section at the end with 4-5 common questions (format as proper ## FAQ heading with ### for each question — this helps with Google's FAQ rich snippets)` : "7. Skip FAQ if not present"}
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
13. Keep the article length within the ${targetWords} word range. Do not pad or inflate.
14. READABILITY: Include bullet lists or numbered lists where they genuinely help. Use bold text for key terms. Add blockquotes for expert tips.
15. ENDING: Do NOT add "Final Thoughts", "Conclusion", "Wrapping Up" or any concluding section heading. The article should end naturally.
16. ENTITIES: Ensure related entities (tools, standards, organizations, people, places) are naturally present for semantic richness.

## Blog Post (${toneToUseWords} words):
${toneToUse}

Output ONLY the optimized blog post in Markdown format.
CRITICAL: Output the COMPLETE article with all sections. Do NOT stop early or drop sections. Tighten prose where possible.
CRITICAL: Do NOT repeat the article. Output it exactly ONCE. If you reach the end, STOP.`,
    systemPrompt,
    { temperature: 0.4, maxTokens: seoRewriteTokens },
    "seo-optimize",
    5,
    Math.floor(toneToUseWords * 0.75)
  );

  const cleanSeo = deduplicateContent(seoResult.text);
  const seoWords = countWords(cleanSeo);
  const seoMissing = findMissingSections(cleanSeo, contentSections);
  const toneToUseMissing = findMissingSections(toneToUse, contentSections);
  // Treat SEO output as cut off if it shrank to less than 75% of the input — the model
  // stopped early but happened to end on a clean sentence, so isCutOff() would miss it.
  const seoShrank = seoWords < toneToUseWords * 0.75;
  const seoCutOff = isCutOff(cleanSeo) || seoShrank;
  if (seoShrank) {
    console.warn(`[content-gen] SEO rewrite shrank significantly: ${seoWords} words vs ${toneToUseWords} input — treating as cut off`);
  }
  console.log(`[content-gen] SEO optimize: ${seoWords} words, missing=${seoMissing.length}, cutoff=${seoCutOff}`);

  // Pick the most complete version — prefer SEO, fall back to tone, then draft
  type Candidate = { label: string; content: string; words: number; missing: number; cutoff: boolean };
  const candidates: Candidate[] = [
    { label: "SEO",   content: cleanSeo,   words: seoWords,              missing: seoMissing.length,       cutoff: seoCutOff },
    { label: "tone",  content: toneToUse,  words: toneToUseWords,        missing: toneToUseMissing.length, cutoff: isCutOff(toneToUse) },
    { label: "draft", content: cleanDraft, words: draftWords,            missing: draftMissing.length,     cutoff: draftTruncated || isCutOff(cleanDraft) },
  ];

  // Sort: complete > fewest missing > most words
  candidates.sort((a, b) => {
    if (a.cutoff !== b.cutoff) return a.cutoff ? 1 : -1;
    return a.missing - b.missing || b.words - a.words;
  });

  const best = candidates[0];
  console.log(`[content-gen] Candidate ranking: ${candidates.map(c => `${c.label}(${c.words}w, ${c.missing} missing, cutoff=${c.cutoff})`).join(" > ")}`);
  console.log(`[content-gen] Final version: ${best.label} (${best.words} words, ${best.missing} missing, cutoff=${best.cutoff})`);

  let bestVersion = best.content;

  // Post-process: replace leftover [INTERNAL_LINK: ...] placeholders
  let finalContent = bestVersion;
  if (ctx.internalLinks?.length) {
    finalContent = finalContent.replace(
      /\[INTERNAL_LINK:\s*([^\]]+)\]/gi,
      (_, anchor: string) => {
        const trimmed = anchor.trim().toLowerCase();
        const match = ctx.internalLinks!.find(
          (l) => trimmed.includes(l.keyword.toLowerCase()) || l.keyword.toLowerCase().includes(trimmed)
        );
        return match ? `[${anchor.trim()}](${match.url})` : anchor.trim();
      }
    );
  }

  // If the winning version is NOT the SEO version but we have internal links,
  // inject them directly into the content. The SEO step is the only one that
  // adds links, so when tone/draft wins the ranking the content has zero links.
  // Also run when the SEO version won but no links were actually inserted.
  const existingLinkCount = (finalContent.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || []).length;
  if (consolidatedLinks.length > 0 && (best.label !== "SEO" || existingLinkCount < 3)) {
    console.log(`[content-gen] Injecting internal links post-hoc (version="${best.label}", existing=${existingLinkCount}, available=${consolidatedLinks.length})`);
    const usedUrls = new Set<string>();
    const lines = finalContent.split("\n");
    const linkedLines = new Set<number>();

    // Build search phrases for each link: the anchor, plus keywords from URL path
    type LinkWithPhrases = { anchor: string; url: string; phrases: string[] };
    const linksWithPhrases: LinkWithPhrases[] = consolidatedLinks.map((link) => {
      const phrases: string[] = [];
      // 1. Original anchor (e.g. "professional collision repair")
      phrases.push(link.anchor.toLowerCase());
      // 2. Slug-derived phrase from URL path (e.g. "/collision-repair/" → "collision repair")
      try {
        const pathParts = new URL(link.url).pathname.split("/").filter(Boolean);
        for (const part of pathParts) {
          const slug = part.replace(/-/g, " ").trim();
          if (slug.length >= 4 && slug !== "blog" && slug !== "services") {
            phrases.push(slug);
          }
        }
      } catch { /* not a valid URL */ }
      // 3. Core words from the anchor (drop stop words, match 2+ consecutive content words)
      const stopWords = new Set(["a", "an", "the", "our", "your", "of", "in", "for", "and", "to", "with", "about", "how", "get", "car", "auto"]);
      const coreWords = link.anchor.toLowerCase().split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
      if (coreWords.length >= 2) {
        phrases.push(coreWords.join(" "));
        // Also try pairs of consecutive core words
        for (let k = 0; k < coreWords.length - 1; k++) {
          const pair = `${coreWords[k]} ${coreWords[k + 1]}`;
          if (pair.length >= 8) phrases.push(pair);
        }
      }
      // Deduplicate and sort longest first (prefer more specific matches)
      const unique = [...new Set(phrases)].sort((a, b) => b.length - a.length);
      return { anchor: link.anchor, url: link.url, phrases: unique };
    });

    for (const link of linksWithPhrases) {
      if (usedUrls.size >= Math.min(consolidatedLinks.length, 15)) break;
      const normalizedUrl = link.url.replace(/\/$/, "").toLowerCase();
      if (usedUrls.has(normalizedUrl)) continue;

      let matched = false;
      for (const phrase of link.phrases) {
        if (matched) break;
        // Build a regex that allows up to 1 extra word between each pair of phrase words
        const words = phrase.split(/\s+/).filter(w => w.length > 0);
        const pattern = words.length >= 2
          ? new RegExp(`\\b(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(?:\\s+\\w+)?\\s+")})\\b`, "i")
          : new RegExp(`\\b(${words[0]?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i");

        for (let i = 0; i < lines.length; i++) {
          if (linkedLines.has(i)) continue;
          const line = lines[i];
          if (/^(#{1,6}\s|[-*]\s+\[|!\[|```|<|\|)/.test(line.trim())) continue;
          if (/\[[^\]]+\]\([^)]+\)/.test(line)) continue;
          if (line.trim().length < 20) continue;

          const m = line.match(pattern);
          if (m && m.index !== undefined) {
            const original = m[1] || m[0];
            lines[i] = line.slice(0, m.index) + `[${original}](${link.url})` + line.slice(m.index + original.length);
            usedUrls.add(normalizedUrl);
            linkedLines.add(i);
            matched = true;
            break;
          }
        }
      }
    }

    finalContent = lines.join("\n");
    console.log(`[content-gen] Post-hoc linking injected ${usedUrls.size} internal links`);
  }

  // Post-process: fix broken multi-line links (URL split across 2+ lines by AI)
  // e.g. "[anchor](https://example.\ncom/blog/some-\npath/)" → "[anchor](https://example.com/blog/some-path/)"
  finalContent = finalContent.replace(
    /\[([^\]]+)\]\(([^)]*?)\)/g,
    (full, anchor: string, url: string) => {
      if (!url.includes("\n") && !url.includes("\r")) return full;
      const cleaned = url.replace(/[\r\n]\s*/g, "");
      return `[${anchor}](${cleaned})`;
    }
  );

  // Post-process: reconstruct partial URLs inside markdown links where the AI
  // dropped the protocol+domain (e.g. [text](com/path/) → [text](https://brand.com/path/))
  if (ctx.brandUrl) {
    try {
      const parsedBrand = new URL(ctx.brandUrl);
      const brandOrigin = parsedBrand.origin;
      // Fix links starting with "com/" — the AI dropped "https://domain."
      // e.g. (com/blog/path/) → (https://brand.com/blog/path/)
      finalContent = finalContent.replace(
        /\[([^\]]+)\]\(com\/([^)]*)\)/g,
        (_, anchor: string, path: string) => `[${anchor}](${brandOrigin}/${path})`
      );
      // Fix links with just a relative path (no protocol, no domain)
      // e.g. (blog/some-post/) or (contact-us/) → (https://brand.com/blog/some-post/)
      finalContent = finalContent.replace(
        /\[([^\]]+)\]\((?!https?:\/\/|#|mailto:|tel:|\/)([a-z][a-z0-9-]*(?:\/[a-z0-9._-]+)*\/?)\)/gi,
        (full, anchor: string, path: string) => {
          if (/\.(js|css|png|jpg|gif|svg|pdf|zip|md)$/i.test(path)) return full;
          return `[${anchor}](${brandOrigin}/${path})`;
        }
      );
    } catch { /* brandUrl not parseable */ }
  }

  // Reusable orphan fragment cleanup: masks valid markdown links, strips bare URL fragments
  function cleanOrphanedUrlFragments(text: string): string {
    return text.split("\n").map((line) => {
      const masks: string[] = [];
      const masked = line.replace(/\[[^\]]+\]\([^)]+\)/g, (m) => {
        masks.push(m);
        return `__MDLINK${masks.length - 1}__`;
      });
      // Strip orphaned com/path/) or com/path/ fragments (with or without trailing paren)
      let cleaned = masked.replace(/\s*\bcom\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\/?\)?/gi, "");
      // Strip orphaned protocol stubs like "https://example." left from split URLs
      cleaned = cleaned.replace(/\bhttps?:\/\/[a-z0-9.-]*\.\s*$/gi, "");
      // Strip parenthesized partial URLs like "(com/path/)" as bare text
      cleaned = cleaned.replace(/\(\s*com\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\/?\s*\)/gi, "");
      return cleaned.replace(/__MDLINK(\d+)__/g, (_, i) => masks[parseInt(i)]);
    }).join("\n");
  }

  // Post-process: clean up orphaned URL path fragments (com/path/) anywhere in the text.
  finalContent = cleanOrphanedUrlFragments(finalContent);

  // Clean orphaned "txt " fragments (from split "robots.txt" etc.)
  finalContent = finalContent.replace(
    /(?:^|\n)\s*txt\s+(?=based|blocking|file)/gim,
    "\nrobots.txt "
  );

  // Clean up double spaces and space-before-punctuation left by fragment removal
  finalContent = finalContent.replace(/  +/g, " ");
  finalContent = finalContent.replace(/ ([.,;:!?])/g, "$1");

  // Post-process: strip hallucinated links (URLs not in the provided list)
  const allowedUrls = new Set<string>();
  for (const l of consolidatedLinks) {
    allowedUrls.add(l.url.replace(/\/$/, "").toLowerCase());
  }
  if (ctx.ctaUrl) {
    allowedUrls.add(ctx.ctaUrl.replace(/\/$/, "").toLowerCase());
  }
  // Also allow TOC anchor links (#section-slug) and the brand URL
  const brandHost = ctx.brandUrl ? new URL(ctx.brandUrl).hostname : "";

  if (consolidatedLinks.length > 0) {
    finalContent = finalContent.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (fullMatch, anchor: string, url: string) => {
        // Allow anchor links (TOC)
        if (url.startsWith("#")) return fullMatch;
        // Allow links that are in our approved list
        const normalizedUrl = url.replace(/\/$/, "").toLowerCase();
        if (allowedUrls.has(normalizedUrl)) return fullMatch;
        // Allow external links (not on our domain)
        try {
          const linkHost = new URL(url).hostname;
          if (brandHost && linkHost !== brandHost) return fullMatch;
        } catch {
          // Not a valid URL — strip it
        }
        // This is a hallucinated internal link — remove it, keep anchor text
        console.log(`[content-gen] Stripped hallucinated link: ${url}`);
        return anchor;
      }
    );
  } else {
    // No internal links provided — strip ALL internal-looking links (same domain)
    finalContent = finalContent.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (fullMatch, anchor: string, url: string) => {
        if (url.startsWith("#")) return fullMatch;
        try {
          const linkHost = new URL(url).hostname;
          if (brandHost && linkHost === brandHost) {
            console.log(`[content-gen] Stripped hallucinated link (no approved list): ${url}`);
            return anchor;
          }
        } catch {
          // Not a valid URL — keep as is
        }
        return fullMatch;
      }
    );
  }

  // Post-process: remove excessive duplicate links (allow each URL up to 2 times)
  const linkedUrlCounts = new Map<string, number>();
  finalContent = finalContent.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (fullMatch, anchor: string, url: string) => {
      if (url.startsWith("#")) return fullMatch;
      const normalizedUrl = url.replace(/\/$/, "").toLowerCase();
      const count = linkedUrlCounts.get(normalizedUrl) || 0;
      if (count >= 2) {
        return anchor;
      }
      linkedUrlCounts.set(normalizedUrl, count + 1);
      return fullMatch;
    }
  );

  // Post-process (second pass): clean up orphaned URL fragments created by link stripping above
  finalContent = cleanOrphanedUrlFragments(finalContent);

  // Clean up double spaces and space-before-punctuation left by fragment removal
  finalContent = finalContent.replace(/  +/g, " ");
  finalContent = finalContent.replace(/ ([.,;:!?])/g, "$1");

  // Post-process: ensure TOC entries are proper clickable anchor links
  finalContent = (() => {
    // Step 1: Join broken multi-line TOC links before line-by-line processing.
    // The AI sometimes wraps long headings like:
    //   - [How to Choose Between N8N, Make, and
    //   Zapier as a Beginner](#slug)
    // We rejoin these into single lines.
    finalContent = finalContent.replace(
      /^(\s*[-*]\s+\[[^\]]*)\n\s*([^\n]*?\]\(#[^)]+\))/gm,
      "$1 $2"
    );

    // Step 2: Fix orphaned link tails like "Zapier as a Beginner](#slug)" on their own line
    // These are remnants of broken multi-line links that weren't caught above
    finalContent = finalContent.replace(
      /^\s*[^-*#\s][^\n]*\]\(#[^)]+\)\s*$/gm,
      ""
    );

    // Step 3: Remove duplicate TOC blocks — keep only the first "## Table of Contents"
    let tocCount = 0;
    const dedupedLines: string[] = [];
    let skippingDupToc = false;
    for (const line of finalContent.split("\n")) {
      if (/^#{1,3}\s+table of contents/i.test(line)) {
        tocCount++;
        if (tocCount > 1) { skippingDupToc = true; continue; }
        skippingDupToc = false;
      }
      if (skippingDupToc) {
        if (/^#{1,3}\s/.test(line) && !/table of contents/i.test(line)) {
          skippingDupToc = false;
        } else if (/^\s*[-*]\s/.test(line) || line.trim() === "") {
          continue;
        } else {
          skippingDupToc = false;
        }
      }
      dedupedLines.push(line);
    }
    const lines = dedupedLines;

    // Step 4: Build heading text → slug map from actual H2/H3 headings
    const headingToSlug = new Map<string, string>();
    const slugToHeading = new Map<string, string>();
    for (const line of lines) {
      const h = line.match(/^(#{2,3})\s+(.+)$/);
      if (!h) continue;
      const text = h[2].trim();
      if (/^table of contents$/i.test(text)) continue;
      const slug = text.toLowerCase().replace(/[`*_[\]()]/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
      headingToSlug.set(text.toLowerCase(), slug);
      slugToHeading.set(slug, text);
    }

    // Step 5: Fix TOC entries — ensure all are clickable anchor links
    let inToc = false;
    return lines.map((line) => {
      if (/^#{1,3}\s+table of contents/i.test(line)) { inToc = true; return line; }
      if (inToc && /^#{1,3}\s/.test(line) && !/table of contents/i.test(line)) { inToc = false; return line; }

      if (!inToc) return line;

      // Already a proper link — fix the label if needed
      const tocLink = line.match(/^(\s*[-*]\s+\[)([^\]]+)(\]\(#)([^)]+)(\))/);
      if (tocLink) {
        const slug = tocLink[4];
        const correctText = slugToHeading.get(slug);
        if (correctText && correctText !== tocLink[2]) {
          return `${tocLink[1]}${correctText}${tocLink[3]}${slug}${tocLink[5]}`;
        }
        return line;
      }

      // Plain text TOC entry (no link) — convert to anchor link
      const plainEntry = line.match(/^(\s*[-*]\s+)(.+)$/);
      if (plainEntry) {
        const indent = plainEntry[1];
        const entryText = plainEntry[2].trim();
        const entryLower = entryText.toLowerCase();
        let bestSlug = "";
        let bestHeading = entryText;
        for (const [headingLower, slug] of headingToSlug) {
          if (headingLower === entryLower || headingLower.includes(entryLower) || entryLower.includes(headingLower)) {
            bestSlug = slug;
            bestHeading = slugToHeading.get(slug) || entryText;
            break;
          }
        }
        if (!bestSlug) {
          bestSlug = entryText.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
        }
        return `${indent}[${bestHeading}](#${bestSlug})`;
      }

      return line;
    }).join("\n");
  })();

  // Post-process: break overly long paragraphs (>80 words / ~5-6 lines) for readability
  function splitLongParagraphs(text: string): string {
    return text
      .split("\n\n")
      .flatMap((block) => {
        const trimmed = block.trim();
        if (/^(#{1,6}\s|[-*]\s|\d+\.\s|!\[|```|<|\||\*\*Pro Tip|>)/.test(trimmed)) return [block];
        const words = trimmed.split(/\s+/);
        if (words.length <= 60) return [block];
        const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s|$)/g);
        if (!sentences || sentences.length < 2) return [block];
        const chunks: string[] = [];
        let current: string[] = [];
        let currentWordCount = 0;
        for (const sentence of sentences) {
          const sentenceWords = sentence.trim().split(/\s+/).length;
          if (currentWordCount + sentenceWords > 50 && current.length > 0) {
            chunks.push(current.join("").trim());
            current = [];
            currentWordCount = 0;
          }
          current.push(sentence);
          currentWordCount += sentenceWords;
        }
        if (current.length > 0) chunks.push(current.join("").trim());
        return chunks.filter(c => c.length > 0);
      })
      .join("\n\n");
  }
  finalContent = splitLongParagraphs(finalContent);

  // Post-process: limit brand mentions to max 3 occurrences
  if (ctx.brandName && ctx.brandName.length > 2) {
    let brandCount = 0;
    const brandRegex = new RegExp(ctx.brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    finalContent = finalContent.replace(brandRegex, (match) => {
      brandCount++;
      if (brandCount <= 3) return match;
      return "";
    });
    // Clean up empty sentences left behind (e.g. " is family-owned..." → remove whole sentence)
    finalContent = finalContent.replace(/\.\s*is\s[^.]*\./g, ".");
    finalContent = finalContent.replace(/\n\s*\n\s*\n/g, "\n\n");
    if (brandCount > 3) {
      console.log(`[content-gen] Trimmed brand mentions from ${brandCount} to 3`);
    }
  }

  // Post-process: deduplicate repeated first-person phrases
  const firstPersonPhrases = [
    "from my experience", "in my experience", "in my testing",
    "i've found that", "i have found that", "what i noticed",
    "after working with", "i've seen", "i have seen",
    "i always", "i recently", "i regularly",
  ];
  for (const phrase of firstPersonPhrases) {
    const phraseRegex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    let count = 0;
    finalContent = finalContent.replace(phraseRegex, (match) => {
      count++;
      if (count <= 1) return match;
      // Replace subsequent occurrences with neutral alternatives
      const neutrals = ["Based on industry data,", "Evidence shows", "In practice,", "Research indicates", "The data confirms"];
      return neutrals[count % neutrals.length];
    });
  }

  // Final safety-net: one last pass to catch any bare com/path/ or (com/path/) text
  // that survived all previous post-processing steps
  finalContent = cleanOrphanedUrlFragments(finalContent);
  finalContent = finalContent.replace(/  +/g, " ");
  finalContent = finalContent.replace(/ ([.,;:!?])/g, "$1");
  finalContent = finalContent.replace(/\n\s*\n\s*\n/g, "\n\n");

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

  const metadata = await generateJSON<MetadataResult>(
    `Generate SEO metadata and social media captions for this blog post about "${keyword}" for ${ctx.brandName} (${ctx.brandUrl}).

## Blog Post:
${finalContent.substring(0, 3000)}

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

  // ─── STEP 7: IMAGE GENERATION (1 featured + 2 inline) ──────────────
  let featuredImageUrl: string | undefined;
  let featuredImageAlt = metadata.featuredImageAlt || keyword;
  const postSlug = metadata.slug || slugify(outline.title);

  if (includeImages && process.env.GOOGLE_AI_API_KEY) {
    await progress("image", "Generating featured image + 2 inline images…");

    // 1) Featured image
    try {
      const featPrompt = `Create an image that directly represents the concept of "${keyword}" for a ${ctx.niche} business. The image should clearly relate to "${outline.title}". No text, words, letters, or watermarks.`;
      featuredImageUrl = await generateBlogImage(
        featPrompt,
        `${postSlug}-featured`,
        website.id,
        outline.title,
        keyword,
        ctx.niche,
        "fast",
      );
      featuredImageAlt = metadata.featuredImageAlt || `${keyword} - ${outline.title}`;
      console.log(`[content-gen] Featured image generated: ${featuredImageUrl}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error(`[content-gen] Featured image generation failed: ${reason}`);
      featuredImageUrl = undefined;
      (options as Record<string, unknown>)._imageError = reason;
    }

    // 2) Inline images — insert after the 2nd and 4th H2 sections
    const h2Regex = /^## .+$/gm;
    const h2Matches: { index: number; text: string }[] = [];
    let h2Match;
    while ((h2Match = h2Regex.exec(finalContent)) !== null) {
      h2Matches.push({ index: h2Match.index, text: h2Match[0] });
    }

    // Pick insertion points: after ~33% and ~66% of content sections
    const insertAfterIndices = h2Matches.length >= 4
      ? [1, 3]
      : h2Matches.length >= 2
        ? [0, Math.min(1, h2Matches.length - 1)]
        : [];

    for (let imgIdx = 0; imgIdx < insertAfterIndices.length; imgIdx++) {
      const sectionIdx = insertAfterIndices[imgIdx];
      const sectionHeading = h2Matches[sectionIdx]?.text?.replace(/^## /, "") || keyword;

      try {
        const inlinePrompt = `Create a photorealistic image for the section "${sectionHeading}" of a blog post about "${keyword}" in ${ctx.niche}. Must look like a real photograph, not a cartoon or illustration. No text or words.`;
        const inlineUrl = await generateInlineImage(
          inlinePrompt,
          postSlug,
          imgIdx + 1,
          website.id,
          keyword,
          ctx.niche,
        );

        // Find the end of this section (next H2 or end of content) and insert image after first paragraph
        const sectionStart = h2Matches[sectionIdx].index;
        const nextH2 = h2Matches[sectionIdx + 1]?.index ?? finalContent.length;
        const sectionContent = finalContent.slice(sectionStart, nextH2);
        // Insert after the first paragraph break in this section
        const firstParaBreak = sectionContent.indexOf("\n\n", sectionContent.indexOf("\n") + 1);
        if (firstParaBreak > 0) {
          const insertPos = sectionStart + firstParaBreak;
          const imgAlt = `${sectionHeading} - ${keyword}`;
          const imgMarkdown = `\n\n![${imgAlt}](${inlineUrl})\n`;
          finalContent = finalContent.slice(0, insertPos) + imgMarkdown + finalContent.slice(insertPos);
          // Shift subsequent H2 match indices to account for inserted text
          const shift = imgMarkdown.length;
          for (let j = sectionIdx + 1; j < h2Matches.length; j++) {
            h2Matches[j].index += shift;
          }
          console.log(`[content-gen] Inline image ${imgIdx + 1} inserted after "${sectionHeading}"`);
        }
      } catch (err) {
        console.warn(`[content-gen] Inline image ${imgIdx + 1} failed:`, err instanceof Error ? err.message : err);
      }
    }
  } else if (includeImages) {
    const reason = !process.env.GOOGLE_AI_API_KEY
      ? "GOOGLE_AI_API_KEY not configured"
      : "B2 storage not configured";
    console.warn(`[content-gen] Skipping image generation: ${reason}`);
    (options as Record<string, unknown>)._imageError = reason;
  }

  // ─── FINAL: ASSEMBLE ─────────────────────────────────────────────
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

  // Reset model override after generation completes
  setModelOverride(null);
}
