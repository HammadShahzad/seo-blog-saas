/**
 * Admin: manage team members for any user's organization.
 * GET  /api/admin/users/[userId]/team  — list org members
 * POST /api/admin/users/[userId]/team  — add member by email
 * DELETE with ?memberId=  /api/admin/users/[userId]/team  — remove member
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ userId: string }> };

async function getAdminOrgForUser(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId, role: "OWNER" },
    include: {
      organization: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, createdAt: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (session?.user?.systemRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const membership = await getAdminOrgForUser(userId);

  if (!membership) {
    // Try any membership if no OWNER found
    const anyMembership = await prisma.organizationMember.findFirst({
      where: { userId },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true, createdAt: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });
    if (!anyMembership) {
      return NextResponse.json({ members: [], organizationId: null });
    }
    return NextResponse.json({
      members: anyMembership.organization.members,
      organizationId: anyMembership.organizationId,
      organizationName: anyMembership.organization.name,
    });
  }

  return NextResponse.json({
    members: membership.organization.members,
    organizationId: membership.organizationId,
    organizationName: membership.organization.name,
  });
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (session?.user?.systemRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const { email, role = "MEMBER" } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Find target user's org
  const ownerMembership = await prisma.organizationMember.findFirst({
    where: { userId },
  });

  if (!ownerMembership) {
    return NextResponse.json({ error: "User has no organization" }, { status: 404 });
  }

  const invitedUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!invitedUser) {
    return NextResponse.json(
      { error: "No account found with that email address." },
      { status: 404 }
    );
  }

  const alreadyMember = await prisma.organizationMember.findFirst({
    where: {
      userId: invitedUser.id,
      organizationId: ownerMembership.organizationId,
    },
  });

  if (alreadyMember) {
    return NextResponse.json({ error: "User is already a team member" }, { status: 400 });
  }

  const newMember = await prisma.organizationMember.create({
    data: {
      userId: invitedUser.id,
      organizationId: ownerMembership.organizationId,
      role,
    },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
    },
  });

  return NextResponse.json(newMember, { status: 201 });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (session?.user?.systemRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ error: "memberId required" }, { status: 400 });
  }

  // Verify the member belongs to this user's org
  const ownerMembership = await prisma.organizationMember.findFirst({
    where: { userId },
  });

  if (!ownerMembership) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const target = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId: ownerMembership.organizationId },
  });

  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (target.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove the organization owner" }, { status: 400 });
  }

  await prisma.organizationMember.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}
