/**
 * AI Image Generation Pipeline
 * Gemini 3 Pro (native image gen) → Sharp → WebP → Backblaze B2
 *
 * Single-step: Gemini 3 Pro generates images natively via responseModalities.
 * Supports 4K output, ~94% text rendering accuracy, up to 14 reference images.
 *
 * Falls back to Imagen 4.0 if Gemini 3 Pro image gen fails.
 * Also supports web stock images (Pexels) and illustration style.
 */
import sharp from "sharp";
import { uploadToB2 } from "./backblaze";

export type ImageSourceType = "AI_GENERATED" | "WEB_IMAGES" | "ILLUSTRATION";

const GEMINI_IMAGE_MODEL = "gemini-3-pro-image-preview";
const IMAGEN_FALLBACK_MODEL = "imagen-4.0-fast-generate-001";

const IMAGE_STYLES = [
  "high-quality photorealistic scene with natural lighting and professional composition",
  "cinematic photorealistic scene with dramatic studio lighting and shallow depth of field",
  "professional editorial photography with clean background and natural colors",
  "photojournalistic style with authentic real-world setting and candid feel",
  "commercial photography with bright, clean lighting and polished look",
  "lifestyle photography with warm tones, natural setting, and relatable subjects",
  "professional stock photography style with sharp focus and modern aesthetic",
  "documentary-style photo with rich detail, depth, and environmental context",
];

const ILLUSTRATION_STYLES = [
  "clean modern flat illustration with bold colors and simple geometric shapes",
  "minimalist line art illustration with accent colors and clean whitespace",
  "isometric 3D illustration with soft shadows and vibrant gradient colors",
  "hand-drawn sketch style illustration with watercolor washes and organic lines",
  "modern vector illustration with smooth gradients and rounded shapes",
  "editorial illustration with bold composition, limited color palette, and conceptual metaphor",
  "infographic-style illustration with icons, clean typography elements, and structured layout",
  "playful cartoon-style illustration with bright colors and friendly characters",
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
  imageSource: ImageSourceType = "AI_GENERATED",
): Promise<Buffer> {
  const isIllustration = imageSource === "ILLUSTRATION";
  const style = isIllustration
    ? ILLUSTRATION_STYLES[Math.floor(Math.random() * ILLUSTRATION_STYLES.length)]
    : IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
  let lastError: Error | null = null;

  const prompt = isIllustration
    ? `Generate a modern illustration for a blog article about "${keyword}" in the ${niche} industry.

Illustration style: ${style}

CRITICAL RULES:
- MUST be a stylized illustration, NOT a photograph
- Use a cohesive color palette with 3-5 main colors
- Clean, modern aesthetic suitable for a tech/business blog
- Visual metaphors and conceptual imagery related to the topic
- No text, no words, no letters, no watermarks anywhere in the image
- Wide landscape composition (16:9)
- Should look like it belongs on a premium SaaS or design blog

Blog context: ${blogContext.slice(0, 400)}`
    : `Generate a photorealistic blog hero image for an article about "${keyword}" in the ${niche} industry.

Photography style: ${style}

CRITICAL RULES:
- MUST look like a real photograph taken by a professional photographer — NOT a cartoon, illustration, vector, or digital art
- DO NOT use generic "desk with laptop" or "office workspace" scenes
- Show realistic people, places, objects, or environments directly related to the topic
- No text, no words, no letters, no watermarks anywhere in the image
- Professional lighting, natural colors, realistic textures and materials
- Wide landscape composition (16:9)
- Should look like it belongs on a premium news site or business blog

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

// Track used Pexels photo IDs within a single blog generation to avoid duplicates.
const _usedPexelsIds = new Set<number>();

/** Call before starting a new blog post to reset duplicate tracking. */
export function resetPexelsTracking() {
  _usedPexelsIds.clear();
}

/**
 * Search Pexels for a stock photo matching the keyword.
 * Returns the raw image bytes or throws if no result / API key missing.
 * Automatically avoids photos already used in the current blog post.
 */
async function searchPexelsImage(
  keyword: string,
  niche: string,
  orientation: "landscape" | "portrait" = "landscape",
  extraQuery?: string,
): Promise<Buffer> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY not configured");

  const searchTerms = extraQuery ? `${keyword} ${extraQuery}` : `${keyword} ${niche}`;
  const query = encodeURIComponent(searchTerms);
  const url = `https://api.pexels.com/v1/search?query=${query}&orientation=${orientation}&per_page=10&size=large`;

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Pexels API error (${res.status})`);
  }

  const data = await res.json();
  const photos = data.photos;
  if (!photos?.length) {
    throw new Error(`No Pexels results for "${searchTerms}"`);
  }

  // Filter out already-used photos
  const available = photos.filter((p: { id: number }) => !_usedPexelsIds.has(p.id));
  const pool = available.length > 0 ? available : photos;

  // Pick a random photo from top results for variety
  const photo = pool[Math.floor(Math.random() * Math.min(pool.length, 3))];
  _usedPexelsIds.add(photo.id);

  const imageUrl = photo.src?.large2x || photo.src?.large || photo.src?.original;
  if (!imageUrl) throw new Error("No usable image URL from Pexels");

  console.log(`[Pexels] Found image #${photo.id} by ${photo.photographer}: ${imageUrl.slice(0, 80)}…`);

  const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
  if (!imgRes.ok) throw new Error(`Failed to download Pexels image (${imgRes.status})`);
  const arrayBuf = await imgRes.arrayBuffer();
  return Buffer.from(arrayBuf);
}

