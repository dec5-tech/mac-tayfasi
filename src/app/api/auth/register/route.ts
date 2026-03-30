import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
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

    const { rows: existing } = await pool.query(
      "SELECT id FROM mac_users WHERE email = $1",
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO mac_users (email, password_hash, name, team) VALUES ($1, $2, $3, $4) RETURNING id, email, name, team, is_admin",
      [email, passwordHash, name, team]
    );
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
