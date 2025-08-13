import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { name, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      if (existing.passwordHash) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      // Attach credentials to existing account (e.g., created via seed or OAuth)
      await db.user.update({ where: { id: existing.id }, data: { name, passwordHash } });
      return NextResponse.json({ ok: true });
    }

    await db.user.create({ data: { name, email: normalizedEmail, passwordHash } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


