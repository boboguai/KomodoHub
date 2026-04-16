import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function TeachingPage() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER" || !session.schoolId) {
    redirect("/dashboard");
  }

  const activities = await prisma.activity.findMany({
    where: { program: { schoolId: session.schoolId } },
    include: { program: true, submissions: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Teaching</h1>
        <p className="mt-1 text-sm text-stone-600">
          Review programme activities and incoming submissions for your school (privacy-preserving overview).
        </p>
      </div>

      <ul className="space-y-4">
        {activities.map((a) => (
          <li key={a.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-medium">{a.title}</h2>
              <span className="text-xs text-stone-500">{a.program.title}</span>
            </div>
            <p className="mt-2 text-sm text-stone-700">{a.instructions}</p>
            <p className="mt-3 text-xs text-stone-500">
              Submissions received: <span className="font-medium text-stone-800">{a.submissions.length}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
