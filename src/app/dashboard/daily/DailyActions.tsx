"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

type Task = {
  id: string;
  slug: string;
  title: string;
  description: string;
  pointsReward: number;
  done: boolean;
};

type Progress = {
  librarySeconds: number;
  shareRecorded: boolean;
  distinctSpeciesVisits: number;
};

const LIBRARY_TARGET = 1800;
const SPECIES_TARGET = 3;

function canClaimTask(slug: string, p: Progress): boolean {
  if (slug === "read_library_30") return p.librarySeconds >= LIBRARY_TARGET;
  if (slug === "share_species") return p.shareRecorded;
  if (slug === "browse_three_species") return p.distinctSpeciesVisits >= SPECIES_TARGET;
  return false;
}

export function DailyActions({
  checkedInToday,
  progress,
  tasks,
}: {
  checkedInToday: boolean;
  progress: Progress;
  tasks: Task[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localCheckIn, setLocalCheckIn] = useState(checkedInToday);

  async function checkIn() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/points/check-in", { method: "POST", credentials: "include" });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(typeof data.error === "string" ? data.error : "Check-in failed");
      return;
    }
    setLocalCheckIn(true);
    setMsg(data.already ? "Already checked in today" : `Earned +${data.earned ?? 5} points`);
    router.refresh();
  }

  async function completeTask(slug: string) {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/points/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ taskSlug: slug }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(typeof data.error === "string" ? data.error : "Task failed");
      return;
    }
    setMsg(data.already ? "Already completed today" : `Earned +${data.earned ?? 0} points`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Daily check-in</h2>
            <p className="text-xs text-stone-600">Once per day · +5 points</p>
          </div>
          <button
            type="button"
            disabled={loading || localCheckIn}
            onClick={checkIn}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {localCheckIn ? "Checked in" : "Check in"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Daily missions</h2>
        <ul className="space-y-3">
          {tasks.map((t) => {
            const eligible = canClaimTask(t.slug, progress);
            const disabled = loading || t.done || !eligible;

            let progressBar: ReactNode = null;
            if (t.slug === "read_library_30") {
              const pct = Math.min(100, (progress.librarySeconds / LIBRARY_TARGET) * 100);
              progressBar = (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Reading time (library page)</span>
                    <span className="tabular-nums">
                      {Math.floor(progress.librarySeconds / 60)}m {progress.librarySeconds % 60}s / 30m
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            } else if (t.slug === "share_species") {
              progressBar = (
                <p className="mt-2 text-xs text-stone-600">
                  Share recorded today:{" "}
                  <span className="font-medium text-emerald-900">{progress.shareRecorded ? "Yes" : "Not yet"}</span>
                </p>
              );
            } else if (t.slug === "browse_three_species") {
              const pct = Math.min(100, (progress.distinctSpeciesVisits / SPECIES_TARGET) * 100);
              progressBar = (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Distinct species pages today</span>
                    <span className="tabular-nums">
                      {progress.distinctSpeciesVisits} / {SPECIES_TARGET}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }

            return (
              <li key={t.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{t.title}</p>
                    <p className="mt-1 text-sm text-stone-700">{t.description}</p>
                    <p className="mt-2 text-xs text-stone-500">Reward: +{t.pointsReward} points</p>
                    {progressBar}
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => completeTask(t.slug)}
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
                  >
                    {t.done ? "Done today" : eligible ? "Claim reward" : "Locked"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {msg ? <p className="text-sm text-stone-800">{msg}</p> : null}
    </div>
  );
}
