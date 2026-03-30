import { MatchResponse, Profile, TeamType } from "./types";

/**
 * Beyan penceresi açık mı kontrol et
 * Perşembe 12:00 -> Salı 12:00 arası açık
 */
export function isResponseWindowOpen(
  responseOpensAt: string,
  responseClosesAt: string
): boolean {
  const now = new Date();
  const opens = new Date(responseOpensAt);
  const closes = new Date(responseClosesAt);
  return now >= opens && now <= closes;
}

/**
 * Bir takımın asil kadrosunu ve yedeklerini hesapla
 */
export function getTeamRoster(
  responses: (MatchResponse & { profiles: Profile })[],
  team: TeamType,
  teamSize: number
) {
  // Sadece "in" yanıt veren, bu takımın oyuncuları
  const teamResponses = responses
    .filter((r) => r.status === "in" && r.profiles.team === team)
    .sort(
      (a, b) =>
        new Date(a.responded_at).getTime() - new Date(b.responded_at).getTime()
    );

  const starters = teamResponses.slice(0, teamSize);
  const subs = teamResponses.slice(teamSize);

  return { starters, subs };
}

/**
 * Son N maçtaki katılım istatistiğini hesapla
 */
export function getAttendanceStats(
  matchResponses: { match_id: string; user_id: string; status: string }[],
  userId: string,
  lastNMatches: number
): { attended: number; missed: number; total: number } {
  const userResponses = matchResponses.filter((r) => r.user_id === userId);
  const recent = userResponses.slice(-lastNMatches);
  const attended = recent.filter((r) => r.status === "in").length;
  return {
    attended,
    missed: recent.length - attended,
    total: recent.length,
  };
}

/**
 * Maç tarihine göre beyan penceresi tarihlerini hesapla
 * Maç: Çarşamba 20:00
 * Açılış: Önceki Perşembe 12:00
 * Kapanış: Maç haftası Salı 12:00
 */
export function calculateResponseWindow(matchDate: Date): {
  opensAt: Date;
  closesAt: Date;
} {
  const matchDay = new Date(matchDate);

  // Kapanış: Maç gününden 1 gün önce (Salı) saat 12:00
  const closesAt = new Date(matchDay);
  closesAt.setDate(matchDay.getDate() - 1);
  closesAt.setHours(12, 0, 0, 0);

  // Açılış: Kapanıştan 5 gün önce (Perşembe) saat 12:00
  const opensAt = new Date(closesAt);
  opensAt.setDate(closesAt.getDate() - 5);
  opensAt.setHours(12, 0, 0, 0);

  return { opensAt, closesAt };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}
