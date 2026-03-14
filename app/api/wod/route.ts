import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const wod = await prisma.wOD.findFirst({
      where: { date: { gte: start, lte: end } },
      include: { results: { include: { user: true } } },
    });
    return NextResponse.json(wod);
  }

  const wods = await prisma.wOD.findMany({
    orderBy: { date: "desc" },
    take: 30,
    include: { results: { include: { user: true } } },
  });
  return NextResponse.json(wods);
}

export async function POST(req: Request) {
  const { date, title, description, wodType } = await req.json();
  const wod = await prisma.wOD.create({
    data: {
      date: new Date(date),
      title,
      description,
      wodType,
    },
  });
  return NextResponse.json(wod);
}
