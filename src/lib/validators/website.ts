import { z } from "zod";

export const createWebsiteSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  domain: z
    .string()
    .min(1, "Domain is required")
    .transform((v) => {
      let s = v.trim().toLowerCase();
      s = s.replace(/^https?:\/\//i, ""); // strip protocol
      s = s.split("/")[0];                 // strip any path (/marrakech/, etc.)
      s = s.split("?")[0];                 // strip query string
      s = s.replace(/\/$/, "");            // strip trailing slash
      return s;
    })
    .refine(
      (v) => /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(v),
      "Enter a valid domain (e.g., example.com or www.example.com)"
    ),
  niche: z.string().min(1, "Niche is required").max(500),
  description: z.string().min(1, "Description is required").max(2000),
  targetAudience: z.string().min(1, "Target audience is required").max(1000),
  tone: z.string().default("professional yet conversational"),
  brandName: z.string().min(1, "Brand name is required").max(100),
  brandUrl: z
    .string()
    .transform((v) => {
      const s = v.trim();
      if (!s) return s;
      return /^https?:\/\//i.test(s) ? s : `https://${s}`;
    })
    .pipe(z.string().url("Enter a valid URL").or(z.literal(""))),
  primaryColor: z.string().default("#4F46E5"),
  // Brand Intelligence — pre-filled by AI analysis, editable by user
  uniqueValueProp: z.string().max(2000).optional(),
  competitors: z.array(z.string()).default([]),
  keyProducts: z.array(z.string()).default([]),
  targetLocation: z.string().optional(),
});

export const updateWebsiteSchema = createWebsiteSchema.partial().extend({
  autoPublish: z.boolean().optional(),
  postsPerWeek: z.number().min(1).max(14).optional(),
  publishTime: z.string().optional(),
  publishDays: z.string().optional(),
  hostingMode: z.enum(["HOSTED", "API", "WEBHOOK", "HYBRID"]).optional(),
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  customDomain: z.string().optional().nullable(),
  googleAnalyticsId: z.string().optional().nullable(),
  twitterApiKey: z.string().optional().nullable(),
  twitterApiSecret: z.string().optional().nullable(),
  twitterAccessToken: z.string().optional().nullable(),
  twitterAccessSecret: z.string().optional().nullable(),
});

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>;
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;
