import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StudentPanel } from "./StudentPanel";

export default async function LearnPage() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT" || !session.schoolId) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.sub } });

  const activities = await prisma.activity.findMany({
    where: { program: { schoolId: session.schoolId } },
    include: { program: true },
    orderBy: { createdAt: "desc" },
  });

  const submissions = await prisma.submission.findMany({
    where: { studentId: session.sub },
    include: { activity: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Learn &amp; contribute</h1>
        <p className="mt-1 text-sm text-stone-600">
          Student-safe workflow: sighting reports can be published to the school&apos;s public library without exposing personal
          profiles.
        </p>
      </div>

      {activities.length ? (
        <StudentPanel
          activities={activities.map((a) => ({
            id: a.id,
            title: a.title,
            instructions: a.instructions,
            program: { title: a.program.title },
          }))}
          initialEmoji={user.avatarEmoji}
          initialHue={user.themeHue}
        />
      ) : (
        <p className="text-sm text-stone-600">No activities published for your school yet.</p>
      )}

      <section>
        <h2 className="text-sm font-semibold">Your recent submissions</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {submissions.map((s) => (
            <li key={s.id} className="rounded-lg border border-stone-200 bg-white p-3">
              <p className="text-xs text-stone-500">{s.activity.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-stone-800">{s.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
