import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL || "https://stackserp.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    // Core marketing pages
    { url: BASE_URL,                                  lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/features`,                    lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`,                     lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/integrations`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/docs`,                        lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },

    // Use-cases
    { url: `${BASE_URL}/use-cases`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/use-cases/saas`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/use-cases/agencies`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/use-cases/startups`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/use-cases/publishers`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },

    // Company
    { url: `${BASE_URL}/about`,                       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`,                     lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE_URL}/changelog`,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },

    // Auth
    { url: `${BASE_URL}/login`,                       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/register`,                    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },

    // Legal (low priority, noindex is fine but include for completeness)
    { url: `${BASE_URL}/privacy`,                     lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/terms`,                       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/dpa`,                         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.1 },
  ];

  // StackSerp's own blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const stackserpSite = await prisma.website.findUnique({
      where: { subdomain: "stackserp" },
      select: { id: true },
    });

    if (stackserpSite) {
      const posts = await prisma.blogPost.findMany({
        where: { websiteId: stackserpSite.id, status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      });

      blogPages = [
        {
          url: `${BASE_URL}/blogs`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        },
        ...posts.map((post) => ({
          url: `${BASE_URL}/blogs/${post.slug}`,
          lastModified: post.updatedAt || post.publishedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ];
    }
  } catch {
    // DB not available during build — skip blog pages
  }

  return [...staticPages, ...blogPages];
}
