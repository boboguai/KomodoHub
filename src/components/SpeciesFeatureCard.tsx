import Link from "next/link";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import { localSpeciesImage } from "@/lib/localImageMap";

type Species = {
  slug: string;
  commonName: string;
  scientificName: string;
  summary: string;
  habitat: string;
  regionLabel: string;
  populationEstimate: string;
  temperament: string;
  conservationStatus: string;
  imageUrl: string;
};

export function SpeciesFeatureCard({ s }: { s: Species }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm md:flex-row md:min-h-[220px]">
      <div className="relative w-full md:w-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={localSpeciesImage(s.slug, s.imageUrl)} alt="" className="h-48 w-full object-cover md:h-full" loading="lazy" />
      </div>
      <div className="relative flex w-full flex-col p-4 md:w-1/2 md:min-h-[220px]">
        <p className="text-xs uppercase tracking-wide text-emerald-800">{s.conservationStatus}</p>
        <h3 className="mt-1 text-lg font-semibold leading-snug">{s.commonName}</h3>
        <p className="text-xs italic text-stone-500">{s.scientificName}</p>
        <p className="mt-2 line-clamp-3 text-sm text-stone-700">{s.summary}</p>
        <dl className="mt-3 space-y-1 text-xs text-stone-600">
          <div>
            <dt className="inline font-medium text-stone-800">Region: </dt>
            <dd className="inline">{s.regionLabel}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-stone-800">Habitat: </dt>
            <dd className="inline">{s.habitat}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-stone-800">Population (est.): </dt>
            <dd className="inline">{s.populationEstimate}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-stone-800">Temperament: </dt>
            <dd className="inline">{s.temperament}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
          <Link href={`/species/${s.slug}`} className="text-sm font-medium text-emerald-800 hover:underline">
            Full details →
          </Link>
          <div className="ml-auto">
            <ShareLinkButton hrefPath={`/species/${s.slug}`} label="Share" recordShareOnCopy />
          </div>
        </div>
      </div>
    </div>
  );
}
