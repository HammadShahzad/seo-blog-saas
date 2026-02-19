import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateJSON } from "@/lib/ai/gemini";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;

    const clusters = await prisma.topicCluster.findMany({
      where: { websiteId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clusters);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;
    const body = await req.json();

    // If AI generation requested
    if (body.generate) {
      const website = await prisma.website.findUnique({
        where: { id: websiteId },
      });

      if (!website) {
        return NextResponse.json({ error: "Website not found" }, { status: 404 });
      }

      interface ClusterData {
        pillarKeyword: string;
        name: string;
        supportingKeywords: string[];
        rationale: string;
      }

      const clusters = await generateJSON<{ clusters: ClusterData[] }>(
        `Generate 5 topic clusters for a "${website.niche}" blog targeting "${website.targetAudience}".
         
         Each cluster should have:
         - A broad pillar keyword (high search volume, foundational topic)
         - 5-8 supporting long-tail keywords that relate to and support the pillar
         - A cluster name that describes the theme
         
         Return JSON:
         {
           "clusters": [
             {
               "pillarKeyword": "invoicing software",
               "name": "Invoicing & Billing",
               "supportingKeywords": ["how to create an invoice", "invoice template for freelancers", ...],
               "rationale": "Why this cluster matters for the website"
             }
           ]
         }`
      );

      const created = await Promise.all(
        clusters.clusters.map((c) =>
          prisma.topicCluster.create({
            data: {
              websiteId,
              name: c.name,
              pillarKeyword: c.pillarKeyword,
              supportingKeywords: c.supportingKeywords,
              status: "PLANNED",
            },
          })
        )
      );

      return NextResponse.json(created, { status: 201 });
    }

    // Manual creation
    const cluster = await prisma.topicCluster.create({
      data: {
        websiteId,
        name: body.name,
        pillarKeyword: body.pillarKeyword,
        supportingKeywords: body.supportingKeywords || [],
        status: "PLANNED",
      },
    });

    return NextResponse.json(cluster, { status: 201 });
  } catch (error) {
    console.error("Error creating cluster:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;
    const { searchParams } = new URL(req.url);
    const clusterId = searchParams.get("id");

    if (!clusterId) {
      return NextResponse.json({ error: "Cluster ID required" }, { status: 400 });
    }

    await prisma.topicCluster.delete({
      where: { id: clusterId, websiteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cluster:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
