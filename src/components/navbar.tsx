"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Profile } from "@/lib/types";

export function Navbar({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b bg-card">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">
          ⚽ Maç Tayfası
        </Link>
        <div className="flex items-center gap-3">
          {profile && (
            <>
              <span className="text-sm text-muted-foreground">
                {profile.name}
                <span
                  className={`ml-1.5 inline-block w-2.5 h-2.5 rounded-full ${
                    profile.team === "red" ? "bg-red-500" : "bg-gray-400"
                  }`}
                />
              </span>
              {profile.is_admin && (
                <Link href="/matches/new">
                  <Button variant="outline" size="sm">
                    + Maç Oluştur
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Çıkış
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
