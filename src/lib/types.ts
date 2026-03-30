export type TeamType = "red" | "white";
export type MatchStatus = "upcoming" | "completed" | "cancelled";
export type ResponseStatus = "in" | "out";

export interface User {
  id: number;
  email: string;
  name: string;
  team: TeamType;
  is_admin: boolean;
  created_at: string;
}

export interface Match {
  id: number;
  date: string;
  location: string;
  team_size: number;
  status: MatchStatus;
  response_opens_at: string;
  response_closes_at: string;
  created_by: number;
  created_at: string;
}

export interface MatchResponse {
  id: number;
  match_id: number;
  user_id: number;
  status: ResponseStatus;
  responded_at: string;
  user_name?: string;
  user_team?: TeamType;
}

export interface MatchWithResponses extends Match {
  responses: MatchResponse[];
}
