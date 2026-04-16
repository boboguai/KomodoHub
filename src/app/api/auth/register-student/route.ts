import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { isValidStudentId } from "@/lib/authPolicy";

const bodySchema = z.object({
  studentId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(80),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const studentId = parsed.data.studentId.trim();
  if (!isValidStudentId(studentId)) {
    return NextResponse.json(
      { error: "Student ID must be between 202229013000 and 202229013100." },
      { status: 400 },
    );
  }

  const [emailExists, studentIdExists] = await Promise.all([
    prisma.user.findUnique({ where: { email: parsed.data.email } }),
    prisma.user.findUnique({ where: { studentId } }),
  ]);

  if (emailExists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  if (studentIdExists) {
    return NextResponse.json({ error: "Student ID already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      studentId,
      email: parsed.data.email,
      passwordHash,
      role: "STUDENT",
      displayName: parsed.data.displayName,
      publicProfile: false,
      schoolId: null,
    },
  });

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: "STUDENT",
    schoolId: user.schoolId,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
