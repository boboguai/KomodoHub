import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: { slug: string } };

export default async function SchoolPublicPage({ params }: Props) {
  const school = await prisma.school.findUnique({
    where: { slug: params.slug },
  });
  if (!school) notFound();

  const items = await prisma.submission.findMany({
    where: {
      isPublicToSchoolLibrary: true,
      student: { schoolId: school.id },
    },
    include: { activity: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-stone-500">School library (public)</p>
        <h1 className="text-2xl font-semibold">{school.name}</h1>
        <p className="mt-1 text-sm text-stone-600">
          Visitors can browse selected class contributions. Student identities are not shown on this page (case privacy rule).
        </p>
        <p className="mt-3">
          <Link href={`/library?school=${school.slug}`} className="text-sm font-medium text-emerald-800 hover:underline">
            Open conservation books library →
          </Link>
        </p>
      </header>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
            No public library items yet.
          </li>
        ) : (
          items.map((s) => (
            <li key={s.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-stone-500">
                Activity: <span className="font-medium text-stone-700">{s.activity.title}</span>
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800">{s.body}</p>
              <p className="mt-2 text-xs text-stone-400">Contributor: verified student (profile hidden)</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
