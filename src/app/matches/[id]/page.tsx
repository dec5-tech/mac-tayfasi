import { getSession } from "@/lib/auth";
import { getMatch, getRecentAttendance } from "@/actions/matches";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { TeamRoster } from "@/components/team-roster";
import { ResponseButton } from "@/components/response-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDate, formatTime, formatDateTime,
  getTeamRoster, isResponseWindowOpen,
} from "@/lib/match-utils";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [match, recentAttendance] = await Promise.all([
    getMatch(Number(id)),
    getRecentAttendance(),
  ]);

  if (!match) redirect("/dashboard");

  const isOpen = isResponseWindowOpen(match.response_opens_at, match.response_closes_at);
  const userResponse = match.responses.find((r) => r.user_id === session.userId);
  const redRoster = getTeamRoster(match.responses, "red", match.team_size);
  const whiteRoster = getTeamRoster(match.responses, "white", match.team_size);

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{match.location}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {formatDate(match.date)} — {formatTime(match.date)}
                </p>
              </div>
              {isOpen ? (
                <Badge className="bg-green-600">Beyan Açık</Badge>
              ) : (
                <Badge variant="secondary">Beyan Kapalı</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <p>Açılış: {formatDateTime(match.response_opens_at)}</p>
                <p>Kapanış: {formatDateTime(match.response_closes_at)}</p>
              </div>
              {isOpen && (
                <ResponseButton
                  matchId={match.id}
                  currentStatus={userResponse?.status ?? null}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <TeamRoster
            team="red"
            teamName="Kırmızı Takım"
            starters={redRoster.starters}
            subs={redRoster.subs}
            teamSize={match.team_size}
            recentAttendance={recentAttendance}
          />
          <TeamRoster
            team="white"
            teamName="Beyaz Takım"
            starters={whiteRoster.starters}
            subs={whiteRoster.subs}
            teamSize={match.team_size}
            recentAttendance={recentAttendance}
          />
        </div>
      </main>
    </div>
  );
}
