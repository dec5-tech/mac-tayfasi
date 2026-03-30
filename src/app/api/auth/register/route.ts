import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, team } = await req.json();

    if (!email || !password || !name || !team) {
      return NextResponse.json({ error: "Tüm alanlar zorunlu." }, { status: 400 });
    }
    if (!["red", "white"].includes(team)) {
      return NextResponse.json({ error: "Geçersiz takım." }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM mac_users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const rows = await sql`
      INSERT INTO mac_users (email, password_hash, name, team)
      VALUES (${email}, ${passwordHash}, ${name}, ${team})
      RETURNING id, email, name, team, is_admin
    `;
    const user = rows[0];

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      team: user.team,
      isAdmin: user.is_admin,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
