import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  deltaSeconds: z.number().int().min(1).max(90),
});

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

/** Accumulates active reading time on /library (server-side, tamper-resistant caps). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const day = todayUtcDate();
  const delta = Math.min(parsed.data.deltaSeconds, 90);

  const row = await prisma.libraryReadingDay.upsert({
    where: { userId_day: { userId: session.sub, day } },
    create: { userId: session.sub, day, seconds: 0 },
    update: {},
  });

  const next = Math.min(row.seconds + delta, 7200);
  await prisma.libraryReadingDay.update({
    where: { id: row.id },
    data: { seconds: next },
  });

  return NextResponse.json({ ok: true, seconds: next, target: 1800 });
}
