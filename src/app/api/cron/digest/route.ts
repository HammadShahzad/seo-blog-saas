/**
 * POST /api/cron/digest
 * Send weekly digest emails to all active organization owners
 * Schedule: every Monday at 9am UTC
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWeeklyDigestEmail } from "@/lib/email";
import { requireCronAuth } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sent: string[] = [];

  try {
    // Get all orgs with active websites
    const orgs = await prisma.organization.findMany({
      include: {
        members: {
          where: { role: "OWNER" },
          include: { user: { select: { email: true, name: true } } },
        },
        websites: {
          where: { status: "ACTIVE" },
          select: {
            id: true, brandName: true,
            blogPosts: {
              where: {
                status: "PUBLISHED",
                publishedAt: { gte: oneWeekAgo },
              },
              select: { id: true, title: true, views: true },
            },
          },
        },
      },
    });

    for (const org of orgs) {
      const owner = org.members[0]?.user;
      if (!owner?.email) continue;

      for (const website of org.websites) {
        if (website.blogPosts.length === 0) continue;

        const totalViews = website.blogPosts.reduce((s, p) => s + p.views, 0);
        const topPost = website.blogPosts.sort((a, b) => b.views - a.views)[0];

        await sendWeeklyDigestEmail({
          to: owner.email,
          userName: owner.name || "there",
          websiteName: website.brandName,
          postsPublished: website.blogPosts.length,
          totalViews,
          topPost: topPost ? {
            title: topPost.title,
            views: topPost.views,
            url: `${process.env.NEXTAUTH_URL}/dashboard/websites/${website.id}/posts/${topPost.id}`,
          } : undefined,
          dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/websites/${website.id}`,
        });

        sent.push(`${owner.email} → ${website.brandName}`);
      }
    }

    return NextResponse.json({ sent: sent.length, emails: sent });
  } catch (error) {
    console.error("Digest cron error:", error);
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}
