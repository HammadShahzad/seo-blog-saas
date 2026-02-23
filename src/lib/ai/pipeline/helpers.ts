import type { WebsiteContext } from "./types";

export function getImageStyle(niche: string): string {
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

export function buildSystemPrompt(ctx: WebsiteContext): string {
  const styleGuidance = ctx.writingStyle && WRITING_STYLE_GUIDANCE[ctx.writingStyle]
    ? WRITING_STYLE_GUIDANCE[ctx.writingStyle]
    : null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let prompt = `You are a professional blog writer for ${ctx.brandName} (${ctx.brandUrl}).
${ctx.brandName} is a ${ctx.description}.
Your target audience is: ${ctx.targetAudience}
Writing tone: ${ctx.tone}${styleGuidance ? `\nWriting style: ${ctx.writingStyle} — ${styleGuidance}` : ""}
Niche: ${ctx.niche}
Today's date: ${currentDate}. The current year is ${currentYear}.
CRITICAL YEAR RULE: The current year is ${currentYear}. NEVER reference ${currentYear - 1} as the current year. If mentioning a year in a title, heading, or "guide for [year]" context, it MUST be ${currentYear}. All data, statistics, and references should be ${currentYear} unless citing a specific historical event. Replace any instinct to write "${currentYear - 1}" with "${currentYear}".
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
- Never use em-dash characters, use commas or periods instead
- Do NOT start sentences with "So," or "Well,"
- Avoid overly formal transitions like "Furthermore," "Moreover," "Additionally"`;

  if (ctx.existingPosts?.length) {
    prompt += `\n- When relevant, link to existing blog articles on the site (links will be provided in the SEO optimization step)`;
  }

  return prompt;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function countWords(text: string): number {
  const stripped = text
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/\[[^\]]*\]\([^)]+\)/g, (m) => m.replace(/\]\([^)]+\)/, "]"));
  return stripped.split(/\s+/).filter(Boolean).length;
}

export function deduplicateContent(text: string): string {
  const lines = text.split("\n");
  if (lines.length < 10) return text;

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

  const trimmed = text.trimEnd();
  const stubMatch = trimmed.match(/([\s\S]*?)\n##\s*$/);
  if (stubMatch) {
    console.log(`[content-gen] Stripped orphaned heading stub at end`);
    return stubMatch[1].trimEnd();
  }

  return text;
}

export function isCutOff(content: string): boolean {
  if (!content) return true;
  const trimmed = content.trim();
  if (trimmed.length === 0) return true;
  const lastLine = trimmed.split("\n").pop()?.trim() || "";
  if (/^[-*]\s/.test(lastLine) || /^\d+\.\s/.test(lastLine)) return false;
  if (/^#{1,6}\s/.test(lastLine)) return false;
  const validEndings = [".", "!", "?", '"', "'", "\u201D", "\u2019", ")", "]", ">", "*", "`"];
  return !validEndings.includes(trimmed.slice(-1));
}

export function findMissingSections(content: string, sections: { heading: string }[]): string[] {
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
