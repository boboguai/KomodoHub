import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DailyActions } from "./DailyActions";

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DailyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const day = todayUtcDate();
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) redirect("/login");

  const checkIn = await prisma.dailyCheckIn.findUnique({
    where: { userId_day: { userId: session.sub, day } },
  });

  const tasks = await prisma.dailyTaskDefinition.findMany({ orderBy: { sortOrder: "asc" } });
  const completions = await prisma.userTaskCompletion.findMany({
    where: { userId: session.sub, day },
    select: { taskId: true },
  });
  const done = new Set(completions.map((c) => c.taskId));

  const [readingDay, shareDay, visitRows] = await Promise.all([
    prisma.libraryReadingDay.findUnique({ where: { userId_day: { userId: session.sub, day } } }),
    prisma.shareEventDay.findUnique({ where: { userId_day: { userId: session.sub, day } } }),
    prisma.speciesVisitDay.findMany({
      where: { userId: session.sub, day },
      select: { slug: true },
    }),
  ]);
  const distinctSpeciesVisits = new Set(visitRows.map((r) => r.slug)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily tasks</h1>
        <p className="mt-1 text-sm text-stone-600">
          Check in for points, then complete missions once the app has verified reading time, sharing, and species visits.
        </p>
        <p className="mt-2 text-sm">
          Your points: <span className="font-semibold text-emerald-900">{user.points}</span>
        </p>
      </div>

      <DailyActions
        checkedInToday={!!checkIn}
        progress={{
          librarySeconds: readingDay?.seconds ?? 0,
          shareRecorded: !!shareDay,
          distinctSpeciesVisits,
        }}
        tasks={tasks.map((t) => ({
          id: t.id,
          slug: t.slug,
          title: t.title,
          description: t.description,
          pointsReward: t.pointsReward,
          done: done.has(t.id),
        }))}
      />
    </div>
  );
}
