import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebsiteAccess } from "@/lib/api-helpers";
import { generateClusterPreview, type ClusterKeyword } from "@/lib/ai/cluster-generator";

export const maxDuration = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const clusters = await prisma.topicCluster.findMany({
      where: { websiteId },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with keyword stats from the queue
    const enriched = await Promise.all(
      clusters.map(async (cluster) => {
        const keywords = await prisma.blogKeyword.findMany({
          where: { websiteId, parentCluster: cluster.id },
          select: { id: true, keyword: true, status: true, blogPostId: true },
        });
        const pending = keywords.filter(k => k.status === "PENDING").length;
        const generating = keywords.filter(k => ["RESEARCHING", "GENERATING"].includes(k.status)).length;
        const done = keywords.filter(k => k.status === "COMPLETED").length;
        const failed = keywords.filter(k => k.status === "FAILED").length;

        return {
          ...cluster,
          keywords,
          stats: { pending, generating, done, failed, total: keywords.length },
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching clusters:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const body = await req.json();

    // ─── Preview: research + generate cluster without saving ─────
    if (body.preview && body.seedTopic) {
      const website = await prisma.website.findUnique({
        where: { id: websiteId },
        select: {
          brandUrl: true,
          brandName: true,
          niche: true,
          description: true,
          targetAudience: true,
        },
      });
      if (!website) return NextResponse.json({ error: "Website not found" }, { status: 404 });

      const existingKws = await prisma.blogKeyword.findMany({
        where: { websiteId },
        select: { keyword: true },
        take: 60,
      });

      const preview = await generateClusterPreview(
        body.seedTopic.trim(),
        website,
        existingKws.map(k => k.keyword),
      );

      return NextResponse.json({ preview: true, ...preview });
    }

    // ─── Save: create cluster + queue selected keywords ─────────
    if (body.seedTopic && Array.isArray(body.selectedKeywords) && body.selectedKeywords.length > 0) {
      const selectedKeywords = body.selectedKeywords as ClusterKeyword[];
      const pillar = selectedKeywords.find(k => k.role === "pillar");

      const cluster = await prisma.topicCluster.create({
        data: {
          websiteId,
          name: body.pillarTitle || pillar?.keyword || body.seedTopic,
          pillarKeyword: pillar?.keyword || body.seedTopic,
          supportingKeywords: selectedKeywords
            .filter(k => k.role === "supporting")
            .map(k => k.keyword),
          status: "IN_PROGRESS",
          totalPosts: selectedKeywords.length,
        },
      });

      // Create keywords in the generation queue
      let created = 0;
      for (const kw of selectedKeywords) {
        const exists = await prisma.blogKeyword.findFirst({
          where: { websiteId, keyword: kw.keyword },
        });
        if (exists) continue;

        await prisma.blogKeyword.create({
          data: {
            keyword: kw.keyword,
            websiteId,
            priority: kw.role === "pillar" ? 10 : 5,
            parentCluster: cluster.id,
            intent: kw.searchIntent === "transactional"
              ? "TRANSACTIONAL"
              : kw.searchIntent === "commercial"
                ? "COMMERCIAL"
                : "INFORMATIONAL",
            notes: kw.description,
            status: "PENDING",
          },
        });
        created++;
      }

      return NextResponse.json({
        clusterId: cluster.id,
        pillarTitle: cluster.name,
        keywordCount: created,
        totalSelected: selectedKeywords.length,
      }, { status: 201 });
    }

    // ─── Update cluster status ──────────────────────────────────
    if (body.updateStatus && body.clusterId) {
      const updated = await prisma.topicCluster.update({
        where: { id: body.clusterId, websiteId },
        data: { status: body.status || "IN_PROGRESS" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error in cluster POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const { websiteId } = await params;
    const access = await verifyWebsiteAccess(websiteId);
    if ("error" in access) return access.error;

    const { searchParams } = new URL(req.url);
    const clusterId = searchParams.get("id");
    if (!clusterId) return NextResponse.json({ error: "Cluster ID required" }, { status: 400 });

    await prisma.topicCluster.delete({ where: { id: clusterId, websiteId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cluster:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
