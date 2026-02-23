/**
 * Claude AI Client
 * Handles Anthropic Claude API interactions, matching the same interface as gemini.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import type { GenerateTextResult } from "./gemini";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
    _client = new Anthropic({ apiKey: apiKey.trim() });
  }
  return _client;
}

const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number, label: string): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = err instanceof Error ? err.message : String(err);
      const isRetryable = status === 429 || status === 500 || status === 503 || status === 529 ||
        message.includes("ECONNRESET") || message.includes("timeout") || message.includes("overloaded");
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

export async function claudeGenerateTextWithMeta(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<GenerateTextResult> {
  const client = getClient();
  const modelName = options?.model || DEFAULT_CLAUDE_MODEL;
  const maxTokens = options?.maxTokens ?? 8192;

  const response = await withRetry(
    () => client.messages.create({
      model: modelName,
      max_tokens: maxTokens,
      temperature: options?.temperature ?? 0.7,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: [{ role: "user", content: prompt }],
    }),
    3,
    `claude:${modelName}`
  );

  const textBlocks = response.content.filter((b) => b.type === "text");
  const text = textBlocks.map((b) => b.text).join("");

  const finishReason = response.stop_reason === "end_turn" ? "STOP" : response.stop_reason === "max_tokens" ? "MAX_TOKENS" : (response.stop_reason || "UNKNOWN");
  const truncated = response.stop_reason === "max_tokens";
  const promptTokens = response.usage?.input_tokens ?? 0;
  const outputTokens = response.usage?.output_tokens ?? 0;

  if (truncated) {
    console.warn(`[claude] Response truncated (max_tokens). Output: ${outputTokens}/${maxTokens} tokens, ~${text.split(/\s+/).length} words`);
  }

  return { text, finishReason, promptTokens, outputTokens, truncated };
}

export async function claudeGenerateText(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<string> {
  const result = await claudeGenerateTextWithMeta(prompt, systemPrompt, options);
  return result.text;
}

export async function claudeGenerateJSON<T>(
  prompt: string,
  systemPrompt?: string
): Promise<T> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const text = await claudeGenerateText(
      prompt + "\n\nRespond with valid JSON only. No markdown code blocks.",
      systemPrompt,
      { temperature: 0.3 }
    );

    try {
      return JSON.parse(repairJSON(text)) as T;
    } catch {
      if (attempt === 3) {
        console.error(`[claude] JSON parse failed after 3 attempts. Raw: ${text.slice(0, 500)}`);
        throw new Error(`Failed to parse JSON from Claude after 3 attempts`);
      }
      console.warn(`[claude] JSON parse attempt ${attempt} failed, retrying generation...`);
    }
  }
  throw new Error("claudeGenerateJSON: unreachable");
}
