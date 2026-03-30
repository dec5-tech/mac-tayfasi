"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculateResponseWindow } from "@/lib/match-utils";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMatch } from "@/actions/matches";
import { SessionPayload } from "@/lib/auth";
import { useEffect } from "react";

export default function NewMatchPage() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("20:00");
  const [location, setLocation] = useState("Halı Saha");
  const [teamSize, setTeamSize] = useState(8);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.isAdmin) router.push("/dashboard");
        else setSession(data);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.set("date", date);
    fd.set("time", time);
    fd.set("location", location);
    fd.set("teamSize", String(teamSize));
    const result = await createMatch(fd);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const previewWindow = () => {
    if (!date || !time) return null;
    const matchDate = new Date(`${date}T${time}:00`);
    const { opensAt, closesAt } = calculateResponseWindow(matchDate);
    const fmt = (d: Date) =>
      d.toLocaleDateString("tr-TR", {
        weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
      });
    return { opens: fmt(opensAt), closes: fmt(closesAt) };
  };

  const preview = previewWindow();

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Maç Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tarih</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Saat</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Saha</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Takım Boyutu (kaleci dahil)</Label>
                <Input type="number" value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} min={5} max={11} />
              </div>
              {preview && (
                <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
                  <p className="font-medium">Beyan Penceresi:</p>
                  <p>Açılış: {preview.opens}</p>
                  <p>Kapanış: {preview.closes}</p>
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
