import { generateTextWithMeta } from "../gemini";
import { countWords, isCutOff } from "./helpers";

/**
 * Run a generation and automatically continue if the model stops mid-sentence.
 * Preserves full context — the original prompt is used for the first call;
 * subsequent calls ask the model to continue from the tail of the accumulated text.
 */
export async function generateWithContinuation(
  prompt: string,
  sysPrompt: string,
  options: { temperature: number; maxTokens: number; model?: string },
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
    const remainingTokens = Math.max(2048, options.maxTokens - Math.ceil(countWords(accumulated) * 1.4));

    const contResult = await generateTextWithMeta(
      `A blog post was being written but the output was cut off. Continue writing from exactly where it stopped.
${belowMin ? `\nThe article so far is only ${currentWords} words. It needs to be at least ${minWords} words. There is significant content still missing.\n` : ""}
Here is the tail end of the article so far — do NOT repeat this content:
---
${contextTail}
---

Continue the article from the very next word. Maintain the same writing style, tone, Markdown formatting, and heading structure. Do not add any introduction, preamble, or explanation. Just continue seamlessly.`,
      sysPrompt,
      { temperature: options.temperature, maxTokens: remainingTokens, model: options.model }
    );

    const contText = contResult.text.trim();
    if (!contText) break;

    const accLower = accumulated.toLowerCase();
    const contLower = contText.toLowerCase();
    let restartSkip = 0;
    if (accLower.slice(0, 200) === contLower.slice(0, 200)) {
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

  const finalCutOff = isCutOff(accumulated);
  const finalBelowMin = minWords > 0 && countWords(accumulated) < minWords;

  return {
    text: accumulated,
    truncated: finalCutOff || finalBelowMin,
    finishReason: finalCutOff || finalBelowMin ? "INCOMPLETE" : "STOP",
    promptTokens: result.promptTokens,
    outputTokens: result.outputTokens,
  };
}
