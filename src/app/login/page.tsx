"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEACHER_ADMIN_PASSWORD } from "@/lib/authPolicy";

type Mode = "student" | "teacher_admin";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("student");
  const [studentId, setStudentId] = useState("202229013000");
  const [password, setPassword] = useState("KomodoHub2026!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        ...(mode === "student" ? { studentId } : {}),
        password,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Login failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-stone-600">
          Visitors use the site as <strong>guests</strong> without an account. Students and teacher admin use dedicated login
          modes below.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <label className="block text-sm">
          <span className="text-stone-700">Login mode</span>
          <select
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="student">Student</option>
            <option value="teacher_admin">Teacher admin</option>
          </select>
        </label>
        {mode === "student" ? (
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
        ) : (
          <p className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700">
            Teacher admin account is fixed and does not require registration. Fixed password:{" "}
            <span className="font-mono font-semibold">{TEACHER_ADMIN_PASSWORD}</span>
          </p>
        )}
        <label className="block text-sm">
          <span className="text-stone-700">Password</span>
          <input
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-center text-sm text-stone-600">
        New student?{" "}
        <Link href="/register" className="text-emerald-800 underline">
          Register with student ID
        </Link>
      </p>
    </div>
  );
}
