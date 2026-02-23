import type { WebsiteContext } from "./types";
import { countWords, findMissingSections, isCutOff } from "./helpers";

interface ConsolidatedLink {
  anchor: string;
  url: string;
}

function cleanOrphanedUrlFragments(text: string): string {
  return text.split("\n").map((line) => {
    const masks: string[] = [];
    const masked = line.replace(/\[[^\]]+\]\([^)]+\)/g, (m) => {
      masks.push(m);
      return `__MDLINK${masks.length - 1}__`;
    });
    let cleaned = masked.replace(/\s*\bcom\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\/?\)?/gi, "");
    cleaned = cleaned.replace(/\bhttps?:\/\/[a-z0-9.-]*\.\s*$/gi, "");
    cleaned = cleaned.replace(/\(\s*com\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\/?\s*\)/gi, "");
    return cleaned.replace(/__MDLINK(\d+)__/g, (_, i) => masks[parseInt(i)]);
  }).join("\n");
}

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

/**
 * Picks the best version across SEO / tone / draft by completeness, then applies
 * all post-processing fixes (link repair, orphan cleanup, TOC, brand/first-person limiting).
 */
export function postProcess(
  candidates: { label: string; content: string; words: number; missing: number; cutoff: boolean }[],
  ctx: WebsiteContext,
  consolidatedLinks: ConsolidatedLink[],
  contentSections: { heading: string }[]
): string {
  candidates.sort((a, b) => {
    if (a.cutoff !== b.cutoff) return a.cutoff ? 1 : -1;
    return a.missing - b.missing || b.words - a.words;
  });

  const best = candidates[0];
  console.log(`[content-gen] Candidate ranking: ${candidates.map(c => `${c.label}(${c.words}w, ${c.missing} missing, cutoff=${c.cutoff})`).join(" > ")}`);
  console.log(`[content-gen] Final version: ${best.label} (${best.words} words, ${best.missing} missing, cutoff=${best.cutoff})`);

  let finalContent = best.content;

  // Replace leftover [INTERNAL_LINK: ...] placeholders
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

  // Inject internal links post-hoc when the winning version has none
  const existingLinkCount = (finalContent.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || []).length;
  if (consolidatedLinks.length > 0 && (best.label !== "SEO" || existingLinkCount < 3)) {
    finalContent = injectInternalLinks(finalContent, consolidatedLinks);
  }

  // Fix broken multi-line links
  finalContent = finalContent.replace(
    /\[([^\]]+)\]\(([^)]*?)\)/g,
    (full, anchor: string, url: string) => {
      if (!url.includes("\n") && !url.includes("\r")) return full;
      const cleaned = url.replace(/[\r\n]\s*/g, "");
      return `[${anchor}](${cleaned})`;
    }
  );

  // Reconstruct partial URLs
  if (ctx.brandUrl) {
    try {
      const parsedBrand = new URL(ctx.brandUrl);
      const brandOrigin = parsedBrand.origin;
      finalContent = finalContent.replace(
        /\[([^\]]+)\]\(com\/([^)]*)\)/g,
        (_, anchor: string, path: string) => `[${anchor}](${brandOrigin}/${path})`
      );
      finalContent = finalContent.replace(
        /\[([^\]]+)\]\((?!https?:\/\/|#|mailto:|tel:|\/)([a-z][a-z0-9-]*(?:\/[a-z0-9._-]+)*\/?)\)/gi,
        (full, anchor: string, path: string) => {
          if (/\.(js|css|png|jpg|gif|svg|pdf|zip|md)$/i.test(path)) return full;
          return `[${anchor}](${brandOrigin}/${path})`;
        }
      );
    } catch { /* brandUrl not parseable */ }
  }

  finalContent = cleanOrphanedUrlFragments(finalContent);

  // Clean orphaned "txt " fragments
  finalContent = finalContent.replace(
    /(?:^|\n)\s*txt\s+(?=based|blocking|file)/gim,
    "\nrobots.txt "
  );

  finalContent = finalContent.replace(/  +/g, " ");
  finalContent = finalContent.replace(/ ([.,;:!?])/g, "$1");

  // Strip hallucinated links
  finalContent = stripHallucinatedLinks(finalContent, ctx, consolidatedLinks);

  // Remove excessive duplicate links (allow each URL up to 2 times)
  const linkedUrlCounts = new Map<string, number>();
  finalContent = finalContent.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (fullMatch, anchor: string, url: string) => {
      if (url.startsWith("#")) return fullMatch;
      const normalizedUrl = url.replace(/\/$/, "").toLowerCase();
      const count = linkedUrlCounts.get(normalizedUrl) || 0;
      if (count >= 2) return anchor;
      linkedUrlCounts.set(normalizedUrl, count + 1);
      return fullMatch;
    }
  );

  // Second orphan cleanup pass
  finalContent = cleanOrphanedUrlFragments(finalContent);
  finalContent = finalContent.replace(/  +/g, " ");
  finalContent = finalContent.replace(/ ([.,;:!?])/g, "$1");

  // Fix TOC
  finalContent = fixTableOfContents(finalContent);

  // Split long paragraphs
  finalContent = splitLongParagraphs(finalContent);

  // Limit brand mentions to max 3
  if (ctx.brandName && ctx.brandName.length > 2) {
    let brandCount = 0;
    const brandRegex = new RegExp(ctx.brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    finalContent = finalContent.replace(brandRegex, (match) => {
      brandCount++;
      if (brandCount <= 3) return match;
      return "the platform";
    });
    finalContent = finalContent.replace(/\n\s*\n\s*\n/g, "\n\n");
    if (brandCount > 3) console.log(`[content-gen] Trimmed brand mentions from ${brandCount} to 3`);
  }

  // Deduplicate first-person phrases
  const firstPersonPhrases = [
    "from my experience", "in my experience", "in my testing",
    "i've found that", "i have found that", "what i noticed",
    "after working with", "i've seen", "i have seen",
    "i always", "i recently", "i regularly",
  ];
  let totalFirstPerson = 0;
  for (const phrase of firstPersonPhrases) {
    const phraseRegex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    finalContent = finalContent.replace(phraseRegex, (match) => {
      totalFirstPerson++;
      if (totalFirstPerson <= 4) return match;
      return "";
    });
  }
  finalContent = finalContent.replace(/\s{2,}/g, " ");

  // Fix outdated year references — replace last year with current year in titles/headings/guides
  finalContent = fixOutdatedYears(finalContent);

  // Final safety-net orphan cleanup
  finalContent = cleanOrphanedUrlFragments(finalContent);
  finalContent = finalContent.replace(/  +/g, " ");
  finalContent = finalContent.replace(/ ([.,;:!?])/g, "$1");
  finalContent = finalContent.replace(/\n\s*\n\s*\n/g, "\n\n");

  return finalContent;
}

