"use server";

import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertResponse(matchId: number, status: "in" | "out") {
  const session = await getSession();
  if (!session) return { error: "Giriş yapmalısınız." };

  // Beyan penceresi açık mı kontrol et
  const { rows } = await pool.query(
    "SELECT response_opens_at, response_closes_at FROM matches WHERE id = $1",
    [matchId]
  );
  if (!rows[0]) return { error: "Maç bulunamadı." };

  const now = new Date();
  const opens = new Date(rows[0].response_opens_at);
  const closes = new Date(rows[0].response_closes_at);

  if (now < opens || now > closes) {
    return { error: "Beyan penceresi kapalı." };
  }

  await pool.query(
    `INSERT INTO match_responses (match_id, user_id, status, responded_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (match_id, user_id)
     DO UPDATE SET status = $3, responded_at = now()`,
    [matchId, session.userId, status]
  );

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
