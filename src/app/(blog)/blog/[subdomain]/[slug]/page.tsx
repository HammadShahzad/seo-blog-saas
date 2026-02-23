import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { BlogPostLayout } from "@/components/blog-post/BlogPostLayout";
import { PostArticle } from "@/components/blog-post/PostArticle";
import { RelatedPosts } from "@/components/blog-post/RelatedPosts";

interface Props {
  params: Promise<{ subdomain: string; slug: string }>;
}

function extractFAQs(content: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const faqSectionMatch = content.match(/##\s*(?:FAQ|Frequently Asked Questions)[^\n]*\n([\s\S]*?)(?=\n##\s[^#]|\n---|\Z)/i);
  if (!faqSectionMatch) return faqs;

  const faqContent = faqSectionMatch[1];
  const questionBlocks = faqContent.split(/###\s+/).filter(Boolean);

  for (const block of questionBlocks) {
    const lines = block.trim().split("\n");
    const question = lines[0]?.replace(/\*\*/g, "").replace(/\??\s*$/, "?").trim();
    const answer = lines.slice(1).join(" ").replace(/[#*_`]/g, "").trim();
    if (question && answer && answer.length > 10) {
      faqs.push({ question, answer: answer.substring(0, 500) });
    }
  }
  return faqs.slice(0, 8);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;

  const website = await prisma.website.findUnique({ where: { subdomain } });
  if (!website) return { title: "Post Not Found" };

  const post = await prisma.blogPost.findUnique({
    where: { websiteId_slug: { websiteId: website.id, slug } },
    select: {
      title: true,
      metaTitle: true,
      metaDescription: true,
      excerpt: true,
      focusKeyword: true,
      secondaryKeywords: true,
      featuredImage: true,
      featuredImageAlt: true,
      publishedAt: true,
    },
  });

  if (!post) return { title: "Post Not Found" };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const blogUrl = website.customDomain
    ? `https://${website.customDomain}/blog/${subdomain}/${slug}`
    : `${process.env.NEXTAUTH_URL || ""}/blog/${subdomain}/${slug}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    icons: website.faviconUrl
      ? { icon: website.faviconUrl, apple: website.faviconUrl }
      : undefined,
    keywords: [
      ...(post.focusKeyword ? [post.focusKeyword] : []),
      ...(post.secondaryKeywords || []),
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: blogUrl,
      siteName: website.brandName,
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.featuredImage && {
        images: [
          {
            url: post.featuredImage,
            alt: post.featuredImageAlt || post.title,
            width: 1600,
            height: 840,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.featuredImage && { images: [post.featuredImage] }),
    },
    alternates: {
      canonical: blogUrl,
    },
  };
}

export const revalidate = 3600;

export default async function PublicBlogPostPage({ params }: Props) {
  const { subdomain, slug } = await params;

  const website = await prisma.website.findUnique({ where: { subdomain } });
  if (!website) notFound();

  const post = await prisma.blogPost.findUnique({
    where: { websiteId_slug: { websiteId: website.id, slug } },
    include: { keyword: { select: { parentCluster: true } } },
  });

  if (!post || post.status !== "PUBLISHED") notFound();

  prisma.blogPost
    .update({ where: { id: post.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const clusterName = post.keyword?.parentCluster;

  const relatedSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    featuredImage: true,
    featuredImageAlt: true,
    readingTime: true,
    publishedAt: true,
    category: true,
  } as const;

  let related = await prisma.blogPost.findMany({
    where: {
      websiteId: website.id,
      status: "PUBLISHED",
      id: { not: post.id },
      ...(clusterName ? { keyword: { parentCluster: clusterName } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 9,
    select: relatedSelect,
  });

  if (related.length < 9) {
    const existingIds = [post.id, ...related.map(r => r.id)];
    const moreRelated = await prisma.blogPost.findMany({
      where: {
        websiteId: website.id,
        status: "PUBLISHED",
        id: { notIn: existingIds },
        ...(post.category ? { category: post.category } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 9 - related.length,
      select: relatedSelect,
    });
    related = [...related, ...moreRelated];
  }

  if (related.length < 9) {
    const existingIds = [post.id, ...related.map(r => r.id)];
    const moreRecent = await prisma.blogPost.findMany({
      where: {
        websiteId: website.id,
        status: "PUBLISHED",
        id: { notIn: existingIds },
      },
      orderBy: { publishedAt: "desc" },
      take: 9 - related.length,
      select: relatedSelect,
    });
    related = [...related, ...moreRecent];
  }

  const brandColor = website.primaryColor || "#4F46E5";
  const readingTime = post.readingTime || Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 200));
  const tags = post.tags || [];
  const baseUrl = process.env.NEXTAUTH_URL || "";
  const postUrl = `${baseUrl}/blog/${subdomain}/${slug}`;

  const cleanContent = post.content
    .replace(/^```[a-zA-Z0-9_-]*\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .replace(
      /\[INTERNAL_LINK:\s*([^\]]+)\]\(([^)]*)\)/gi,
      (_match, anchor: string) => anchor.trim()
    )
    .trim()
    .replace(/^(\s*[-*]\s+\[[^\]]*)\n\s*([^\n]*?\]\(#[^)]+\))/gm, "$1 $2")
    .replace(/^\s*[^-*#\s][^\n]*\]\(#[^)]+\)\s*$/gm, "")
    .replace(/(## Table of Contents\n(?:\s*[-*]\s+.*\n)*)([\s\S]*?)(## Table of Contents\n(?:\s*[-*]\s+.*\n)*)/gi, "$1$2");

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    author: { "@type": "Organization", name: website.brandName, url: website.brandUrl },
    publisher: {
      "@type": "Organization",
      name: website.brandName,
      url: website.brandUrl,
      ...(website.logoUrl && { logo: { "@type": "ImageObject", url: website.logoUrl } }),
    },
    url: postUrl,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    mainEntityOfPage: postUrl,
    ...(post.featuredImage && {
      image: { "@type": "ImageObject", url: post.featuredImage, caption: post.featuredImageAlt || post.title },
    }),
    ...(tags.length > 0 && { keywords: tags.join(", ") }),
    wordCount: post.wordCount || cleanContent.split(/\s+/).length,
    articleSection: post.category || website.niche,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: website.brandName, item: website.brandUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blog/${subdomain}` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: website.brandName,
    url: website.brandUrl,
    ...(website.logoUrl && { logo: { "@type": "ImageObject", url: website.logoUrl } }),
    ...(website.faviconUrl && { image: website.faviconUrl }),
    description: website.description,
  };

  const faqs = extractFAQs(cleanContent);
  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  } : null;

  const jsonLdObjects = [articleJsonLd, breadcrumbJsonLd, organizationJsonLd, ...(faqJsonLd ? [faqJsonLd] : [])];

  return (
    <BlogPostLayout
      jsonLdObjects={jsonLdObjects}
      subdomain={subdomain}
      website={website}
      post={post}
    >
      <PostArticle
        post={post}
        website={website}
        brandColor={brandColor}
        readingTime={readingTime}
        cleanContent={cleanContent}
        tags={tags}
        postUrl={postUrl}
        subdomain={subdomain}
      />
      {related.length > 0 && (
        <RelatedPosts related={related} subdomain={subdomain} />
      )}
    </BlogPostLayout>
  );
}
