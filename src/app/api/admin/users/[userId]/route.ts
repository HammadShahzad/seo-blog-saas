import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  plan: z.enum(["FREE", "STARTER", "GROWTH", "AGENCY", "ENTERPRISE"]).optional(),
  maxWebsites: z.number().int().min(0).max(1000).optional(),
  maxPostsPerMonth: z.number().int().min(0).max(10000).optional(),
  maxImagesPerMonth: z.number().int().min(0).max(10000).optional(),
  websitesUsed: z.number().int().min(0).optional(),
  postsGeneratedThisMonth: z.number().int().min(0).optional(),
  imagesGeneratedThisMonth: z.number().int().min(0).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.systemRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { userId } = resolvedParams;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      role,
      plan,
      maxWebsites,
      maxPostsPerMonth,
      maxImagesPerMonth,
      websitesUsed,
      postsGeneratedThisMonth,
      imagesGeneratedThisMonth,
    } = parsed.data;

    if (role) {
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
    }

    if (
      plan !== undefined ||
      maxWebsites !== undefined ||
      maxPostsPerMonth !== undefined ||
      maxImagesPerMonth !== undefined ||
      websitesUsed !== undefined ||
      postsGeneratedThisMonth !== undefined ||
      imagesGeneratedThisMonth !== undefined
    ) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            ...(plan !== undefined && { plan }),
            ...(maxWebsites !== undefined && { maxWebsites }),
            ...(maxPostsPerMonth !== undefined && { maxPostsPerMonth }),
            ...(maxImagesPerMonth !== undefined && { maxImagesPerMonth }),
            ...(websitesUsed !== undefined && { websitesUsed }),
            ...(postsGeneratedThisMonth !== undefined && { postsGeneratedThisMonth }),
            ...(imagesGeneratedThisMonth !== undefined && { imagesGeneratedThisMonth }),
          },
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[ADMIN_USER_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
