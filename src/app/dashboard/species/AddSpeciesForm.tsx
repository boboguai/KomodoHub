"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddSpeciesForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      slug: String(fd.get("slug") ?? "").trim(),
      commonName: String(fd.get("commonName") ?? "").trim(),
      scientificName: String(fd.get("scientificName") ?? "").trim(),
      summary: String(fd.get("summary") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      habitat: String(fd.get("habitat") ?? "").trim(),
      conservationStatus: String(fd.get("conservationStatus") ?? "").trim(),
    };

    const res = await fetch("/api/species", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Save failed");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold">Add species</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs">
          Slug (URL)
          <input name="slug" required className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm" />
        </label>
        <label className="text-xs">
          Status
          <input
            name="conservationStatus"
            required
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            placeholder="Critically Endangered"
          />
        </label>
      </div>
      <label className="text-xs block">
        Common name
        <input name="commonName" required className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm" />
      </label>
      <label className="text-xs block">
        Scientific name
        <input name="scientificName" required className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm" />
      </label>
      <label className="text-xs block">
        Summary
        <textarea name="summary" required rows={2} className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm" />
      </label>
      <label className="text-xs block">
        Habitat
        <textarea name="habitat" required rows={2} className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm" />
      </label>
      <label className="text-xs block">
        Full description
        <textarea
          name="description"
          required
          rows={4}
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
        />
      </label>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Create"}
      </button>
    </form>
  );
}
