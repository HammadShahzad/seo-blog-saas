export interface WordPressConfig {
  siteUrl: string;
  username: string;
  appPassword: string;
  pluginApiKey?: string;
  defaultStatus?: "draft" | "publish";
  defaultCategoryId?: number;
}

export interface WordPressPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  status?: "draft" | "publish" | "pending" | "private";
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  tags?: string[];
  category?: string;
}

export interface WordPressPostResult {
  success: boolean;
  wpPostId?: number;
  wpPostUrl?: string;
  wpEditUrl?: string;
  error?: string;
}

export interface WordPressConnectionResult {
  success: boolean;
  siteName?: string;
  siteUrl?: string;
  wpVersion?: string;
  userName?: string;
  error?: string;
}
