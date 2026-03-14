import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const user = await prisma.user.upsert({
    where: { name },
    create: { name },
    update: {},
  });
  return NextResponse.json(user);
}
