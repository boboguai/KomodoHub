import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { localSpeciesImage } from "@/lib/localImageMap";

export default async function SpeciesIndexPage() {
  const list = await prisma.species.findMany({ orderBy: { commonName: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Endangered species database</h1>
        <p className="mt-1 text-sm text-stone-600">
          Worldwide coverage (not limited to Indonesia). Guests can browse without logging in.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {list.map((s) => (
          <li key={s.id}>
            <Link
              href={`/species/${s.slug}`}
              className="flex overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:border-emerald-300"
            >
              <div className="relative h-28 w-28 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={localSpeciesImage(s.slug, s.imageUrl)} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 p-3">
                <p className="truncate text-sm font-medium">{s.commonName}</p>
                <p className="text-xs text-stone-500">{s.regionLabel}</p>
                <p className="mt-1 line-clamp-2 text-xs text-stone-600">{s.summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
