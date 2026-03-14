import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 60,
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const { userId, weight, date, notes } = await req.json();
  const log = await prisma.weightLog.create({
    data: { userId, weight, date: new Date(date), notes },
  });
  return NextResponse.json(log);
}
