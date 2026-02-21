import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.userJob.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, type, label, status, progress, step, steps, error, data, href, websiteId } = body;

  if (!type || !label || !websiteId)
    return NextResponse.json({ error: "type, label, websiteId required" }, { status: 400 });

  const job = await prisma.userJob.upsert({
    where: { id: id || "none" },
    update: {
      type, label, status: status || "running", progress: progress ?? 0,
      step: step ?? null, steps: steps ?? [], error: error ?? null,
      data: data ?? undefined, href: href ?? null,
    },
    create: {
      id: id || undefined,
      type, label, status: status || "running", progress: progress ?? 0,
      step: step ?? null, steps: steps ?? [], error: error ?? null,
      data: data ?? undefined, href: href ?? null,
      websiteId, userId: session.user.id,
    },
  });

  return NextResponse.json(job, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...patch } = body;

  if (!id)
    return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.userJob.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing)
    return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const updated = await prisma.userJob.update({
    where: { id },
    data: {
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.progress !== undefined && { progress: patch.progress }),
      ...(patch.step !== undefined && { step: patch.step }),
      ...(patch.error !== undefined && { error: patch.error }),
      ...(patch.data !== undefined && { data: patch.data }),
      ...(patch.label !== undefined && { label: patch.label }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.userJob.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
