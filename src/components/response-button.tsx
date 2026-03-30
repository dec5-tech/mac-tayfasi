"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { upsertResponse } from "@/actions/responses";
import { ResponseStatus } from "@/lib/types";

interface ResponseButtonProps {
  matchId: number;
  currentStatus: ResponseStatus | null;
}

export function ResponseButton({ matchId, currentStatus }: ResponseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleResponse = async (newStatus: ResponseStatus) => {
    setLoading(true);
    const result = await upsertResponse(matchId, newStatus);
    if (!result.error) setStatus(newStatus);
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={status === "in" ? "default" : "outline"}
        className={status === "in" ? "bg-green-600 hover:bg-green-700" : ""}
        onClick={() => handleResponse("in")}
        disabled={loading}
      >
        ✓ Geliyorum
      </Button>
      <Button
        size="sm"
        variant={status === "out" ? "destructive" : "outline"}
        onClick={() => handleResponse("out")}
        disabled={loading}
      >
        ✕ Gelmiyorum
      </Button>
    </div>
  );
}
