import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CalendarClient from "./calendar-client";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { websiteId } = await params;

  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    select: { id: true, brandName: true, primaryColor: true },
  });

  if (!website) redirect("/dashboard/websites");

  // Fetch all posts with dates
  const posts = await prisma.blogPost.findMany({
    where: { websiteId },
    select: {
      id: true,
      title: true,
      status: true,
      publishedAt: true,
      scheduledAt: true,
      createdAt: true,
      keyword: { select: { keyword: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = posts.map(p => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    scheduledAt: p.scheduledAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <CalendarClient
      websiteId={websiteId}
      website={website}
      posts={serialized}
    />
  );
}
