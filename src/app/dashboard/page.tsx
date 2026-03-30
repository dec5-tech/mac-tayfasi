import { getSession } from "@/lib/auth";
import { getUpcomingMatches, getRecentAttendance } from "@/actions/matches";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { MatchCard } from "@/components/match-card";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [matches, recentAttendance] = await Promise.all([
    getUpcomingMatches(),
    getRecentAttendance(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Yaklaşan Maçlar</h1>
        {matches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Henüz yaklaşan maç yok.
            {session.isAdmin && " Yeni bir maç oluşturabilirsin."}
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userId={session.userId}
                userTeam={session.team}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentAttendance={recentAttendance as any}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
