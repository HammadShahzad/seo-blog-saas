export interface TopicCluster {
  id: string;
  name: string;
  pillarKeyword: string;
  supportingKeywords: string[];
  status: string;
  createdAt: string;
}

export interface SuggestedCluster {
  pillarKeyword: string;
  name: string;
  supportingKeywords: string[];
  rationale: string;
}

export interface StepStatus {
  crawl: "ok" | "failed";
  ai: "ok" | "failed";
  error?: string;
}

export interface NewClusterForm {
  name: string;
  pillarKeyword: string;
  supportingKeywords: string;
}

export const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
};
