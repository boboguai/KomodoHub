import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RewardsClient } from "./RewardsClient";

export default async function RewardsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) redirect("/login");

  const products = await prisma.rewardProduct.findMany({ orderBy: { sortOrder: "asc" } });
  const species = await prisma.species.findMany({ orderBy: { commonName: "asc" }, select: { slug: true, commonName: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Points shop</h1>
        <p className="mt-1 text-sm text-stone-600">
          Redeem stationery-style rewards. You choose which endangered species artwork is printed on the item (prototype:
          records a pending fulfilment request).
        </p>
        <p className="mt-2 text-sm">
          Your points: <span className="font-semibold text-emerald-900">{user.points}</span>
        </p>
      </div>

      <RewardsClient products={products} species={species} />
    </div>
  );
}
