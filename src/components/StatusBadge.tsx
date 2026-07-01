import type { DataSource } from "../types";

interface Props {
  source: DataSource;
  sourceName: string | null;
  fetchedAt: string;
  loading: boolean;
  onRefresh: () => void;
}

export function StatusBadge({ source, sourceName, fetchedAt, loading, onRefresh }: Props) {
  const time = new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const label = source === "live" ? `Live data (${sourceName})` : "Demo data (live feed unavailable)";

  return (
    <div className="status-badge">
      <span className={`status-badge__dot status-badge__dot--${source}`} />
      <span>
        {label} · updated {time}
      </span>
      <button className="status-badge__refresh" onClick={onRefresh} disabled={loading}>
        {loading ? "Refreshing…" : "↻ Refresh"}
      </button>
    </div>
  );
}