function injectInternalLinks(content: string, consolidatedLinks: ConsolidatedLink[]): string {
  const usedUrls = new Set<string>();
  const lines = content.split("\n");
  const linkedLines = new Set<number>();

  type LinkWithPhrases = { anchor: string; url: string; phrases: string[] };
  const linksWithPhrases: LinkWithPhrases[] = consolidatedLinks.map((link) => {
    const phrases: string[] = [];
    phrases.push(link.anchor.toLowerCase());
    try {
      const pathParts = new URL(link.url).pathname.split("/").filter(Boolean);
      for (const part of pathParts) {
        const slug = part.replace(/-/g, " ").trim();
        if (slug.length >= 4 && slug !== "blog" && slug !== "services") phrases.push(slug);
      }
    } catch { /* not a valid URL */ }
    const stopWords = new Set(["a", "an", "the", "our", "your", "of", "in", "for", "and", "to", "with", "about", "how", "get", "car", "auto"]);
    const coreWords = link.anchor.toLowerCase().split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
    if (coreWords.length >= 2) {
      phrases.push(coreWords.join(" "));
      for (let k = 0; k < coreWords.length - 1; k++) {
        const pair = `${coreWords[k]} ${coreWords[k + 1]}`;
        if (pair.length >= 8) phrases.push(pair);
      }
    }
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

  console.log(`[content-gen] Post-hoc linking injected ${usedUrls.size} internal links`);
  return lines.join("\n");
}

function stripHallucinatedLinks(content: string, ctx: WebsiteContext, consolidatedLinks: ConsolidatedLink[]): string {
  const allowedUrls = new Set<string>();
  for (const l of consolidatedLinks) allowedUrls.add(l.url.replace(/\/$/, "").toLowerCase());
  if (ctx.ctaUrl) allowedUrls.add(ctx.ctaUrl.replace(/\/$/, "").toLowerCase());
  let brandHost = "";
  try { if (ctx.brandUrl) brandHost = new URL(ctx.brandUrl).hostname; } catch { /* malformed brandUrl */ }

  if (consolidatedLinks.length > 0) {
    content = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (fullMatch, anchor: string, url: string) => {
        if (url.startsWith("#")) return fullMatch;
        const normalizedUrl = url.replace(/\/$/, "").toLowerCase();
        if (allowedUrls.has(normalizedUrl)) return fullMatch;
        try {
          const linkHost = new URL(url).hostname;
          if (brandHost && linkHost !== brandHost) return fullMatch;
        } catch { /* Not a valid URL — strip it */ }
        console.log(`[content-gen] Stripped hallucinated link: ${url}`);
        return anchor;
      }
    );
  } else {
    content = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (fullMatch, anchor: string, url: string) => {
        if (url.startsWith("#")) return fullMatch;
        try {
          const linkHost = new URL(url).hostname;
          if (brandHost && linkHost === brandHost) {
            console.log(`[content-gen] Stripped hallucinated link (no approved list): ${url}`);
            return anchor;
          }
        } catch { /* Not a valid URL — keep as is */ }
        return fullMatch;
      }
    );
  }
  return content;
}

