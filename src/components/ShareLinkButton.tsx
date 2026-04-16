"use client";

import { useState } from "react";

export function ShareLinkButton({
  hrefPath,
  label = "Share link",
  recordShareOnCopy = false,
}: {
  hrefPath: string;
  label?: string;
  /** When true, a successful clipboard copy also records today's share for daily tasks (requires login). */
  recordShareOnCopy?: boolean;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-emerald-600"
      onClick={async () => {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url = `${origin}${hrefPath}`;
        try {
          await navigator.clipboard.writeText(url);
          if (recordShareOnCopy) {
            void fetch("/api/points/share-record", { method: "POST", credentials: "include" });
          }
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt("Copy this link:", url);
        }
      }}
    >
      {done ? "Copied!" : label}
    </button>
  );
}
