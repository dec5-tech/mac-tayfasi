export type TeamType = "red" | "white";
export type MatchStatus = "upcoming" | "completed" | "cancelled";
export type ResponseStatus = "in" | "out";

export interface Profile {
  id: string;
  name: string;
  team: TeamType;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  date: string;
  location: string;
  team_size: number;
  status: MatchStatus;
  response_opens_at: string;
  response_closes_at: string;
  created_by: string;
  created_at: string;
}

export interface MatchResponse {
  id: string;
  match_id: string;
  user_id: string;
  status: ResponseStatus;
  is_starter: boolean;
  position: number;
  responded_at: string;
  profiles?: Profile;
}

export interface MatchWithResponses extends Match {
  match_responses: (MatchResponse & { profiles: Profile })[];
}
