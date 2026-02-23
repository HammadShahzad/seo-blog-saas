export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  featuredImage: string | null;
  featuredImageAlt: string | null;
  tags: string[];
  category: string | null;
  status: string;
  scheduledAt: string | null;
  wordCount: number | null;
  readingTime: number | null;
  socialCaptions: { twitter?: string; linkedin?: string } | null;
  externalUrl: string | null;
}

export type CmsResult = {
  type: "wp" | "shopify" | null;
  viewUrl?: string;
  editUrl?: string;
} | null;

export type StatusCfg = {
  label: string;
  variant: "default" | "secondary" | "outline";
  className?: string;
};

export const STATUS_CONFIG: Record<string, StatusCfg> = {
  DRAFT:     { label: "Draft",     variant: "secondary" },
  REVIEW:    { label: "Review",    variant: "outline" },
  SCHEDULED: { label: "Scheduled", variant: "outline", className: "border-blue-400 text-blue-700 bg-blue-50" },
  PUBLISHED: { label: "Published", variant: "default" },
  ARCHIVED:  { label: "Archived",  variant: "secondary" },
};
