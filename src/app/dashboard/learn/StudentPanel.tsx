"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Activity = {
  id: string;
  title: string;
  instructions: string;
  program: { title: string };
};

export function StudentPanel({
  activities,
  initialEmoji,
  initialHue,
}: {
  activities: Activity[];
  initialEmoji: string;
  initialHue: number;
}) {
  const router = useRouter();
  const [emoji, setEmoji] = useState(initialEmoji);
  const [hue, setHue] = useState(initialHue);
  const [activityId, setActivityId] = useState(activities[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const theme = useMemo(
    () => ({
      background: `linear-gradient(135deg, hsl(${hue} 45% 96%), hsl(${(hue + 40) % 360} 35% 92%))`,
    }),
    [hue],
  );

  async function saveProfile() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarEmoji: emoji, themeHue: hue }),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg("Could not save profile");
      return;
    }
    setMsg("Profile saved");
    router.refresh();
  }

  async function submitReport() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId, body }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(typeof data.error === "string" ? data.error : "Submit failed");
      return;
    }
    setBody("");
    setMsg("Submission sent");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-stone-200 p-4 shadow-sm" style={theme}>
        <h2 className="text-sm font-semibold">Personalisation (lightweight)</h2>
        <p className="mt-1 text-xs text-stone-600">
          Case study: avatars &amp; colour schemes help younger learners feel ownership — kept minimal here.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {emoji}
          </span>
          <label className="text-xs">
            Emoji
            <input
              className="mt-1 block w-full rounded border border-stone-300 px-2 py-1 text-sm"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
            />
          </label>
        </div>
        <label className="mt-3 block text-xs">
          Theme hue (0–360)
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <button
          type="button"
          onClick={saveProfile}
          disabled={loading}
          className="mt-3 rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Save profile
        </button>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Submit activity work</h2>
        <label className="mt-3 block text-xs">
          Activity
          <select
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
          >
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs">
          Your report (min 10 chars)
          <textarea
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Date, location (approximate), species clues, evidence notes — never share personal contact details."
          />
        </label>
        <button
          type="button"
          onClick={submitReport}
          disabled={loading || !activityId}
          className="mt-3 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          Submit
        </button>
        {msg ? <p className="mt-2 text-xs text-stone-700">{msg}</p> : null}
      </section>
    </div>
  );
}
