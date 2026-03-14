import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const { userId, title, description, targetDate } = await req.json();
  const goal = await prisma.goal.create({
    data: {
      userId,
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });
  return NextResponse.json(goal);
}

export async function PATCH(req: Request) {
  const { id, completed } = await req.json();
  const goal = await prisma.goal.update({
    where: { id },
    data: { completed },
  });
  return NextResponse.json(goal);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
