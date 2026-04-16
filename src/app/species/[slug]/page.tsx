import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import { SpeciesVisitRecorder } from "@/components/SpeciesVisitRecorder";
import { localSpeciesImage } from "@/lib/localImageMap";

type Props = { params: { slug: string } };

export default async function SpeciesDetailPage({ params }: Props) {
  const session = await getSession();
  const species = await prisma.species.findUnique({ where: { slug: params.slug } });
  if (!species) notFound();

  return (
    <article className="space-y-6">
      <SpeciesVisitRecorder slug={species.slug} enabled={!!session} />
      <Link href="/species" className="text-sm text-emerald-800 hover:underline">
        ← Back to database
      </Link>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative min-h-[240px] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={localSpeciesImage(species.slug, species.imageUrl)} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col p-6">
            <p className="text-xs uppercase tracking-wide text-stone-500">{species.conservationStatus}</p>
            <h1 className="mt-1 text-3xl font-semibold">{species.commonName}</h1>
            <p className="mt-1 italic text-stone-600">{species.scientificName}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-700">{species.summary}</p>
            <dl className="mt-4 space-y-2 text-sm text-stone-700">
              <div>
                <dt className="font-medium text-stone-900">Region</dt>
                <dd>{species.regionLabel}</dd>
              </div>
              <div>
                <dt className="font-medium text-stone-900">Population (estimate)</dt>
                <dd>{species.populationEstimate}</dd>
              </div>
              <div>
                <dt className="font-medium text-stone-900">Temperament / behaviour</dt>
                <dd>{species.temperament}</dd>
              </div>
              <div>
                <dt className="font-medium text-stone-900">Habitat</dt>
                <dd>{species.habitat}</dd>
              </div>
            </dl>
            <div className="mt-auto flex justify-end pt-6">
              <ShareLinkButton
                hrefPath={`/species/${species.slug}`}
                label="Share species link"
                recordShareOnCopy
              />
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-800">Details</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{species.description}</p>
      </section>
    </article>
  );
}
