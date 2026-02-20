import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const STACKSERP_SUBDOMAIN = "stackserp";

async function getOrCreateStackSerpWebsite(adminUserId: string) {
  let website = await prisma.website.findUnique({
    where: { subdomain: STACKSERP_SUBDOMAIN },
  });

  if (!website) {
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
      include: { organizations: { select: { organizationId: true }, take: 1 } },
    });

    const orgId = user?.organizations[0]?.organizationId;
    if (!orgId) {
      throw new Error("Admin has no organization");
    }

    website = await prisma.website.create({
      data: {
        name: "StackSerp Blog",
        domain: "stackserp.com",
        subdomain: STACKSERP_SUBDOMAIN,
        brandName: "StackSerp",
        brandUrl: "https://stackserp.com",
        niche: "AI SEO & Content Marketing",
        targetAudience: "Content marketers, SEO professionals, bloggers, and SaaS founders",
        tone: "Professional yet conversational, expert-driven",
        description: "AI-powered blog generation and SEO automation platform",
        sitemapEnabled: true,
        primaryColor: "#4F46E5",
        organization: { connect: { id: orgId } },
      },
    });
  }

  return website;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.systemRole !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const website = await getOrCreateStackSerpWebsite(session.user.id);

    const posts = await prisma.blogPost.findMany({
      where: { websiteId: website.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        category: true,
        featuredImage: true,
        wordCount: true,
        views: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ websiteId: website.id, posts });
  } catch (error) {
    console.error("[Admin Blog GET]", error);
    return NextResponse.json({ error: "Failed to load blog posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.systemRole !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const website = await getOrCreateStackSerpWebsite(session.user.id);
    const body = await req.json();

    const {
      title, slug, content, excerpt,
      metaTitle, metaDescription, focusKeyword,
      secondaryKeywords, featuredImage, featuredImageAlt,
      tags, category, status, socialCaptions,
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    const existing = await prisma.blogPost.findUnique({
      where: { websiteId_slug: { websiteId: website.id, slug: finalSlug } },
    });
    if (existing) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    const post = await prisma.blogPost.create({
      data: {
        websiteId: website.id,
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || "",
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || "",
        focusKeyword: focusKeyword || "",
        secondaryKeywords: secondaryKeywords || [],
        featuredImage: featuredImage || null,
        featuredImageAlt: featuredImageAlt || null,
        tags: tags || [],
        category: category || null,
        status: status || "DRAFT",
        socialCaptions: socialCaptions || null,
        wordCount,
        readingTime: Math.ceil(wordCount / 200),
        generatedBy: "manual",
        ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[Admin Blog POST]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
