import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AddSpeciesForm } from "./AddSpeciesForm";

export default async function SpeciesAdminPage() {
  const session = await getSession();
  if (!session || session.role !== "FOUNDATION_ADMIN") {
    redirect("/dashboard");
  }

  const list = await prisma.species.findMany({ orderBy: { commonName: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Species content</h1>
        <p className="mt-1 text-sm text-stone-600">
          Foundation administrator tooling for the public knowledge base (aligned with Yayasan Komodo&apos;s content mandate).
        </p>
      </div>

      <AddSpeciesForm />

      <div>
        <h2 className="text-sm font-semibold text-stone-800">Existing entries</h2>
        <ul className="mt-2 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white text-sm">
          {list.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span className="font-medium">{s.commonName}</span>
              <span className="text-xs text-stone-500">{s.slug}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
