"use client";

import { useEffect, useRef, useState } from "react";

const TARGET_SEC = 1800;
const TICK_MS = 15000;

function formatMmSs(total: number) {
  const s = Math.max(0, Math.floor(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function LibraryReadingTracker({
  enabled,
  initialSeconds,
}: {
  enabled: boolean;
  initialSeconds: number;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const secondsRef = useRef(initialSeconds);
  const lastScrollAtRef = useRef(0);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    setSeconds(initialSeconds);
    secondsRef.current = initialSeconds;
  }, [initialSeconds]);

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => {
      lastScrollAtRef.current = Date.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function tick() {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (secondsRef.current >= TARGET_SEC) return;
      if (Date.now() - lastScrollAtRef.current > 20000) return;

      const res = await fetch("/api/points/library-heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deltaSeconds: 15 }),
      });
      if (!res.ok) return;
      const data = (await res.json().catch(() => null)) as { seconds?: number } | null;
      if (cancelled || !data || typeof data.seconds !== "number") return;
      setSeconds(data.seconds);
    }

    const id = window.setInterval(tick, TICK_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        Sign in to record reading time toward your daily library mission (timer runs only while this tab is visible).
      </div>
    );
  }

  const pct = Math.min(100, (seconds / TARGET_SEC) * 100);

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">Today&apos;s reading on this page</span>
        <span className="tabular-nums text-emerald-900">
          {formatMmSs(seconds)} / {formatMmSs(TARGET_SEC)}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-200/80">
        <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-emerald-900/80">
        Time accrues in {TICK_MS / 1000}s steps only while this tab is visible and you keep scrolling this page.
      </p>
    </div>
  );
}
