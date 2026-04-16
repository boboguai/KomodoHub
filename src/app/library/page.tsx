import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { LibraryReadingTracker } from "@/components/LibraryReadingTracker";
import { localBookImage } from "@/lib/localImageMap";

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();
  const day = todayUtcDate();
  const readingRow =
    session &&
    (await prisma.libraryReadingDay.findUnique({
      where: { userId_day: { userId: session.sub, day } },
    }));

  const schoolSlug = typeof searchParams.school === "string" ? searchParams.school : null;
  const school = schoolSlug
    ? await prisma.school.findUnique({ where: { slug: schoolSlug } })
    : null;

  const books = await prisma.libraryBook.findMany({
    where: school
      ? {
          OR: [{ schoolId: school.id }, { schoolId: null }],
        }
      : {},
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-6">
      <LibraryReadingTracker enabled={!!session} initialSeconds={readingRow?.seconds ?? 0} />

      <div>
        <h1 className="text-2xl font-semibold">School conservation library</h1>
        <p className="mt-1 text-sm text-stone-600">
          Books and reading lists about <strong>what endangered species are</strong>, <strong>how to protect them</strong>,
          habitats, and responsible behaviour — including materials curated for partner schools.
        </p>
        {school ? (
          <p className="mt-2 text-sm text-emerald-900">
            Filter: <span className="font-medium">{school.name}</span> + global titles
          </p>
        ) : (
          <p className="mt-2 text-sm text-stone-500">
            Tip: open from your school page with <code className="rounded bg-stone-100 px-1">?school=ujung-raya</code> to
            emphasise school-curated titles.
          </p>
        )}
      </div>

      <ul className="space-y-4">
        {books.map((b) => (
          <li key={b.id} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {b.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={localBookImage(b.title, b.coverUrl)} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <h2 className="font-medium leading-snug">{b.title}</h2>
              <p className="text-xs text-stone-500">{b.author}</p>
              <p className="mt-2 text-sm text-stone-700">{b.summary}</p>
              <p className="mt-2 text-xs text-stone-500">Topics: {b.topics}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
