"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { localSpeciesImage } from "@/lib/localImageMap";

type Initial = {
  displayName: string;
  nickname: string | null;
  gender: string | null;
  bio: string | null;
  favoriteAnimal: string | null;
  avatarEmoji: string;
  avatarImageUrl: string | null;
  points: number;
  role: string;
};

export function ProfileEditor({
  initial,
  species,
}: {
  initial: Initial;
  species: { slug: string; commonName: string }[];
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [nickname, setNickname] = useState(initial.nickname ?? "");
  const [gender, setGender] = useState(initial.gender ?? "PREFER_NOT_SAY");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [favoriteAnimal, setFavoriteAnimal] = useState(initial.favoriteAnimal ?? "");
  const [avatarEmoji] = useState(initial.avatarEmoji); // kept for backward compatibility
  const [avatarImageUrl, setAvatarImageUrl] = useState(initial.avatarImageUrl ?? "");
  const [avatarSpecies, setAvatarSpecies] = useState(species[0]?.slug ?? "");
  const [points, setPoints] = useState(initial.points);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        nickname: nickname.trim() || null,
        gender,
        bio: bio.trim() || null,
        favoriteAnimal: favoriteAnimal.trim() || null,
        avatarEmoji,
        avatarImageUrl: avatarImageUrl.trim(),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg("Could not save");
      return;
    }
    const data = await res.json();
    setPoints(data.points ?? points);
    setMsg("Saved");
    router.refresh();
  }

  async function uploadAvatar(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/me/avatar-upload", {
      method: "POST",
      body: form,
      credentials: "include",
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data.path !== "string") {
      setMsg(typeof data.error === "string" ? data.error : "Upload failed");
      return;
    }
    setAvatarImageUrl(data.path);
    setMsg("Avatar uploaded. Click Save profile to apply.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Avatar</h2>
        <p className="mt-1 text-xs text-stone-600">
          Role: <span className="font-medium">{initial.role}</span> · Points:{" "}
          <span className="font-medium">{points}</span>
        </p>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
            {avatarImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarImageUrl} alt="Avatar preview" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-2xl">{avatarEmoji}</span>
            )}
          </div>
          <p className="text-xs text-stone-600">Choose species avatar or upload your own image file.</p>
        </div>

        <label className="mt-3 block text-xs">
          Pick from species database
          <div className="mt-1 flex gap-2">
            <select
              className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
              value={avatarSpecies}
              onChange={(e) => setAvatarSpecies(e.target.value)}
            >
              {species.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.commonName}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 text-sm hover:bg-stone-50"
              onClick={() => setAvatarImageUrl(localSpeciesImage(avatarSpecies))}
            >
              Use
            </button>
          </div>
        </label>

        <label className="mt-3 block text-xs">
          Upload custom avatar (student file upload)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadAvatar(f);
            }}
          />
        </label>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Name &amp; details</h2>
        <label className="mt-3 block text-xs">
          Display name
          <input
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-xs">
          Nickname (optional)
          <input
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-xs">
          Gender
          <select
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="PREFER_NOT_SAY">Prefer not to say</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="NONBINARY">Non-binary</option>
          </select>
        </label>
        <label className="mt-3 block text-xs">
          Bio (optional)
          <textarea
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-xs">
          Favourite animal
          <input
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={favoriteAnimal}
            onChange={(e) => setFavoriteAnimal(e.target.value)}
            placeholder="e.g. Komodo dragon"
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="mt-4 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save profile"}
        </button>
        {msg ? <p className="mt-2 text-sm text-stone-700">{msg}</p> : null}
      </section>
    </div>
  );
}
