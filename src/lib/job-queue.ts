/**
 * Generation Job Queue
 * Database-backed async job queue with progress tracking.
 * Uses PostgreSQL (via Prisma) as the queue store — no Redis required for Phase 2.
 * Can be upgraded to BullMQ/Redis for scale.
 */
import prisma from "./prisma";
import { generateBlogPost, ProgressCallback } from "./ai/content-generator";
import type { JobType } from "@prisma/client";
import { runPublishHook } from "./on-publish";
import { calculateContentScore } from "./seo-scorer";
import { generateBlogImage } from "./storage/image-generator";
import { generateJSON } from "./ai/gemini";
import { generateClusterPreview } from "./ai/cluster-generator";

export interface JobInput {
  keywordId: string;
  keyword: string;
  websiteId: string;
  contentLength?: "SHORT" | "MEDIUM" | "LONG" | "PILLAR";
  includeImages?: boolean;
  includeFAQ?: boolean;
  includeProTips?: boolean;
  includeTableOfContents?: boolean;
  autoPublish?: boolean;
  customDirection?: string;
}

/**
 * Enqueue a new blog generation job
 */
export async function enqueueGenerationJob(input: JobInput): Promise<string> {
  const job = await prisma.generationJob.create({
    data: {
      type: "BLOG_GENERATION" as JobType,
      status: "QUEUED",
      websiteId: input.websiteId,
      keywordId: input.keywordId,
      input: input as object,
      progress: 0,
    },
  });

  // Mark keyword as queued
  await prisma.blogKeyword.update({
    where: { id: input.keywordId },
    data: { status: "RESEARCHING" },
  });

  return job.id;
}

export interface KeywordSuggestInput {
  websiteId: string;
  seedKeyword?: string;
}

export interface ClusterGenerateInput {
  websiteId: string;
  seedTopic?: string;
}

/**
 * Enqueue a keyword suggestion job (runs on Droplet worker, no Vercel timeout)
 */
export async function enqueueKeywordSuggestJob(input: KeywordSuggestInput): Promise<string> {
  const job = await prisma.generationJob.create({
    data: {
      type: "KEYWORD_SUGGEST" as JobType,
      status: "QUEUED",
      websiteId: input.websiteId,
      input: input as object,
      progress: 0,
    },
  });
  return job.id;
}

/**
 * Enqueue a cluster generation job (runs on Droplet worker, no Vercel timeout)
 */
export async function enqueueClusterGenerateJob(input: ClusterGenerateInput): Promise<string> {
  const job = await prisma.generationJob.create({
    data: {
      type: "CLUSTER_GENERATE" as JobType,
      status: "QUEUED",
      websiteId: input.websiteId,
      input: input as object,
      progress: 0,
    },
  });
  return job.id;
}

/**
 * Process a single generation job — runs the full AI pipeline
 */
