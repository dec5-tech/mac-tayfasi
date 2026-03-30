"use server";

import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertResponse(matchId: number, status: "in" | "out") {
  const session = await getSession();
  if (!session) return { error: "Giriş yapmalısınız." };

  const rows = await sql`
    SELECT response_opens_at, response_closes_at FROM matches WHERE id = ${matchId}
  `;
  if (!rows[0]) return { error: "Maç bulunamadı." };

  const now = new Date();
  const opens = new Date(rows[0].response_opens_at);
  const closes = new Date(rows[0].response_closes_at);

  if (now < opens || now > closes) {
    return { error: "Beyan penceresi kapalı." };
  }

  await sql`
    INSERT INTO match_responses (match_id, user_id, status, responded_at)
    VALUES (${matchId}, ${session.userId}, ${status}, now())
    ON CONFLICT (match_id, user_id)
    DO UPDATE SET status = ${status}, responded_at = now()
  `;

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
