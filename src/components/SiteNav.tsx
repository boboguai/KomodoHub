import Link from "next/link";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";
import { BRAND_SHORT } from "@/lib/brand";

export async function SiteNav() {
  const session = await getSession();

  return (
    <header className="border-b border-emerald-900/10 bg-emerald-950/80 text-emerald-50 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="truncate font-semibold tracking-tight">
            {BRAND_SHORT}
          </Link>
          <span className="hidden text-xs text-emerald-200/80 sm:inline">
            {session ? "" : "· Guest"}
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <Link href="/species" className="hover:underline">
            Species
          </Link>
          <Link href="/library" className="hover:underline">
            Library
          </Link>
          <Link href="/schools/ujung-raya" className="hover:underline">
            School showcase
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/dashboard/profile" className="hover:underline">
                Profile
              </Link>
              <Link href="/dashboard/daily" className="hover:underline">
                Daily tasks
              </Link>
              <Link href="/dashboard/rewards" className="hover:underline">
                Points shop
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
              >
                Student register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