export async function processJob(jobId: string): Promise<void> {
  const job = await prisma.generationJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "QUEUED") return;

  // Route to the correct handler based on job type
  if (job.type === "KEYWORD_SUGGEST") {
    return processKeywordSuggestJob(jobId, job.input as unknown as KeywordSuggestInput);
  }
  if (job.type === "CLUSTER_GENERATE") {
    return processClusterGenerateJob(jobId, job.input as unknown as ClusterGenerateInput);
  }

  // Mark as processing (BLOG_GENERATION path)
  await prisma.generationJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", startedAt: new Date(), currentStep: "research" },
  });

  const input = job.input as unknown as JobInput;

  try {
    const [website, existingPosts, manualLinks] = await Promise.all([
      prisma.website.findUnique({
        where: { id: input.websiteId },
        include: { blogSettings: true },
      }),
      prisma.blogPost.findMany({
        where: { websiteId: input.websiteId, status: { in: ["PUBLISHED", "REVIEW"] } },
        select: { title: true, slug: true, focusKeyword: true, secondaryKeywords: true },
        orderBy: { publishedAt: "desc" },
        take: 100,
      }),
      prisma.internalLinkPair.findMany({
        where: { websiteId: input.websiteId },
        select: { keyword: true, url: true },
      }),
    ]);

    if (!website) throw new Error("Website not found");

    const baseUrl = website.brandUrl.replace(/\/$/, "");
    const blogBase = website.customDomain
      ? `https://${website.customDomain}`
      : `${baseUrl}/blog`;

    const postLinks = existingPosts.map((p) => ({
      title: p.title,
      slug: p.slug,
      url: website.customDomain
        ? `https://${website.customDomain}/${p.slug}`
        : `${baseUrl}/blog/${p.slug}`,
      focusKeyword: p.focusKeyword || "",
    }));

    // Build internal links from actual published posts (primary source)
    const postBasedLinks: { keyword: string; url: string }[] = [];
    const seenKeywords = new Set<string>();

    for (const p of existingPosts) {
      const postUrl = website.customDomain
        ? `https://${website.customDomain}/${p.slug}`
        : `${baseUrl}/blog/${p.slug}`;

      if (p.focusKeyword && !seenKeywords.has(p.focusKeyword.toLowerCase())) {
        seenKeywords.add(p.focusKeyword.toLowerCase());
        postBasedLinks.push({ keyword: p.focusKeyword, url: postUrl });
      }

      if (p.secondaryKeywords?.length) {
        for (const kw of p.secondaryKeywords.slice(0, 2)) {
          if (kw && !seenKeywords.has(kw.toLowerCase())) {
            seenKeywords.add(kw.toLowerCase());
            postBasedLinks.push({ keyword: kw, url: postUrl });
          }
        }
      }
    }

    // Merge: post-based links first, then manual/configured links for non-blog pages
    const allInternalLinks = [
      ...postBasedLinks,
      ...manualLinks
        .filter((l) => !seenKeywords.has(l.keyword.toLowerCase()))
        .map((l) => ({ keyword: l.keyword, url: l.url })),
    ];

    const onProgress: ProgressCallback = async (progress) => {
      await prisma.generationJob.update({
        where: { id: jobId },
        data: {
          currentStep: progress.step,
          progress: progress.percentage,
        },
      });

      if (progress.step === "draft" || progress.step === "tone") {
        await prisma.blogKeyword.update({
          where: { id: input.keywordId },
          data: { status: "GENERATING" },
        }).catch(() => {});
      }
    };

    // Run the full AI pipeline with all context from the strategy
    const generated = await generateBlogPost(
      input.keyword,
      website as Parameters<typeof generateBlogPost>[1],
      input.contentLength || "MEDIUM",
      {
        includeImages: input.includeImages ?? true,
        includeFAQ: input.includeFAQ ?? true,
        includeProTips: input.includeProTips ?? true,
        includeTableOfContents: input.includeTableOfContents ?? true,
        onProgress,
        existingPosts: postLinks,
        internalLinks: allInternalLinks,
        customDirection: input.customDirection,
      }
    );

    // Ensure unique slug
    const baseSlug = generated.slug;
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const existing = await prisma.blogPost.findUnique({
        where: { websiteId_slug: { websiteId: input.websiteId, slug } },
      });
      if (!existing) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    const status = input.autoPublish ? "PUBLISHED" : "REVIEW";

    const { score: contentScore } = calculateContentScore({
      content: generated.content,
      title: generated.title,
      metaTitle: generated.metaTitle,
      metaDescription: generated.metaDescription,
      focusKeyword: generated.focusKeyword,
      featuredImage: generated.featuredImageUrl,
      featuredImageAlt: generated.featuredImageAlt,
    });

    const blogPost = await prisma.blogPost.create({
      data: {
        title: generated.title,
        slug,
        content: generated.content,
        excerpt: generated.excerpt,
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        focusKeyword: generated.focusKeyword,
        secondaryKeywords: generated.secondaryKeywords,
        featuredImage: generated.featuredImageUrl || null,
        featuredImageAlt: generated.featuredImageAlt || null,
        structuredData: generated.structuredData,
        socialCaptions: generated.socialCaptions,
        contentScore,
        wordCount: generated.wordCount,
        readingTime: generated.readingTime,
        tags: generated.tags,
        category: generated.category,
        status,
        publishedAt: input.autoPublish ? new Date() : null,
        generatedBy: "ai",
        aiModel: "stackserp-ai-v1",
        researchData: generated.researchData as object,
        generationSteps: { completed: true },
        websiteId: input.websiteId,
      },
    });

    // Link keyword → post, mark completed
    await prisma.blogKeyword.update({
      where: { id: input.keywordId },
      data: {
        status: "COMPLETED",
        blogPostId: blogPost.id,
      },
    }).catch(() => {});

    // If image generation failed inside generateBlogPost, retry it here independently
    // so a failed image never blocks the whole job or leaves the post silently imageless.
    if (!generated.featuredImageUrl && (input.includeImages ?? true) && process.env.GOOGLE_AI_API_KEY) {
      console.log(`[job-queue] Image was not generated during post creation — retrying image separately for post ${blogPost.id}`);
      try {
        const imgPrompt = `Create an image that directly represents "${input.keyword}" for a ${website.niche || "business"} brand. No text, words, or watermarks.`;
        const imageUrl = await generateBlogImage(
          imgPrompt,
          blogPost.slug,
          input.websiteId,
          undefined,
          input.keyword,
          website.niche || "business",
          "fast",
        );
        await prisma.blogPost.update({
          where: { id: blogPost.id },
          data: { featuredImage: imageUrl },
        });
        console.log(`[job-queue] Retry image succeeded: ${imageUrl}`);
      } catch (imgErr) {
        const imgErrMsg = imgErr instanceof Error ? imgErr.message : String(imgErr);
        console.error(`[job-queue] Image retry also failed: ${imgErrMsg}`);
        // Mark post so the UI shows a "Generate Image" prompt
        await prisma.blogPost.update({
          where: { id: blogPost.id },
          data: { generationSteps: { completed: true, imageError: imgErrMsg } },
        }).catch(() => {});
      }
    }

    // Mark job complete
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        progress: 100,
        currentStep: "done",
        blogPostId: blogPost.id,
        output: { blogPostId: blogPost.id, title: blogPost.title, slug: blogPost.slug } as object,
      },
    });

    // Update subscription usage counter
    await prisma.subscription.updateMany({
      where: { organization: { websites: { some: { id: input.websiteId } } } },
      data: { postsGeneratedThisMonth: { increment: 1 } },
    });

    // Fire publish hook if auto-published
    if (input.autoPublish) {
      runPublishHook({
        postId: blogPost.id,
        websiteId: input.websiteId,
        triggeredBy: "auto",
      }).catch(console.error);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Job ${jobId} failed:`, errorMessage);

    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: errorMessage, completedAt: new Date() },
    });

    await prisma.blogKeyword.update({
      where: { id: input.keywordId },
      data: {
        status: "FAILED",
        errorMessage,
        retryCount: { increment: 1 },
      },
    }).catch(() => {});
  }
}

/**
 * Fire-and-forget HTTP call to the Droplet worker to pick up a job.
 * Falls back silently — the worker also polls on its own.
 */
export function triggerWorker(jobId: string) {
  const workerUrl = process.env.WORKER_URL; // e.g. http://167.71.96.242:3001
  const secret = process.env.CRON_SECRET;
  if (!workerUrl || !secret) return;

  fetch(`${workerUrl}/api/worker/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ jobId }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {
    // Silent — worker will pick it up via polling
  });
}

