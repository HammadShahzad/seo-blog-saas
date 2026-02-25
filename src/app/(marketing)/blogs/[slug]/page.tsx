import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
import { PostArticle } from "@/components/marketing-blog/PostArticle";
import { RelatedPosts } from "@/components/marketing-blog/RelatedPosts";

const STACKSERP_SUBDOMAIN = "stackserp";

interface Props {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "https://stackserp.com";

  const website = await prisma.website.findUnique({ where: { subdomain: STACKSERP_SUBDOMAIN } });
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
  const postUrl = `${baseUrl}/blogs/${slug}`;

  return {
    title: `${title} | StackSerp Blog`,
    description,
    keywords: [
      ...(post.focusKeyword ? [post.focusKeyword] : []),
      ...(post.secondaryKeywords || []),
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: postUrl,
      siteName: "StackSerp",
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.featuredImage && {
        images: [
          {
            url: post.featuredImage,
            alt: post.featuredImageAlt || post.title,
            width: 1200,
            height: 630,
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
      canonical: postUrl,
    },
  };
}

export const revalidate = 60;

export default async function StackSerpBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "https://stackserp.com";

  const website = await prisma.website.findUnique({ where: { subdomain: STACKSERP_SUBDOMAIN } });
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

  const readingTime = post.readingTime || Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 200));
  const tags = post.tags || [];
  const postUrl = `${baseUrl}/blogs/${slug}`;

  const cleanContent = post.content
    .replace(/^```(?:markdown|md|html|text)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .replace(
      /\[INTERNAL_LINK:\s*([^\]]+)\]\(([^)]*)\)/gi,
      (_match, anchor: string) => anchor.trim()
    )
    .trim();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    author: { "@type": "Organization", name: "StackSerp", url: "https://stackserp.com" },
    publisher: { "@type": "Organization", name: "StackSerp", url: "https://stackserp.com" },
    url: postUrl,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    mainEntityOfPage: postUrl,
    ...(post.featuredImage && {
      image: { "@type": "ImageObject", url: post.featuredImage, caption: post.featuredImageAlt || post.title },
    }),
    ...(tags.length > 0 && { keywords: tags.join(", ") }),
    wordCount: post.wordCount || cleanContent.split(/\s+/).length,
    articleSection: post.category || "SEO",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "StackSerp", item: "https://stackserp.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blogs` },
      ...(post.category
        ? [{ "@type": "ListItem", position: 3, name: post.category, item: `${baseUrl}/blogs` }]
        : []),
      { "@type": "ListItem", position: post.category ? 4 : 3, name: post.title, item: postUrl },
    ],
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StackSerp",
    url: "https://stackserp.com",
    description: "AI-powered blog generation and SEO automation platform",
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
    <>
      {jsonLdObjects.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(obj) }}
        />
      ))}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            StackSerp
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blogs" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          {post.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-muted-foreground">{post.category}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{post.title}</span>
        </nav>
      </div>

      <PostArticle
        post={post}
        readingTime={readingTime}
        cleanContent={cleanContent}
        tags={tags}
        postUrl={postUrl}
      />

      {related.length > 0 && <RelatedPosts related={related} />}
    </>
  );
}
