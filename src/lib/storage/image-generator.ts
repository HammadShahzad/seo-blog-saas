/**
 * AI Image Generation Pipeline
 * Gemini 3 Pro (native image gen) → Sharp → WebP → Backblaze B2
 *
 * Single-step: Gemini 3 Pro generates images natively via responseModalities.
 * Supports 4K output, ~94% text rendering accuracy, up to 14 reference images.
 *
 * Falls back to Imagen 4.0 if Gemini 3 Pro image gen fails.
 */
import sharp from "sharp";
import { uploadToB2 } from "./backblaze";

const GEMINI_IMAGE_MODEL = "gemini-3-pro-image-preview";
const IMAGEN_FALLBACK_MODEL = "imagen-4.0-fast-generate-001";

const IMAGE_STYLES = [
  "flat vector illustration with bold colors and clean geometric shapes",
  "isometric 3D render with soft pastel palette and depth shadows",
  "cinematic photorealistic scene with dramatic studio lighting",
  "modern minimalist line art with a single vivid accent color",
  "editorial illustration with geometric abstract elements and bold typography feel",
  "watercolor painting style with vibrant ink washes and organic shapes",
  "retro vintage poster style with muted earth tones and grain texture",
  "collage-style mixed media with layered paper textures and cut-out shapes",
];

/**
 * Generate an image using Gemini 3 Pro native image generation.
 * One API call — the model understands context and generates the image directly.
 */
