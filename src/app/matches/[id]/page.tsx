import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MatchDetailClient } from "./match-detail-client";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: match } = await supabase
    .from("matches")
    .select(
      `
      *,
      match_responses (
        *,
        profiles (*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (!match) redirect("/dashboard");

  // Son 4 maçın yanıtlarını al (yoklama geçmişi için)
  const { data: recentMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(4);

  let recentResponses: { match_id: string; user_id: string; status: string }[] = [];
  if (recentMatches && recentMatches.length > 0) {
    const matchIds = recentMatches.map((m) => m.id);
    const { data } = await supabase
      .from("match_responses")
      .select("match_id, user_id, status")
      .in("match_id", matchIds);
    recentResponses = data || [];
  }

  return (
    <MatchDetailClient
      profile={profile}
      match={match}
      userId={user.id}
      recentResponses={recentResponses}
    />
  );
}
