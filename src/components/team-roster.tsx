"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MatchResponse, Profile, TeamType } from "@/lib/types";
import { getAttendanceStats } from "@/lib/match-utils";

interface TeamRosterProps {
  team: TeamType;
  teamName: string;
  starters: (MatchResponse & { profiles: Profile })[];
  subs: (MatchResponse & { profiles: Profile })[];
  teamSize: number;
  recentResponses: { match_id: string; user_id: string; status: string }[];
}

export function TeamRoster({
  team,
  teamName,
  starters,
  subs,
  teamSize,
  recentResponses,
}: TeamRosterProps) {
  const borderColor =
    team === "red" ? "border-t-red-500" : "border-t-gray-400";
  const bgHeader =
    team === "red" ? "bg-red-50 dark:bg-red-950/20" : "bg-gray-50 dark:bg-gray-900/20";
  const teamColor = team === "red" ? "text-red-600" : "text-gray-600";

  // Boş slotlar
  const emptySlots = Math.max(0, teamSize - starters.length);

  return (
    <Card className={`border-t-4 ${borderColor}`}>
      <CardHeader className={bgHeader}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${teamColor}`}>{teamName}</CardTitle>
          <Badge variant="outline">
            {starters.length}/{teamSize}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Asil Kadro */}
        <div className="space-y-2">
          {starters.map((player, index) => {
            const stats = getAttendanceStats(
              recentResponses,
              player.user_id,
              4
            );
            return (
              <div
                key={player.id}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground w-5">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">
                    {player.profiles.name}
                  </span>
                </div>
                {stats.total > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {stats.attended}/{stats.total}
                  </span>
                )}
              </div>
            );
          })}
          {/* Boş slotlar */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center py-1.5 px-2 rounded border border-dashed border-muted"
            >
              <span className="text-sm font-mono text-muted-foreground w-5">
                {starters.length + i + 1}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                Boş slot
              </span>
            </div>
          ))}
        </div>

        {/* Yedekler */}
        {subs.length > 0 && (
          <>
            <Separator className="my-3" />
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Yedekler
            </p>
            <div className="space-y-1.5">
              {subs.map((player, index) => {
                const stats = getAttendanceStats(
                  recentResponses,
                  player.user_id,
                  4
                );
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-5">
                        Y{index + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {player.profiles.name}
                      </span>
                    </div>
                    {stats.total > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {stats.attended}/{stats.total}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
