"use server";

import { sql } from "@/lib/db";
import { calculateResponseWindow } from "@/lib/match-utils";
import { MatchWithResponses } from "@/lib/types";

const MATCH_HOUR = 20;
const MATCH_LOCATION = "Halı Saha";
const TEAM_SIZE = 8;

function getNextWednesday(): Date {
  const d = new Date();
  d.setHours(MATCH_HOUR, 0, 0, 0);
  const day = d.getDay();
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilWed);
  return d;
}

export async function ensureUpcomingMatch() {
  const nextWed = getNextWednesday();
  const dayStart = new Date(nextWed);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(nextWed);
  dayEnd.setHours(23, 59, 59, 999);

  const rows = await sql`
    SELECT id FROM matches
    WHERE date >= ${dayStart.toISOString()}
      AND date <= ${dayEnd.toISOString()}
      AND status = 'upcoming'
  `;

  if (rows.length === 0) {
    const { opensAt, closesAt } = calculateResponseWindow(nextWed);
    await sql`
      INSERT INTO matches (date, location, team_size, response_opens_at, response_closes_at)
      VALUES (${nextWed.toISOString()}, ${MATCH_LOCATION}, ${TEAM_SIZE},
              ${opensAt.toISOString()}, ${closesAt.toISOString()})
    `;
  }
}

export async function getUpcomingMatches(): Promise<MatchWithResponses[]> {
  await ensureUpcomingMatch();

  const matches = await sql`
    SELECT * FROM matches WHERE status = 'upcoming' ORDER BY date ASC
  `;

  if (matches.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchIds = matches.map((m: any) => m.id);
  const responses = await sql`
    SELECT mr.*, u.name AS user_name, u.team AS user_team
    FROM match_responses mr
    JOIN mac_users u ON u.id = mr.user_id
    WHERE mr.match_id = ANY(${matchIds})
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return matches.map((m: any) => ({
    ...m,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responses: responses.filter((r: any) => r.match_id === m.id),
  })) as MatchWithResponses[];
}

export async function getMatch(id: number): Promise<MatchWithResponses | null> {
  const rows = await sql`SELECT * FROM matches WHERE id = ${id}`;
  if (!rows[0]) return null;

  const responses = await sql`
    SELECT mr.*, u.name AS user_name, u.team AS user_team
    FROM match_responses mr
    JOIN mac_users u ON u.id = mr.user_id
    WHERE mr.match_id = ${id}
    ORDER BY mr.responded_at ASC
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ...rows[0], responses } as any as MatchWithResponses;
}

export async function getRecentAttendance() {
  const recentMatches = await sql`
    SELECT id FROM matches WHERE status = 'completed' ORDER BY date DESC LIMIT 4
  `;
  if (recentMatches.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchIds = recentMatches.map((m: any) => m.id);
  return await sql`
    SELECT match_id, user_id, status
    FROM match_responses
    WHERE match_id = ANY(${matchIds})
  `;
}
