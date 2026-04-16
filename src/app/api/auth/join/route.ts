import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "School-code registration is disabled. Use /api/auth/register-student instead." },
    { status: 410 },
  );
}
