import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  taskSlug: z.string().min(1),
});

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

async function verifyTaskEligible(userId: string, day: string, taskSlug: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (taskSlug === "read_library_30") {
    const row = await prisma.libraryReadingDay.findUnique({
      where: { userId_day: { userId, day } },
    });
    if (!row || row.seconds < 1800) {
      return {
        ok: false,
        message:
          "Not eligible yet: stay on the Conservation library page until the built-in timer reaches 30 minutes (time is recorded automatically).",
      };
    }
    return { ok: true };
  }

  if (taskSlug === "share_species") {
    const row = await prisma.shareEventDay.findUnique({
      where: { userId_day: { userId, day } },
    });
    if (!row) {
      return {
        ok: false,
        message:
          "Not eligible yet: open any species page and use Share — the app records a successful copy to clipboard.",
      };
    }
    return { ok: true };
  }

  if (taskSlug === "browse_three_species") {
    const rows = await prisma.speciesVisitDay.findMany({
      where: { userId, day },
      select: { slug: true },
    });
    const n = new Set(rows.map((r) => r.slug)).size;
    if (n < 3) {
      return {
        ok: false,
        message: `Not eligible yet: open ${3 - n} more distinct species detail page(s) today (visits are recorded automatically).`,
      };
    }
    return { ok: true };
  }

  return { ok: false, message: "Unknown task." };
}

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

  const task = await prisma.dailyTaskDefinition.findUnique({
    where: { slug: parsed.data.taskSlug },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const day = todayUtcDate();
  const existing = await prisma.userTaskCompletion.findUnique({
    where: {
      userId_taskId_day: { userId: session.sub, taskId: task.id, day },
    },
  });
  if (existing) {
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    return NextResponse.json({ ok: true, already: true, points: user?.points ?? 0 });
  }

  const eligible = await verifyTaskEligible(session.sub, day, task.slug);
  if (!eligible.ok) {
    return NextResponse.json({ error: eligible.message }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.userTaskCompletion.create({
      data: { userId: session.sub, taskId: task.id, day },
    }),
    prisma.user.update({
      where: { id: session.sub },
      data: { points: { increment: task.pointsReward } },
    }),
  ]);

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  return NextResponse.json({ ok: true, points: user?.points ?? 0, earned: task.pointsReward });
}
