export type RoundKey = "R32" | "R16" | "QF" | "SF" | "THIRD" | "F";

export interface Goal {
  team: "home" | "away";
  scorer: string;
  minute: number | null;
  penalty?: boolean;
  ownGoal?: boolean;
}

export interface Match {
  id: string;
  round: RoundKey;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string | null;
  venue: string | null;
  goals?: Goal[];
}

export type DataSource = "live" | "demo";

export interface SourceError {
  source: string;
  message: string;
}

export interface WorldCupData {
  source: DataSource;
  sourceName: string | null;
  fetchedAt: string;
  matches: Match[];
  errors: SourceError[];
}
