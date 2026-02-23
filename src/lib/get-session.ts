import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function getRequiredSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function getCurrentOrganization() {
  const session = await getRequiredSession();

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
    include: {
      organization: {
        include: {
          subscription: true,
          websites: {
            where: { status: { not: "DELETED" } },
            orderBy: { createdAt: "asc" },
          },
          _count: { select: { websites: { where: { status: { not: "DELETED" } } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) {
    redirect("/login");
  }

  // Prefer the org with the most websites so team members see the
  // org they were invited to (which has websites) over their empty personal org.
  const sorted = memberships.sort(
    (a, b) => b.organization._count.websites - a.organization._count.websites
  );
  const membership = sorted[0];

  return {
    session,
    organization: membership.organization,
    membership,
  };
}

export async function getWebsite(websiteId: string) {
  const { session, organization, membership } = await getCurrentOrganization();

  // Check all of the user's orgs so team members can access any shared website
  const allMemberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });
  const orgIds = allMemberships.map((m) => m.organizationId);

  let website = await prisma.website.findFirst({
    where: {
      id: websiteId,
      organizationId: { in: orgIds },
      status: { not: "DELETED" },
    },
  });

  // Admin fallback: load any website
  if (!website && session.user.systemRole === "ADMIN") {
    website = await prisma.website.findFirst({
      where: { id: websiteId, status: { not: "DELETED" } },
    });
  }

  if (!website) {
    redirect("/dashboard/websites");
  }

  // Use the org that owns the website for downstream logic
  const ownerOrg = website.organizationId === organization.id
    ? organization
    : (await prisma.organization.findUnique({
        where: { id: website.organizationId },
        include: {
          subscription: true,
          websites: {
            where: { status: { not: "DELETED" } },
            orderBy: { createdAt: "asc" },
          },
        },
      })) ?? organization;

  return { session, organization: ownerOrg, website };
}
