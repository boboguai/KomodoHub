import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 3 * 1024 * 1024;

function extFor(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/jpeg") return ".jpg";
  return ".webp";
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Only PNG/JPG/WEBP are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 3MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${session.sub}-${Date.now()}-${randomUUID().slice(0, 8)}${extFor(file.type)}`;
  const rel = `/uploads/avatars/${name}`;
  const absDir = path.join(process.cwd(), "public", "uploads", "avatars");
  const absPath = path.join(absDir, name);
  await mkdir(absDir, { recursive: true });
  await writeFile(absPath, bytes);

  return NextResponse.json({ ok: true, path: rel });
}
