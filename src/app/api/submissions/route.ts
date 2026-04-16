import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  activityId: z.string().min(1),
  body: z.string().min(10).max(8000),
  isPublicToSchoolLibrary: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id: parsed.data.activityId },
    include: { program: true },
  });
  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }
  if (activity.program.schoolId !== session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submission = await prisma.submission.create({
    data: {
      activityId: activity.id,
      studentId: session.sub,
      body: parsed.data.body,
      isPublicToSchoolLibrary: parsed.data.isPublicToSchoolLibrary ?? true,
    },
  });

  return NextResponse.json(submission);
}
