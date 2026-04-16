import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import type { SessionPayload } from "@/lib/session";
import { isUserRole } from "@/lib/roles";
import { TEACHER_ADMIN_EMAIL, isValidStudentId } from "@/lib/authPolicy";

const bodySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("student"),
    studentId: z.string().min(1),
    password: z.string().min(1),
  }),
  z.object({
    mode: z.literal("teacher_admin"),
    password: z.string().min(1),
  }),
]);

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user =
    parsed.data.mode === "student"
      ? await prisma.user.findFirst({
          where: { studentId: parsed.data.studentId, role: "STUDENT" },
        })
      : await prisma.user.findUnique({
          where: { email: TEACHER_ADMIN_EMAIL },
        });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (parsed.data.mode === "student" && !isValidStudentId(parsed.data.studentId)) {
    return NextResponse.json({ error: "Invalid student ID range" }, { status: 400 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!isUserRole(user.role)) {
    return NextResponse.json({ error: "Invalid account" }, { status: 500 });
  }

  if (parsed.data.mode === "student" && user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Only student accounts can use student login." },
      { status: 403 },
    );
  }

  if (parsed.data.mode === "teacher_admin" && user.email !== TEACHER_ADMIN_EMAIL) {
    return NextResponse.json(
      { error: "Only fixed teacher admin account can use this login." },
      { status: 403 },
    );
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role as SessionPayload["role"],
    schoolId: user.schoolId,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, role: user.role });
}
