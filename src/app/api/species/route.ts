import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const list = await prisma.species.findMany({ orderBy: { commonName: "asc" } });
  return NextResponse.json(list);
}

const createSchema = z.object({
  slug: z.string().min(2).max(80),
  commonName: z.string().min(1),
  scientificName: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1),
  habitat: z.string().min(1),
  conservationStatus: z.string().min(1),
  regionLabel: z.string().min(1).optional(),
  populationEstimate: z.string().min(1).optional(),
  temperament: z.string().min(1).optional(),
  imageUrl: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "FOUNDATION_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { regionLabel, populationEstimate, temperament, imageUrl, ...rest } = parsed.data;
  const created = await prisma.species.create({
    data: {
      ...rest,
      ...(regionLabel ? { regionLabel } : {}),
      ...(populationEstimate ? { populationEstimate } : {}),
      ...(temperament ? { temperament } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    },
  });
  return NextResponse.json(created);
}
