import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileEditor } from "./ProfileEditor";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) redirect("/login");
  const species = await prisma.species.findMany({
    orderBy: { commonName: "asc" },
    select: { slug: true, commonName: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-stone-600">
          Customise how you appear in class-facing tools. School students should avoid sharing sensitive personal details.
        </p>
      </div>
      <ProfileEditor
        initial={{
          displayName: user.displayName,
          nickname: user.nickname,
          gender: user.gender,
          bio: user.bio,
          favoriteAnimal: user.favoriteAnimal,
          avatarEmoji: user.avatarEmoji,
          avatarImageUrl: user.avatarImageUrl,
          points: user.points,
          role: user.role,
        }}
        species={species}
      />
    </div>
  );
}
