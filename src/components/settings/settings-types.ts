export interface WebsiteData {
  id: string;
  name: string;
  domain: string;
  niche: string;
  description: string;
  targetAudience: string;
  tone: string;
  brandName: string;
  brandUrl: string;
  primaryColor: string;
  autoPublish: boolean;
  postsPerWeek: number;
  publishTime: string;
  publishDays: string;
  timezone: string;
  hostingMode: string;
  googleAnalyticsId: string | null;
  gscPropertyUrl: string | null;
  indexNowKey: string | null;
  twitterApiKey: string | null;
  twitterApiSecret: string | null;
  twitterAccessToken: string | null;
  twitterAccessSecret: string | null;
  linkedinAccessToken: string | null;
  status: string;
  uniqueValueProp: string | null;
  competitors: string[];
  keyProducts: string[];
  targetLocation: string | null;
}

export interface BlogSettingsData {
  ctaText: string | null;
  ctaUrl: string | null;
  avoidTopics: string[];
  writingStyle: string;
  contentLength: string;
  includeFAQ: boolean;
  includeProTips: boolean;
  includeTableOfContents: boolean;
}

export type UpdateFieldFn = (field: string, value: string | boolean | number | string[]) => void;
