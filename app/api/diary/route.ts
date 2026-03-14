import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const date = searchParams.get("date");

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const entry = await prisma.diaryEntry.findFirst({
      where: { userId, date: { gte: start, lte: end } },
    });
    return NextResponse.json(entry);
  }

  const entries = await prisma.diaryEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const { userId, date, content, rating } = await req.json();
  const dateObj = new Date(date);
  dateObj.setHours(12, 0, 0, 0);

  const entry = await prisma.diaryEntry.upsert({
    where: { userId_date: { userId, date: dateObj } },
    create: { userId, date: dateObj, content, rating },
    update: { content, rating },
  });
  return NextResponse.json(entry);
}
