import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  slug: z.string().min(1).max(120),
});

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

/** Records a visit to a species detail page for daily-task progress. */
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

  const exists = await prisma.species.findUnique({ where: { slug: parsed.data.slug } });
  if (!exists) {
    return NextResponse.json({ error: "Unknown species" }, { status: 404 });
  }

  const day = todayUtcDate();
  await prisma.speciesVisitDay.upsert({
    where: {
      userId_day_slug: { userId: session.sub, day, slug: parsed.data.slug },
    },
    create: { userId: session.sub, day, slug: parsed.data.slug },
    update: {},
  });

  const rows = await prisma.speciesVisitDay.findMany({
    where: { userId: session.sub, day },
    select: { slug: true },
  });
  const distinctCount = new Set(rows.map((r) => r.slug)).size;

  return NextResponse.json({ ok: true, distinctCount, target: 3 });
}
