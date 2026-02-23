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

const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function claudeGenerateTextWithMeta(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<GenerateTextResult> {
  const client = getClient();
  const modelName = options?.model || DEFAULT_CLAUDE_MODEL;
  const maxTokens = options?.maxTokens ?? 8192;

  const response = await client.messages.create({
    model: modelName,
    max_tokens: maxTokens,
    temperature: options?.temperature ?? 0.7,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    messages: [{ role: "user", content: prompt }],
  });

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
  const text = await claudeGenerateText(
    prompt + "\n\nRespond with valid JSON only. No markdown code blocks.",
    systemPrompt,
    { temperature: 0.3 }
  );

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
