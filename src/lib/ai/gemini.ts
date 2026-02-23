/**
 * AI Client — routes to Gemini or Claude based on model name.
 * All content generation imports from this single file.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { claudeGenerateTextWithMeta, claudeGenerateText, claudeGenerateJSON } from "./claude";

let _genAI: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!_genAI) {
    let apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not configured");
    apiKey = apiKey.replace(/\\n/g, "").trim();
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

const DEFAULT_MODEL = "gemini-3.1-pro-preview";

let _modelOverride: string | null = null;
export function setModelOverride(model: string | null) {
  _modelOverride = model;
}

function isClaudeModel(model: string): boolean {
  return model.startsWith("claude-");
}

function resolveModel(options?: { model?: string }): string {
  return options?.model || _modelOverride || DEFAULT_MODEL;
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number, label: string): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = err instanceof Error ? err.message : String(err);
      const isRetryable = status === 429 || status === 500 || status === 503 ||
        message.includes("ECONNRESET") || message.includes("timeout") || message.includes("network");
      if (!isRetryable || attempt === maxRetries) throw err;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      console.warn(`[${label}] Attempt ${attempt} failed (${status || message.slice(0, 80)}), retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("withRetry: unreachable");
}

function repairJSON(text: string): string {
  let cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const jsonMatch = cleaned.match(/(\{[\s\S]*\})/);
    if (jsonMatch) cleaned = jsonMatch[1];
  }
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
  return cleaned;
}

export interface GenerateTextResult {
  text: string;
  finishReason: string;
  promptTokens: number;
  outputTokens: number;
  truncated: boolean;
}

export async function generateText(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<string> {
  const result = await generateTextWithMeta(prompt, systemPrompt, options);
  return result.text;
}

export async function generateTextWithMeta(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<GenerateTextResult> {
  const modelName = resolveModel(options);

  if (isClaudeModel(modelName)) {
    return claudeGenerateTextWithMeta(prompt, systemPrompt, { ...options, model: modelName });
  }

  const genAI = getGemini();
  const maxTokens = options?.maxTokens ?? 8192;
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: maxTokens,
    },
  });

  const result = await withRetry(() => model.generateContent(prompt), 3, `gemini:${modelName}`);
  const response = result.response;
  const text = response.text();
  const candidate = response.candidates?.[0];
  const finishReason = candidate?.finishReason || "UNKNOWN";
  const usage = response.usageMetadata;
  const promptTokens = usage?.promptTokenCount ?? 0;
  const outputTokens = usage?.candidatesTokenCount ?? 0;
  const truncated = finishReason === "MAX_TOKENS";

  if (truncated) {
    console.warn(`[gemini] Response truncated (MAX_TOKENS). Output: ${outputTokens}/${maxTokens} tokens, ~${text.split(/\s+/).length} words`);
  }
  if (finishReason === "SAFETY" || finishReason === "RECITATION") {
    console.error(`[gemini] Response blocked: ${finishReason}. Got ${text.length} chars.`);
    if (text.length > 100) return { text, finishReason, promptTokens, outputTokens, truncated: true };
    throw new Error(`[gemini] Response blocked by ${finishReason} filter with insufficient content (${text.length} chars)`);
  }

  return { text, finishReason, promptTokens, outputTokens, truncated };
}

export async function generateJSON<T>(
  prompt: string,
  systemPrompt?: string,
  options?: { model?: string }
): Promise<T> {
  const modelName = resolveModel(options);

  if (isClaudeModel(modelName)) {
    return claudeGenerateJSON<T>(prompt, systemPrompt);
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    const text = await generateText(
      prompt + "\n\nRespond with valid JSON only. No markdown code blocks.",
      systemPrompt,
      { temperature: 0.3, model: modelName }
    );

    try {
      return JSON.parse(repairJSON(text)) as T;
    } catch {
      if (attempt === 3) {
        console.error(`[gemini] JSON parse failed after 3 attempts. Raw: ${text.slice(0, 500)}`);
        throw new Error(`Failed to parse JSON from AI response after 3 attempts`);
      }
      console.warn(`[gemini] JSON parse attempt ${attempt} failed, retrying generation...`);
    }
  }
  throw new Error("generateJSON: unreachable");
}
