import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardHomePage() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { school: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-600">
          Signed in as <span className="font-medium">{user?.displayName}</span> ({session.role}
          {user?.school ? ` · ${user.school.name}` : ""}).
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        <li>
          <Link
            href="/dashboard/profile"
            className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-300"
          >
            <p className="font-medium">Profile</p>
            <p className="mt-1 text-xs text-stone-600">Name, gender, avatar, bio.</p>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/daily"
            className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-300"
          >
            <p className="font-medium">Daily tasks</p>
            <p className="mt-1 text-xs text-stone-600">Check-in and missions for points.</p>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/rewards"
            className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-300"
          >
            <p className="font-medium">Points shop</p>
            <p className="mt-1 text-xs text-stone-600">Redeem rewards with species-themed artwork.</p>
          </Link>
        </li>
        <li>
          <Link
            href={user?.school ? `/library?school=${user.school.slug}` : "/library"}
            className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-300"
          >
            <p className="font-medium">Conservation library</p>
            <p className="mt-1 text-xs text-stone-600">Books about species and protection.</p>
          </Link>
        </li>

        {session.role === "FOUNDATION_ADMIN" ? (
          <li>
            <Link
              href="/dashboard/species"
              className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-300"
            >
              <p className="font-medium">Species CMS</p>
              <p className="mt-1 text-xs text-stone-600">Maintain the public knowledge base entries.</p>
            </Link>
          </li>
        ) : null}

        {session.role === "SCHOOL_ADMIN" || session.role === "TEACHER" || session.role === "STUDENT" ? (
          <li>
            <Link
              href={`/schools/${user?.school?.slug ?? ""}`}
              className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-300"
            >
              <p className="font-medium">School public library</p>
              <p className="mt-1 text-xs text-stone-600">What visitors can see without student profiles.</p>
            </Link>
          </li>
        ) : null}

        {session.role === "TEACHER" ? (
          <li>
            <Link
              href="/dashboard/teaching"
              className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-300"
            >
              <p className="font-medium">Teaching &amp; activities</p>
              <p className="mt-1 text-xs text-stone-600">Review programmes tied to your school.</p>
            </Link>
          </li>
        ) : null}

        {session.role === "STUDENT" ? (
          <li>
            <Link
              href="/dashboard/learn"
              className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-300"
            >
              <p className="font-medium">Activities &amp; submissions</p>
              <p className="mt-1 text-xs text-stone-600">Submit sighting reports and tune your profile theme.</p>
            </Link>
          </li>
        ) : null}

        {session.role === "COMMUNITY_MEMBER" ? (
          <li className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
            Community profile visibility is enabled for your account type. Extend this area with public articles in a future
            sprint.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