async function generateWithGemini3Pro(
  keyword: string,
  niche: string,
  blogContext: string,
  apiKey: string,
  retries = 3,
): Promise<Buffer> {
  const style = IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
  let lastError: Error | null = null;

  const prompt = `Generate a high-quality blog hero image for an article about "${keyword}" in the ${niche} industry.

Art style: ${style}

CRITICAL RULES:
- DO NOT use generic "desk with laptop" or "office workspace" scenes
- Visually represent the EXACT topic using metaphors, symbols, or creative conceptual scenes
- No text, no words, no letters, no watermarks anywhere in the image
- Make it eye-catching, specific, and memorable — not generic stock photo imagery
- Wide landscape composition (16:9)

Blog context: ${blogContext.slice(0, 400)}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(90000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
              temperature: 1.0,
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error(`[Gemini3Pro] attempt ${attempt}/${retries} — ${response.status}:`, err.slice(0, 300));
        lastError = new Error(`Gemini 3 Pro image API error (${response.status})`);

        if (response.status === 429) {
          const backoff = Math.min(attempt * 10000, 30000);
          console.warn(`[Gemini3Pro] Rate limited, waiting ${backoff / 1000}s…`);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        if (response.status >= 500) {
          await new Promise((r) => setTimeout(r, attempt * 5000));
          continue;
        }
        throw lastError;
      }

      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts;

      if (!parts || !Array.isArray(parts)) {
        lastError = new Error("No parts in Gemini 3 Pro response");
        await new Promise((r) => setTimeout(r, attempt * 3000));
        continue;
      }

      for (const part of parts) {
        if (part.inlineData?.data) {
          console.log(`[Gemini3Pro] Image generated (style: ${style.split(" ").slice(0, 3).join(" ")}…)`);
          return Buffer.from(part.inlineData.data, "base64");
        }
        if (part.inline_data?.data) {
          console.log(`[Gemini3Pro] Image generated (style: ${style.split(" ").slice(0, 3).join(" ")}…)`);
          return Buffer.from(part.inline_data.data, "base64");
        }
      }

      console.warn(`[Gemini3Pro] attempt ${attempt} — no image data in response parts`);
      lastError = new Error("No image data in Gemini 3 Pro response");
      await new Promise((r) => setTimeout(r, attempt * 3000));
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        console.warn(`[Gemini3Pro] attempt ${attempt} failed, retrying in ${attempt * 5}s…`);
        await new Promise((r) => setTimeout(r, attempt * 5000));
      }
    }
  }

  throw lastError || new Error("Gemini 3 Pro image generation failed after all retries");
}

/**
 * Fallback: Imagen 4.0 (used only if Gemini 3 Pro fails)
 */
async function generateWithImagen(
  prompt: string,
  apiKey: string,
  retries = 2,
): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_FALLBACK_MODEL}:predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1, personGeneration: "allow_adult" },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error(`[Imagen fallback] attempt ${attempt}/${retries} — ${response.status}:`, err.slice(0, 300));
        lastError = new Error(`Imagen API error (${response.status})`);
        if (response.status === 429) {
          await new Promise((r) => setTimeout(r, attempt * 8000));
          continue;
        }
        throw lastError;
      }

      const data = await response.json();
      const base64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (!base64) {
        lastError = new Error("No image data from Imagen");
        continue;
      }
      return Buffer.from(base64, "base64");
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, attempt * 5000));
      }
    }
  }

  throw lastError || new Error("Imagen fallback failed");
}

export async function generateBlogImage(
  prompt: string,
  slug: string,
  websiteId: string,
  overlayText?: string,
  keyword?: string,
  niche?: string,
  quality: "fast" | "high" = "fast",
): Promise<string> {
  let apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");
  apiKey = apiKey.replace(/\\n/g, "").trim();

  const kw = keyword || slug.replace(/-/g, " ");
  const nicheStr = niche || "business";

  let imageBytes: Buffer;

  try {
    imageBytes = await generateWithGemini3Pro(kw, nicheStr, prompt, apiKey, quality === "high" ? 3 : 2);
  } catch (err) {
    console.warn("[Image] Gemini 3 Pro failed, falling back to Imagen:", err instanceof Error ? err.message : err);
    const style = IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
    const fallbackPrompt = `Blog hero image for "${kw}" in ${nicheStr}. ${style}. No text or words. 16:9 landscape.`;
    imageBytes = await generateWithImagen(fallbackPrompt, apiKey);
  }

  let processed = await sharp(imageBytes)
    .resize(1200, 630, { fit: "cover", position: "center" })
    .toBuffer();

  if (overlayText) {
    processed = await addTextOverlay(processed, overlayText);
  }

  processed = await sharp(processed).webp({ quality: 92 }).toBuffer();

  const key = `${websiteId}/blog-images/${slug}-featured.webp`;
  const url = await uploadToB2(processed, key, "image/webp");

  return url;
}

async function addTextOverlay(imageBuffer: Buffer, text: string): Promise<Buffer> {
  const width = 1200;
  const height = 630;
  const maxCharsPerLine = 30;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  const displayLines = lines.slice(0, 3);
  const fontSize = displayLines.length > 2 ? 40 : 48;
  const lineHeight = fontSize * 1.3;
  const totalTextHeight = displayLines.length * lineHeight;
  const boxPadding = 30;
  const boxHeight = totalTextHeight + boxPadding * 2;
  const boxY = height - boxHeight - 40;

  const escapedLines = displayLines.map(l =>
    l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  );

  const textElements = escapedLines.map((line, i) => {
    const y = boxY + boxPadding + fontSize + i * lineHeight;
    return `<text x="${width / 2}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" filter="url(#shadow)">${line}</text>`;
  }).join("");

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.8)" />
        </filter>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(0,0,0,0)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.7)" />
        </linearGradient>
      </defs>
      <rect x="0" y="${boxY - 20}" width="${width}" height="${height - boxY + 20}" fill="url(#grad)" />
      ${textElements}
    </svg>
  `);

  return sharp(imageBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .toBuffer();
}

/**
 * Generate a smaller inline/section image (800x450, no text overlay)
 */
export async function generateInlineImage(
  prompt: string,
  slug: string,
  index: number,
  websiteId: string,
  keyword?: string,
  niche?: string,
): Promise<string> {
  let apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");
  apiKey = apiKey.replace(/\\n/g, "").trim();

  const kw = keyword || slug.replace(/-/g, " ");
  const nicheStr = niche || "business";

  let imageBytes: Buffer;

  try {
    imageBytes = await generateWithGemini3Pro(kw, nicheStr, prompt, apiKey, 2);
  } catch {
    const style = IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
    imageBytes = await generateWithImagen(`${prompt} ${style}. No text. 16:9.`, apiKey);
  }

  const processed = await sharp(imageBytes)
    .resize(800, 450, { fit: "cover", position: "center" })
    .webp({ quality: 90 })
    .toBuffer();

  const key = `${websiteId}/blog-images/${slug}-inline-${index}.webp`;
  return uploadToB2(processed, key, "image/webp");
}

/**
 * Generate and upload a thumbnail version (400x225)
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  slug: string,
  websiteId: string
): Promise<string> {
  const thumbnail = await sharp(imageBuffer)
    .resize(400, 225, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();

  const key = `${websiteId}/blog-images/${slug}-thumb.webp`;
  return uploadToB2(thumbnail, key, "image/webp");
}
