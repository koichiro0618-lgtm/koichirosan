import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const prs = await prisma.pR.findMany({
      where: { userId: Number(userId) },
      orderBy: { date: "desc" },
      include: { user: true },
    });
    return NextResponse.json(prs);
  }

  // All PRs for board
  const prs = await prisma.pR.findMany({
    orderBy: { date: "desc" },
    include: { user: true },
  });
  return NextResponse.json(prs);
}

export async function POST(req: Request) {
  const { userId, exercise, value, unit, date, notes } = await req.json();
  const pr = await prisma.pR.create({
    data: { userId, exercise, value, unit, date: new Date(date), notes },
    include: { user: true },
  });
  return NextResponse.json(pr);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.pR.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
