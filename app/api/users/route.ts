import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  const { name } = await req.json();
  const user = await prisma.user.upsert({
    where: { name },
    create: { name },
    update: {},
  });
  return NextResponse.json(user);
}
