"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateResponseWindow } from "@/lib/match-utils";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Profile } from "@/lib/types";
import { useEffect } from "react";

export default function NewMatchPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("20:00");
  const [location, setLocation] = useState("Halı Saha");
  const [teamSize, setTeamSize] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data && !data.is_admin) {
        router.push("/dashboard");
        return;
      }
      setProfile(data);
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const matchDate = new Date(`${date}T${time}:00`);
      const { opensAt, closesAt } = calculateResponseWindow(matchDate);

      const { error: insertError } = await supabase.from("matches").insert({
        date: matchDate.toISOString(),
        location,
        team_size: teamSize,
        response_opens_at: opensAt.toISOString(),
        response_closes_at: closesAt.toISOString(),
        created_by: user.id,
      });

      if (insertError) throw insertError;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Get next Wednesday
  const getNextWednesday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = ((3 - day + 7) % 7) || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Maç Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  placeholder={getNextWednesday()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Saat</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Saha</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Halı Saha"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Takım Boyutu (kaleci dahil)</Label>
                <Input
                  id="teamSize"
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  min={5}
                  max={11}
                />
              </div>

              {date && time && (
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="font-medium mb-1">Beyan Penceresi:</p>
                  <p>
                    Açılış:{" "}
                    {(() => {
                      const matchDate = new Date(`${date}T${time}:00`);
                      const { opensAt } = calculateResponseWindow(matchDate);
                      return opensAt.toLocaleDateString("tr-TR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    })()}
                  </p>
                  <p>
                    Kapanış:{" "}
                    {(() => {
                      const matchDate = new Date(`${date}T${time}:00`);
                      const { closesAt } = calculateResponseWindow(matchDate);
                      return closesAt.toLocaleDateString("tr-TR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    })()}
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Oluşturuluyor..." : "Maç Oluştur"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
