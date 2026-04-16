import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  nickname: z.string().max(40).optional().nullable(),
  gender: z
    .enum(["FEMALE", "MALE", "NONBINARY", "PREFER_NOT_SAY"])
    .optional()
    .nullable(),
  bio: z.string().max(500).optional().nullable(),
  favoriteAnimal: z.string().max(80).optional().nullable(),
  avatarEmoji: z.string().min(1).max(8).optional(),
  avatarImageUrl: z.union([z.string().max(2000), z.literal("")]).optional().nullable(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const p = parsed.data;
  const user = await prisma.user.update({
    where: { id: session.sub },
    data: {
      ...(p.displayName !== undefined ? { displayName: p.displayName } : {}),
      ...(p.nickname !== undefined ? { nickname: p.nickname } : {}),
      ...(p.gender !== undefined ? { gender: p.gender } : {}),
      ...(p.bio !== undefined ? { bio: p.bio } : {}),
      ...(p.favoriteAnimal !== undefined ? { favoriteAnimal: p.favoriteAnimal } : {}),
      ...(p.avatarEmoji !== undefined ? { avatarEmoji: p.avatarEmoji } : {}),
      ...(p.avatarImageUrl !== undefined
        ? { avatarImageUrl: p.avatarImageUrl === "" ? null : p.avatarImageUrl }
        : {}),
    },
  });

  return NextResponse.json({
    id: user.id,
    displayName: user.displayName,
    nickname: user.nickname,
    gender: user.gender,
    bio: user.bio,
    favoriteAnimal: user.favoriteAnimal,
    avatarEmoji: user.avatarEmoji,
    avatarImageUrl: user.avatarImageUrl,
    points: user.points,
  });
}
