import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { wodId, userId, score, notes } = await req.json();
  const result = await prisma.wodResult.upsert({
    where: { wodId_userId: { wodId, userId } },
    create: { wodId, userId, score, notes },
    update: { score, notes },
    include: { user: true },
  });
  return NextResponse.json(result);
}
