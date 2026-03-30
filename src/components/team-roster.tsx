import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MatchResponse, TeamType } from "@/lib/types";

interface TeamRosterProps {
  team: TeamType;
  teamName: string;
  starters: MatchResponse[];
  subs: MatchResponse[];
  teamSize: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentAttendance: any[];
}

function getAttendance(
  recentAttendance: { match_id: number; user_id: number; status: string }[],
  userId: number
) {
  const userRows = recentAttendance.filter((r) => r.user_id === userId);
  if (userRows.length === 0) return null;
  const attended = userRows.filter((r) => r.status === "in").length;
  return `${attended}/${userRows.length}`;
}

export function TeamRoster({
  team,
  teamName,
  starters,
  subs,
  teamSize,
  recentAttendance,
}: TeamRosterProps) {
  const borderColor = team === "red" ? "border-t-red-500" : "border-t-gray-400";
  const headerBg = team === "red" ? "bg-red-50 dark:bg-red-950/20" : "bg-gray-50 dark:bg-gray-900/20";
  const titleColor = team === "red" ? "text-red-600" : "text-gray-600";
  const emptySlots = Math.max(0, teamSize - starters.length);

  return (
    <Card className={`border-t-4 ${borderColor}`}>
      <CardHeader className={headerBg}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${titleColor}`}>{teamName}</CardTitle>
          <Badge variant="outline">{starters.length}/{teamSize}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1.5">
          {starters.map((player, i) => {
            const att = getAttendance(recentAttendance, player.user_id);
            return (
              <div key={player.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground w-5">{i + 1}</span>
                  <span className="text-sm font-medium">{player.user_name}</span>
                </div>
                {att && <span className="text-xs text-muted-foreground">{att}</span>}
              </div>
            );
          })}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center py-1.5 px-2 rounded border border-dashed border-muted">
              <span className="text-sm font-mono text-muted-foreground w-5">{starters.length + i + 1}</span>
              <span className="text-sm text-muted-foreground ml-2">Boş slot</span>
            </div>
          ))}
        </div>
        {subs.length > 0 && (
          <>
            <Separator className="my-3" />
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Yedekler</p>
            <div className="space-y-1">
              {subs.map((player, i) => {
                const att = getAttendance(recentAttendance, player.user_id);
                return (
                  <div key={player.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-5">Y{i + 1}</span>
                      <span className="text-sm text-muted-foreground">{player.user_name}</span>
                    </div>
                    {att && <span className="text-xs text-muted-foreground">{att}</span>}
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
