import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const day = todayUtcDate();
  const existing = await prisma.dailyCheckIn.findUnique({
    where: { userId_day: { userId: session.sub, day } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, already: true, points: (await prisma.user.findUnique({ where: { id: session.sub } }))?.points ?? 0 });
  }

  const pointsEarned = 5;
  await prisma.$transaction([
    prisma.dailyCheckIn.create({
      data: { userId: session.sub, day, points: pointsEarned },
    }),
    prisma.user.update({
      where: { id: session.sub },
      data: { points: { increment: pointsEarned } },
    }),
  ]);

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  return NextResponse.json({ ok: true, points: user?.points ?? 0, earned: pointsEarned });
}
