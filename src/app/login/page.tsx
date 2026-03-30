"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState<"red" | "white">("red");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, team },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            ⚽ Maç Tayfası
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Kayıt ol ve kadroya katıl" : "Giriş yap"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">İsim</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adın Soyadın"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Takım</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setTeam("red")}
                      className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                        team === "red"
                          ? "border-red-500 bg-red-500/10 text-red-600"
                          : "border-muted hover:border-red-300"
                      }`}
                    >
                      🔴 Kırmızı
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeam("white")}
                      className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                        team === "white"
                          ? "border-gray-400 bg-gray-100 text-gray-800"
                          : "border-muted hover:border-gray-300"
                      }`}
                    >
                      ⚪ Beyaz
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Yükleniyor..."
                : isSignUp
                ? "Kayıt Ol"
                : "Giriş Yap"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isSignUp
                ? "Zaten hesabın var mı? Giriş yap"
                : "Hesabın yok mu? Kayıt ol"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
