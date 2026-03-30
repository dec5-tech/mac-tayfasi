"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SessionPayload } from "@/lib/auth";

export function Navbar({ session }: { session: SessionPayload | null }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
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
          {session && (
            <>
              <span className="text-sm text-muted-foreground">
                {session.name}
                <span
                  className={`ml-1.5 inline-block w-2.5 h-2.5 rounded-full ${
                    session.team === "red" ? "bg-red-500" : "bg-gray-400"
                  }`}
                />
              </span>
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
