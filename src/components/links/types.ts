export interface InternalLink {
  id: string;
  keyword: string;
  url: string;
  createdAt: string;
}

export interface SuggestedLink {
  keyword: string;
  url: string;
  reason: string;
}

export interface StepStatus {
  crawl: "ok" | "failed";
  ai: "ok" | "failed";
  error?: string;
  pagesFound: number;
}
