export interface Keyword {
  id: string;
  keyword: string;
  status: string;
  priority: number;
  searchVolume: number | null;
  difficulty: number | null;
  intent: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Suggestion {
  keyword: string;
  intent: string;
  difficulty: string;
  priority: number;
  rationale: string;
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  RESEARCHING: "bg-blue-100 text-blue-800",
  GENERATING: "bg-purple-100 text-purple-800",
  REVIEW: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  SKIPPED: "bg-gray-100 text-gray-800",
};

export const INTENT_COLORS: Record<string, string> = {
  informational: "bg-blue-50 text-blue-700",
  commercial: "bg-purple-50 text-purple-700",
  transactional: "bg-green-50 text-green-700",
  navigational: "bg-gray-50 text-gray-700",
};
