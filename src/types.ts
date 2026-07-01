export type RoundKey = "R32" | "R16" | "QF" | "SF" | "THIRD" | "F";

export interface Match {
  id: string;
  round: RoundKey;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  // Penalty-shootout scores, when a knockout tie was level after extra time.
  homePens?: number | null;
  awayPens?: number | null;
  date: string | null;
  venue: string | null;
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
