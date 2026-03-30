"use client";

import { Navbar } from "@/components/navbar";
import { MatchCard } from "@/components/match-card";
import { Profile, MatchWithResponses } from "@/lib/types";

interface DashboardClientProps {
  profile: Profile;
  matches: MatchWithResponses[];
  userId: string;
}

export function DashboardClient({
  profile,
  matches,
  userId,
}: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Yaklaşan Maçlar</h1>
        {matches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Henüz yaklaşan maç yok.
            {profile.is_admin && " Yeni bir maç oluşturabilirsin."}
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userId={userId}
                userTeam={profile.team}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
