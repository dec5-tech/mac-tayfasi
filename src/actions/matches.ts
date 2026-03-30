"use server";

import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calculateResponseWindow } from "@/lib/match-utils";
import { MatchWithResponses } from "@/lib/types";

export async function getUpcomingMatches(): Promise<MatchWithResponses[]> {
  const { rows: matches } = await pool.query(
    `SELECT * FROM matches WHERE status = 'upcoming' ORDER BY date ASC`
  );

  if (matches.length === 0) return [];

  const matchIds = matches.map((m: { id: number }) => m.id);
  const { rows: responses } = await pool.query(
    `SELECT mr.*, u.name AS user_name, u.team AS user_team
     FROM match_responses mr
     JOIN mac_users u ON u.id = mr.user_id
     WHERE mr.match_id = ANY($1)`,
    [matchIds]
  );

  return matches.map((m: MatchWithResponses) => ({
    ...m,
    responses: responses.filter((r: { match_id: number }) => r.match_id === m.id),
  }));
}

export async function getMatch(id: number): Promise<MatchWithResponses | null> {
  const { rows } = await pool.query("SELECT * FROM matches WHERE id = $1", [id]);
  if (!rows[0]) return null;

  const { rows: responses } = await pool.query(
    `SELECT mr.*, u.name AS user_name, u.team AS user_team
     FROM match_responses mr
     JOIN mac_users u ON u.id = mr.user_id
     WHERE mr.match_id = $1
     ORDER BY mr.responded_at ASC`,
    [id]
  );

  return { ...rows[0], responses };
}

export async function createMatch(formData: FormData) {
  const session = await getSession();
  if (!session?.isAdmin) return { error: "Yetkisiz erişim." };

  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const location = formData.get("location") as string;
  const teamSize = Number(formData.get("teamSize")) || 8;

  if (!date || !time || !location) return { error: "Tüm alanlar zorunlu." };

  const matchDate = new Date(`${date}T${time}:00`);
  const { opensAt, closesAt } = calculateResponseWindow(matchDate);

  await pool.query(
    `INSERT INTO matches (date, location, team_size, response_opens_at, response_closes_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [matchDate.toISOString(), location, teamSize, opensAt.toISOString(), closesAt.toISOString(), session.userId]
  );

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function getRecentAttendance() {
  const { rows: recentMatches } = await pool.query(
    `SELECT id FROM matches WHERE status = 'completed' ORDER BY date DESC LIMIT 4`
  );
  if (recentMatches.length === 0) return [];

  const matchIds = recentMatches.map((m: { id: number }) => m.id);
  const { rows } = await pool.query(
    `SELECT match_id, user_id, status FROM match_responses WHERE match_id = ANY($1)`,
    [matchIds]
  );
  return rows;
}
