"use server";

import { pool } from "@/lib/db";
import { calculateResponseWindow } from "@/lib/match-utils";
import { MatchWithResponses } from "@/lib/types";

const MATCH_HOUR = 20; // 20:00
const MATCH_LOCATION = "Halı Saha";
const TEAM_SIZE = 8;

/** Bir sonraki Çarşamba günü saat 20:00'i döndürür */
function getNextWednesday(): Date {
  const d = new Date();
  d.setHours(MATCH_HOUR, 0, 0, 0);
  const day = d.getDay(); // 0=Paz, 3=Çar
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilWed);
  return d;
}

/** Yaklaşan Çarşamba maçını otomatik oluşturur (yoksa) */
export async function ensureUpcomingMatch() {
  const nextWed = getNextWednesday();
  const dayStart = new Date(nextWed);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(nextWed);
  dayEnd.setHours(23, 59, 59, 999);

  const { rows } = await pool.query(
    `SELECT id FROM matches WHERE date >= $1 AND date <= $2 AND status = 'upcoming'`,
    [dayStart.toISOString(), dayEnd.toISOString()]
  );

  if (rows.length === 0) {
    const { opensAt, closesAt } = calculateResponseWindow(nextWed);
    await pool.query(
      `INSERT INTO matches (date, location, team_size, response_opens_at, response_closes_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [nextWed.toISOString(), MATCH_LOCATION, TEAM_SIZE, opensAt.toISOString(), closesAt.toISOString()]
    );
  }
}

export async function getUpcomingMatches(): Promise<MatchWithResponses[]> {
  await ensureUpcomingMatch();

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

/** Geçmiş maçları tamamlandı olarak işaretle */
export async function markPastMatchesCompleted() {
  await pool.query(
    `UPDATE matches SET status = 'completed'
     WHERE status = 'upcoming' AND date < now()`
  );
}