function fixOutdatedYears(content: string): string {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const lastYearStr = String(lastYear);
  const currentYearStr = String(currentYear);

  return content.split("\n").map((line) => {
    if (/^#{1,6}\s/.test(line)) {
      return line.replace(new RegExp(lastYearStr, "g"), currentYearStr);
    }

    const yearContextPattern = new RegExp(
      `((?:in|for|of|guide|edition|update|best|top|latest|review|trends|strategies|tips|framework|playbook|roadmap|checklist|report)\\s+)${lastYearStr}\\b` +
      `|\\b${lastYearStr}(\\s+(?:guide|edition|update|best|tips|trends|strategies|framework|playbook|roadmap|report|review|checklist))`,
      "gi"
    );
    return line.replace(yearContextPattern, (match) =>
      match.replace(lastYearStr, currentYearStr)
    );
  }).join("\n");
}

function fixTableOfContents(content: string): string {
  // Join broken multi-line TOC links
  content = content.replace(
    /^(\s*[-*]\s+\[[^\]]*)\n\s*([^\n]*?\]\(#[^)]+\))/gm,
    "$1 $2"
  );

  // Fix orphaned link tails
  content = content.replace(
    /^\s*[^-*#\s][^\n]*\]\(#[^)]+\)\s*$/gm,
    ""
  );

  // Remove duplicate TOC blocks
  let tocCount = 0;
  const dedupedLines: string[] = [];
  let skippingDupToc = false;
  for (const line of content.split("\n")) {
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

  // Build heading → slug map
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

  // Fix TOC entries
  let inToc = false;
  return lines.map((line) => {
    if (/^#{1,3}\s+table of contents/i.test(line)) { inToc = true; return line; }
    if (inToc && /^#{1,3}\s/.test(line) && !/table of contents/i.test(line)) { inToc = false; return line; }
    if (!inToc) return line;

    const tocLink = line.match(/^(\s*[-*]\s+\[)([^\]]+)(\]\(#)([^)]+)(\))/);
    if (tocLink) {
      const slug = tocLink[4];
      const correctText = slugToHeading.get(slug);
      if (correctText && correctText !== tocLink[2]) {
        return `${tocLink[1]}${correctText}${tocLink[3]}${slug}${tocLink[5]}`;
      }
      return line;
    }

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
}
