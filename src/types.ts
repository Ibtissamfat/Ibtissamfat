export type RoundKey = "R32" | "R16" | "QF" | "SF" | "THIRD" | "F";

export interface Match {
  id: string;
  round: RoundKey;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string | null;
  venue: string | null;
}

export type DataSource = "live" | "demo";

export interface WorldCupData {
  source: DataSource;
  fetchedAt: string;
  matches: Match[];
}
