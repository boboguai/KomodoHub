import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SpeciesFeatureCard } from "@/components/SpeciesFeatureCard";
import { BRAND_ORG_NAME, BRAND_SHORT, BRAND_TAGLINE } from "@/lib/brand";

export default async function Home() {
  const featured = await prisma.species.findMany({ take: 6, orderBy: { commonName: "asc" } });

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 p-8 text-stone-50 shadow-lg">
        <p className="text-xs uppercase tracking-widest text-emerald-200/90">{BRAND_ORG_NAME}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{BRAND_SHORT}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-50/90">{BRAND_TAGLINE}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/species"
            className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-300"
          >
            Browse database
          </Link>
          <Link href="/library" className="rounded-lg border border-emerald-200/40 px-4 py-2 text-sm hover:bg-white/10">
            Conservation library
          </Link>
          <Link href="/register" className="rounded-lg border border-emerald-200/40 px-4 py-2 text-sm hover:bg-white/10">
            Student register
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Featured species (worldwide)</h2>
        <p className="mt-1 text-sm text-stone-600">
          Each card shows image + key facts. Use <strong>Share</strong> to copy a public link for classmates.
        </p>
        <ul className="mt-4 space-y-6">
          {featured.map((s) => (
            <li key={s.id}>
              <SpeciesFeatureCard s={s} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
