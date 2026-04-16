import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  productSlug: z.string().min(1),
  chosenSpeciesSlug: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const product = await prisma.rewardProduct.findUnique({
    where: { slug: parsed.data.productSlug },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const species = await prisma.species.findUnique({
    where: { slug: parsed.data.chosenSpeciesSlug },
  });
  if (!species) {
    return NextResponse.json({ error: "Species not found for artwork" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || user.points < product.pointsCost) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.sub },
      data: { points: { decrement: product.pointsCost } },
    }),
    prisma.redemption.create({
      data: {
        userId: session.sub,
        productId: product.id,
        chosenSpeciesSlug: species.slug,
        status: "PENDING",
      },
    }),
  ]);

  const after = await prisma.user.findUnique({ where: { id: session.sub } });
  return NextResponse.json({
    ok: true,
    points: after?.points ?? 0,
    message: `Redeemed ${product.name} with artwork theme: ${species.commonName}`,
  });
}
