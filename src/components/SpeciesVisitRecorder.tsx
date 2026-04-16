"use client";

import { useEffect, useRef } from "react";

/** Records one species detail view per day for browse-three-species progress (logged-in users only). */
export function SpeciesVisitRecorder({ slug, enabled }: { slug: string; enabled: boolean }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!enabled || sent.current) return;
    sent.current = true;

    void fetch("/api/species/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ slug }),
    }).catch(() => {
      sent.current = false;
    });
  }, [slug, enabled]);

  return null;
}
