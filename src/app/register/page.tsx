"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterStudentPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("202229013001");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, displayName, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not register");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Student registration</h1>
        <p className="mt-1 text-sm text-stone-600">
          Register with Student ID + Email + Password. Allowed Student ID range:{" "}
          <code className="rounded bg-stone-100 px-1">202229013000</code> to{" "}
          <code className="rounded bg-stone-100 px-1">202229013100</code>.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <label className="block text-sm">
          <span className="text-stone-700">Student ID</span>
          <input
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            pattern="202229013[0-1][0-9][0-9]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-stone-700">Display name</span>
          <input
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            minLength={2}
          />
        </label>
        <label className="block text-sm">
          <span className="text-stone-700">Email</span>
          <input
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-stone-700">Password (min 8)</span>
          <input
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create student account"}
        </button>
      </form>
      <p className="text-center text-sm text-stone-600">
        Already registered?{" "}
        <Link href="/login" className="text-emerald-800 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
