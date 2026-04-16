"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { localRewardImage } from "@/lib/localImageMap";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  animalTheme: string;
  imageUrl: string;
};

export function RewardsClient({
  products,
  species,
}: {
  products: Product[];
  species: { slug: string; commonName: string }[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultSlug = species[0]?.slug ?? "";
  const initialPicks = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of products) m[p.slug] = defaultSlug;
    return m;
  }, [products, defaultSlug]);

  const [picks, setPicks] = useState<Record<string, string>>(initialPicks);

  async function redeem(productSlug: string) {
    const chosenSpeciesSlug = picks[productSlug] ?? defaultSlug;
    if (!chosenSpeciesSlug) return;
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug, chosenSpeciesSlug }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(typeof data.error === "string" ? data.error : "Redeem failed");
      return;
    }
    setMsg(typeof data.message === "string" ? data.message : "Redeemed");
    router.refresh();
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((p) => (
        <article key={p.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="relative h-40 w-full bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={localRewardImage(p.slug, p.imageUrl)} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="space-y-2 p-4">
            <h2 className="font-semibold leading-snug">{p.name}</h2>
            <p className="text-sm text-stone-700">{p.description}</p>
            <p className="text-xs text-stone-500">
              {p.category} · {p.animalTheme}
            </p>
            <p className="text-sm font-medium text-emerald-900">{p.pointsCost} points</p>

            <label className="block text-xs">
              Choose species artwork
              <select
                className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
                value={picks[p.slug] ?? defaultSlug}
                onChange={(e) => setPicks((prev) => ({ ...prev, [p.slug]: e.target.value }))}
              >
                {species.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.commonName}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-800 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              onClick={() => redeem(p.slug)}
            >
              Redeem
            </button>
          </div>
        </article>
      ))}
      {msg ? <p className="col-span-full text-sm text-stone-800">{msg}</p> : null}
    </div>
  );
}
