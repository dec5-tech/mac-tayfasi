"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ResponseStatus } from "@/lib/types";

interface ResponseButtonProps {
  matchId: string;
  currentStatus: ResponseStatus | null;
}

export function ResponseButton({
  matchId,
  currentStatus,
}: ResponseButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleResponse = async (status: ResponseStatus) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (currentStatus === null) {
        await supabase.from("match_responses").insert({
          match_id: matchId,
          user_id: user.id,
          status,
          responded_at: new Date().toISOString(),
        });
      } else {
        await supabase
          .from("match_responses")
          .update({
            status,
            responded_at: new Date().toISOString(),
          })
          .eq("match_id", matchId)
          .eq("user_id", user.id);
      }
      router.refresh();
    } catch (err) {
      console.error("Response error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={currentStatus === "in" ? "default" : "outline"}
        className={
          currentStatus === "in"
            ? "bg-green-600 hover:bg-green-700"
            : ""
        }
        onClick={() => handleResponse("in")}
        disabled={loading}
      >
        ✓ Geliyorum
      </Button>
      <Button
        size="sm"
        variant={currentStatus === "out" ? "destructive" : "outline"}
        onClick={() => handleResponse("out")}
        disabled={loading}
      >
        ✕ Gelmiyorum
      </Button>
    </div>
  );
}
