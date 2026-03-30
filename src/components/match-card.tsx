"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchWithResponses, TeamType } from "@/lib/types";
import { formatDate, formatTime, getTeamRoster, isResponseWindowOpen } from "@/lib/match-utils";
import { ResponseButton } from "./response-button";

interface MatchCardProps {
  match: MatchWithResponses;
  userId: number;
  userTeam: TeamType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentAttendance: any[];
}

export function MatchCard({ match, userId, userTeam, recentAttendance }: MatchCardProps) {
  const isOpen = isResponseWindowOpen(match.response_opens_at, match.response_closes_at);
  const userResponse = match.responses.find((r) => r.user_id === userId);
  const redRoster = getTeamRoster(match.responses, "red", match.team_size);
  const whiteRoster = getTeamRoster(match.responses, "white", match.team_size);

  void recentAttendance; // used in detail page

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{match.location}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(match.date)} — {formatTime(match.date)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isOpen ? (
                <Badge className="bg-green-600">Beyan Açık</Badge>
              ) : (
                <Badge variant="secondary">Beyan Kapalı</Badge>
              )}
              {userResponse && (
                <Badge variant={userResponse.status === "in" ? "default" : "destructive"}>
                  {userResponse.status === "in" ? "Geliyorum" : "Gelmiyorum"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>Kırmızı: {redRoster.starters.length}/{match.team_size}</span>
              {redRoster.subs.length > 0 && (
                <span className="text-muted-foreground">(+{redRoster.subs.length})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-400" />
              <span>Beyaz: {whiteRoster.starters.length}/{match.team_size}</span>
              {whiteRoster.subs.length > 0 && (
                <span className="text-muted-foreground">(+{whiteRoster.subs.length})</span>
              )}
            </div>
          </div>
          {isOpen && (
            <div onClick={(e) => e.preventDefault()}>
              <ResponseButton matchId={match.id} currentStatus={userResponse?.status ?? null} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