/**
 * Get job status with progress
 */
export async function getJobStatus(jobId: string) {
  return prisma.generationJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      currentStep: true,
      progress: true,
      error: true,
      startedAt: true,
      completedAt: true,
      blogPostId: true,
      output: true,
    },
  });
}

/**
 * Recover jobs stuck in PROCESSING for more than 10 minutes.
 * Auto-retries up to MAX_AUTO_RETRIES times by resetting to QUEUED.
 * After max retries, marks as FAILED.
 */
const MAX_AUTO_RETRIES = 2;
const STUCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

export async function recoverStuckJobs(): Promise<number> {
  const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MS);

  const stuckJobs = await prisma.generationJob.findMany({
    where: {
      status: "PROCESSING",
      startedAt: { lt: cutoff },
    },
    select: { id: true, keywordId: true, error: true, input: true },
  });

  if (stuckJobs.length === 0) return 0;

  let recovered = 0;
  for (const job of stuckJobs) {
    // Count previous auto-retries from the error field
    const prevError = job.error || "";
    const retryMatch = prevError.match(/\[auto-retry (\d+)/);
    const retryCount = retryMatch ? parseInt(retryMatch[1], 10) : 0;

    if (retryCount < MAX_AUTO_RETRIES) {
      // Auto-retry: reset to QUEUED
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "QUEUED",
          progress: 0,
          currentStep: null,
          startedAt: null,
          completedAt: null,
          error: `[auto-retry ${retryCount + 1}/${MAX_AUTO_RETRIES}] Job stalled, auto-retrying...`,
        },
      });
      if (job.keywordId) {
        await prisma.blogKeyword.update({
          where: { id: job.keywordId },
          data: { status: "PENDING" },
        }).catch(() => {});
      }
      console.log(`[recoverStuckJobs] Auto-retrying job ${job.id} (attempt ${retryCount + 1}/${MAX_AUTO_RETRIES})`);
    } else {
      // Max retries exceeded — mark as permanently failed
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: `Job failed after ${MAX_AUTO_RETRIES} auto-retries. Click Retry to try again.`,
          completedAt: new Date(),
        },
      });
      if (job.keywordId) {
        await prisma.blogKeyword.update({
          where: { id: job.keywordId },
          data: { status: "FAILED", errorMessage: "Generation timed out after multiple retries" },
        }).catch(() => {});
      }
      console.log(`[recoverStuckJobs] Job ${job.id} FAILED after ${MAX_AUTO_RETRIES} retries`);
    }
    recovered++;
  }

  console.log(`[recoverStuckJobs] Processed ${recovered} stuck job(s)`);
  return recovered;
}

