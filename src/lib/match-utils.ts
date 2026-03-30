import { MatchResponse, TeamType } from "./types";

export function isResponseWindowOpen(opensAt: string, closesAt: string): boolean {
  const now = new Date();
  return now >= new Date(opensAt) && now <= new Date(closesAt);
}

export function getTeamRoster(
  responses: MatchResponse[],
  team: TeamType,
  teamSize: number
) {
  const teamIn = responses
    .filter((r) => r.status === "in" && r.user_team === team)
    .sort((a, b) => new Date(a.responded_at).getTime() - new Date(b.responded_at).getTime());

  return {
    starters: teamIn.slice(0, teamSize),
    subs: teamIn.slice(teamSize),
  };
}

/**
 * Maç tarihine göre beyan penceresini hesapla.
 * Maç: Çarşamba 20:00
 * Açılış: Önceki Perşembe 12:00 (maçtan 6 gün önce)
 * Kapanış: Maç haftası Salı 12:00 (maçtan 1 gün önce)
 */
export function calculateResponseWindow(matchDate: Date): {
  opensAt: Date;
  closesAt: Date;
} {
  const closesAt = new Date(matchDate);
  closesAt.setDate(matchDate.getDate() - 1);
  closesAt.setHours(12, 0, 0, 0);

  const opensAt = new Date(closesAt);
  opensAt.setDate(closesAt.getDate() - 5);
  opensAt.setHours(12, 0, 0, 0);

  return { opensAt, closesAt };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
