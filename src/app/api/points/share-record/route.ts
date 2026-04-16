import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

/** Records that the user copied a species share link today (one row per user per day). */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const day = todayUtcDate();
  await prisma.shareEventDay.upsert({
    where: { userId_day: { userId: session.sub, day } },
    create: { userId: session.sub, day },
    update: {},
  });

  return NextResponse.json({ ok: true, recorded: true });
}