/**
 * Process a KEYWORD_SUGGEST job — AI keyword suggestions, no Vercel timeout
 */
async function processKeywordSuggestJob(jobId: string, input: KeywordSuggestInput): Promise<void> {
  await prisma.generationJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", startedAt: new Date(), currentStep: "analyzing" },
  });

  try {
    const website = await prisma.website.findUnique({
      where: { id: input.websiteId },
      select: { niche: true, targetAudience: true, brandName: true, description: true, brandUrl: true, domain: true },
    });
    if (!website) throw new Error("Website not found");

    await prisma.generationJob.update({ where: { id: jobId }, data: { progress: 20, currentStep: "generating" } });

    const existing = await prisma.blogKeyword.findMany({
      where: { websiteId: input.websiteId },
      select: { keyword: true },
    });
    const existingSet = new Set(existing.map((k) => k.keyword.toLowerCase()));
    const existingList = existing.length > 0
      ? `\n\nAlready added keywords (do NOT repeat these):\n${existing.slice(0, 50).map(k => `- ${k.keyword}`).join("\n")}`
      : "";

    const websiteUrl = website.brandUrl || (website.domain ? `https://${website.domain}` : "");
    const seedKeyword = input.seedKeyword || "";
    const topicFocus = seedKeyword
      ? `\n\n## FOCUS TOPIC: "${seedKeyword}"\nAll 20 keywords MUST be specifically about "${seedKeyword}" as it relates to ${website.brandName}'s ${website.niche} business. Do NOT suggest keywords outside the scope of "${seedKeyword}".`
      : "";

    interface SuggestionsResponse {
      keywords: Array<{
        keyword: string;
        intent: "informational" | "commercial" | "navigational" | "transactional";
        difficulty: "low" | "medium" | "high";
        priority: number;
        rationale: string;
      }>;
    }

    const result = await generateJSON<SuggestionsResponse>(
      `You are an SEO strategist for the following business. Generate 20 high-value blog keyword ideas STRICTLY relevant to this specific business.

## Business Details:
- Brand: ${website.brandName}${websiteUrl ? ` (${websiteUrl})` : ""}
- Niche: ${website.niche}
- Description: ${website.description || "N/A"}
- Target audience: ${website.targetAudience}${topicFocus}

## Rules:
- Every keyword MUST directly relate to ${website.brandName}'s niche: "${website.niche}"${seedKeyword ? `\n- Every keyword MUST be about or related to "${seedKeyword}"` : ""}
- Do NOT suggest generic or off-topic keywords unrelated to this business
- Long-tail keywords (3-6 words) that can support a 1000-2000 word blog post
- Mix of informational ("how to..."), commercial ("best..."), and comparison keywords
- Realistic difficulty — not too broad, not too obscure${existingList}

Return JSON:
{
  "keywords": [
    {
      "keyword": "exact keyword phrase here",
      "intent": "informational",
      "difficulty": "low",
      "priority": 8,
      "rationale": "Why this keyword is relevant"
    }
  ]
}`,
      `You are an SEO strategist specializing in the ${website.niche} industry for ${website.brandName}.${seedKeyword ? ` Focus all suggestions around the topic: "${seedKeyword}".` : ""} Return only valid JSON.`
    );

    await prisma.generationJob.update({ where: { id: jobId }, data: { progress: 80, currentStep: "filtering" } });

    const filtered = result.keywords.filter((k) => !existingSet.has(k.keyword.toLowerCase()));

    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        progress: 100,
        currentStep: "done",
        output: { suggestions: filtered } as object,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[KEYWORD_SUGGEST job ${jobId}] failed:`, errorMessage);
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: errorMessage, completedAt: new Date() },
    });
  }
}

/**
 * Process a CLUSTER_GENERATE job — AI cluster generation, no Vercel timeout
 */
async function processClusterGenerateJob(jobId: string, input: ClusterGenerateInput): Promise<void> {
  await prisma.generationJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", startedAt: new Date(), currentStep: "crawling" },
  });

  try {
    const [website, existingKws, publishedPosts] = await Promise.all([
      prisma.website.findUnique({
        where: { id: input.websiteId },
        select: {
          brandUrl: true, brandName: true, niche: true,
          description: true, targetAudience: true,
          uniqueValueProp: true, competitors: true,
          keyProducts: true, targetLocation: true,
          blogSettings: { select: { avoidTopics: true } },
        },
      }),
      prisma.blogKeyword.findMany({ where: { websiteId: input.websiteId }, select: { keyword: true }, take: 60 }),
      prisma.blogPost.findMany({
        where: { websiteId: input.websiteId, status: { in: ["PUBLISHED", "REVIEW"] } },
        select: { title: true, focusKeyword: true },
        orderBy: { publishedAt: "desc" },
        take: 100,
      }),
    ]);

    if (!website) throw new Error("Website not found");

    await prisma.generationJob.update({ where: { id: jobId }, data: { progress: 30, currentStep: "analyzing" } });

    const seedTopic = input.seedTopic?.trim() || website.niche || "general";
    const preview = await generateClusterPreview(
      seedTopic,
      website,
      existingKws.map(k => k.keyword),
      publishedPosts.map(p => ({ title: p.title, focusKeyword: p.focusKeyword || "" })),
      website.blogSettings?.avoidTopics || [],
    );

    await prisma.generationJob.update({ where: { id: jobId }, data: { progress: 80, currentStep: "generating" } });

    const suggestions = [{
      pillarKeyword: preview.keywords.find(k => k.role === "pillar")?.keyword || seedTopic,
      name: preview.pillarTitle,
      supportingKeywords: preview.keywords.filter(k => k.role === "supporting").map(k => k.keyword),
      rationale: preview.description,
    }];

    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        progress: 100,
        currentStep: "done",
        output: { suggestions, steps: { crawl: "ok", ai: "ok" } } as object,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CLUSTER_GENERATE job ${jobId}] failed:`, errorMessage);
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: errorMessage, completedAt: new Date() },
    });
  }
}

/**
 * Check if organization is within their post generation limit
 */
export async function checkGenerationLimit(websiteId: string): Promise<{
  allowed: boolean;
  reason?: string;
  remaining?: number;
}> {
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      organization: {
        include: { subscription: true },
      },
    },
  });

  if (!website) return { allowed: false, reason: "Website not found" };

  const sub = website.organization.subscription;
  if (!sub) return { allowed: true }; // No subscription = allow (shouldn't happen)

  if (sub.postsGeneratedThisMonth >= sub.maxPostsPerMonth) {
    return {
      allowed: false,
      reason: `You've used all ${sub.maxPostsPerMonth} posts for this month on the ${sub.plan} plan. Upgrade to generate more.`,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: sub.maxPostsPerMonth - sub.postsGeneratedThisMonth,
  };
}
