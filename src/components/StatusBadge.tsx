import type { DataSource } from "../types";

interface Props {
  source: DataSource;
  fetchedAt: string;
  loading: boolean;
  onRefresh: () => void;
}

export function StatusBadge({ source, fetchedAt, loading, onRefresh }: Props) {
  const time = new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="status-badge">
      <span className={`status-badge__dot status-badge__dot--${source}`} />
      <span>
        {source === "live" ? "Live data" : "Demo data (live feed unavailable)"} · updated {time}
      </span>
      <button className="status-badge__refresh" onClick={onRefresh} disabled={loading}>
        {loading ? "Refreshing…" : "↻ Refresh"}
      </button>
    </div>
  );
}
