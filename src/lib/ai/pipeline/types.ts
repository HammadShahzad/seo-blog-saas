import type { ResearchResult } from "../research";
import type { Website, BlogSettings } from "@prisma/client";

export type WebsiteWithSettings = Website & {
  blogSettings?: BlogSettings | null;
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

export const STEPS = [
  "research",
  "outline",
  "draft",
  "tone",
  "seo",
  "metadata",
  "image",
] as const;

export type ContentLength = "SHORT" | "MEDIUM" | "LONG" | "PILLAR";

export const WORD_TARGETS: Record<string, string> = {
  SHORT: "600-800",
  MEDIUM: "1000-1500",
  LONG: "1800-2500",
  PILLAR: "2500-3500",
};

export const DRAFT_TOKENS: Record<string, number> = {
  SHORT: 4096,
  MEDIUM: 8192,
  LONG: 12288,
  PILLAR: 16384,
};

export const MIN_WORDS: Record<string, number> = {
  SHORT: 450,
  MEDIUM: 800,
  LONG: 1400,
  PILLAR: 2000,
};

export const MAX_CONTENT_SECTIONS: Record<string, number> = {
  SHORT: 3, MEDIUM: 4, LONG: 6, PILLAR: 8,
};
