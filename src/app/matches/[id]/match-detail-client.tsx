"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { TeamRoster } from "@/components/team-roster";
import { ResponseButton } from "@/components/response-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Profile, MatchWithResponses } from "@/lib/types";
import {
  formatDate,
  formatTime,
  formatDateTime,
  getTeamRoster,
  isResponseWindowOpen,
} from "@/lib/match-utils";

interface MatchDetailClientProps {
  profile: Profile;
  match: MatchWithResponses;
  userId: string;
  recentResponses: { match_id: string; user_id: string; status: string }[];
}

export function MatchDetailClient({
  profile,
  match,
  userId,
  recentResponses,
}: MatchDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const isOpen = isResponseWindowOpen(
    match.response_opens_at,
    match.response_closes_at
  );
  const userResponse = match.match_responses.find(
    (r) => r.user_id === userId
  );
  const redRoster = getTeamRoster(
    match.match_responses,
    "red",
    match.team_size
  );
  const whiteRoster = getTeamRoster(
    match.match_responses,
    "white",
    match.team_size
  );

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`match-${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_responses",
          filter: `match_id=eq.${match.id}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, router, supabase]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Match Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{match.location}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {formatDate(match.date)} - {formatTime(match.date)}
                </p>
              </div>
              {isOpen ? (
                <Badge variant="default" className="bg-green-600">
                  Beyan Açık
                </Badge>
              ) : (
                <Badge variant="secondary">Beyan Kapalı</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <p>Beyan açılış: {formatDateTime(match.response_opens_at)}</p>
                <p>
                  Beyan kapanış: {formatDateTime(match.response_closes_at)}
                </p>
              </div>
              {isOpen && (
                <ResponseButton
                  matchId={match.id}
                  currentStatus={userResponse?.status || null}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teams */}
        <div className="grid md:grid-cols-2 gap-6">
          <TeamRoster
            team="red"
            teamName="Kırmızı Takım"
            starters={redRoster.starters}
            subs={redRoster.subs}
            teamSize={match.team_size}
            recentResponses={recentResponses}
          />
          <TeamRoster
            team="white"
            teamName="Beyaz Takım"
            starters={whiteRoster.starters}
            subs={whiteRoster.subs}
            teamSize={match.team_size}
            recentResponses={recentResponses}
          />
        </div>
      </main>
    </div>
  );
}