export async function generateBlogImage(
  prompt: string,
  slug: string,
  websiteId: string,
  keyword?: string,
  niche?: string,
  quality: "fast" | "high" = "fast",
  imageSource: ImageSourceType = "AI_GENERATED",
): Promise<string> {
  const kw = keyword || slug.replace(/-/g, " ");
  const nicheStr = niche || "business";

  let imageBytes: Buffer;

  if (imageSource === "WEB_IMAGES") {
    // Try Pexels first, fall back to AI generation
    try {
      imageBytes = await searchPexelsImage(kw, nicheStr, "landscape");
    } catch (err) {
      console.warn("[Image] Pexels failed, falling back to AI generation:", err instanceof Error ? err.message : err);
      let apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");
      apiKey = apiKey.replace(/\\n/g, "").trim();
      imageBytes = await generateWithGemini3Pro(kw, nicheStr, prompt, apiKey, quality === "high" ? 3 : 2, "AI_GENERATED");
    }
  } else {
    // AI_GENERATED or ILLUSTRATION — use Gemini
    let apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");
    apiKey = apiKey.replace(/\\n/g, "").trim();

    try {
      imageBytes = await generateWithGemini3Pro(kw, nicheStr, prompt, apiKey, quality === "high" ? 3 : 2, imageSource);
    } catch (err) {
      console.warn("[Image] Gemini 3 Pro failed, falling back to Imagen:", err instanceof Error ? err.message : err);
      const fallbackPrompt = imageSource === "ILLUSTRATION"
        ? `Modern flat illustration for "${kw}" in ${nicheStr}. Stylized vector art, clean design, bold colors. No text or words. 16:9 landscape.`
        : `Professional photorealistic blog hero image for "${kw}" in ${nicheStr}. Real photograph, natural lighting, no illustration or cartoon. No text or words. 16:9 landscape.`;
      imageBytes = await generateWithImagen(fallbackPrompt, apiKey);
    }
  }

  let processed = await sharp(imageBytes)
    .resize(1600, 840, { fit: "cover", position: "center" })
    .toBuffer();

  processed = await sharp(processed).webp({ quality: 92 }).toBuffer();

  const key = `${websiteId}/blog-images/${slug}-featured.webp`;
  const url = await uploadToB2(processed, key, "image/webp");

  return url;
}

/**
 * Generate an inline/section image (1200x675, no text overlay)
 */
export async function generateInlineImage(
  prompt: string,
  slug: string,
  index: number,
  websiteId: string,
  keyword?: string,
  niche?: string,
  imageSource: ImageSourceType = "AI_GENERATED",
  sectionHeading?: string,
): Promise<string> {
  const kw = keyword || slug.replace(/-/g, " ");
  const nicheStr = niche || "business";

  let imageBytes: Buffer;

  if (imageSource === "WEB_IMAGES") {
    try {
      imageBytes = await searchPexelsImage(kw, nicheStr, "landscape", sectionHeading);
    } catch (err) {
      console.warn(`[Image] Pexels inline ${index} failed, falling back to AI:`, err instanceof Error ? err.message : err);
      let apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");
      apiKey = apiKey.replace(/\\n/g, "").trim();
      imageBytes = await generateWithGemini3Pro(kw, nicheStr, prompt, apiKey, 2, "AI_GENERATED");
    }
  } else {
    let apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");
    apiKey = apiKey.replace(/\\n/g, "").trim();

    try {
      imageBytes = await generateWithGemini3Pro(kw, nicheStr, prompt, apiKey, 2, imageSource);
    } catch {
      const fallbackPrompt = imageSource === "ILLUSTRATION"
        ? `${prompt} Modern flat illustration, stylized vector art, clean design. No text. 16:9.`
        : `${prompt} Professional photorealistic style, real photograph, no illustration or cartoon. No text. 16:9.`;
      imageBytes = await generateWithImagen(fallbackPrompt, apiKey);
    }
  }

  const processed = await sharp(imageBytes)
    .resize(1200, 675, { fit: "cover", position: "center" })
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
