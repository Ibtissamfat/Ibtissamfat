import { useState } from "react";
import type { DataSource, SourceError } from "../types";

interface Props {
  source: DataSource;
  sourceName: string | null;
  fetchedAt: string;
  errors: SourceError[];
  loading: boolean;
  onRefresh: () => void;
}

export function StatusBadge({ source, sourceName, fetchedAt, errors, loading, onRefresh }: Props) {
  const [showErrors, setShowErrors] = useState(false);
  const time = new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const label = source === "live" ? `Live data (${sourceName})` : "Demo data (live feed unavailable)";

  return (
    <div className="status-badge-wrap">
      <div className="status-badge">
        <span className={`status-badge__dot status-badge__dot--${source}`} />
        <span>
          {label} · updated {time}
        </span>
        <button className="status-badge__refresh" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {source === "demo" && errors.length > 0 && (
        <div className="status-errors">
          <button className="status-errors__toggle" onClick={() => setShowErrors((v) => !v)}>
            {showErrors ? "Hide" : "Why demo data?"}
          </button>
          {showErrors && (
            <ul className="status-errors__list">
              {errors.map((e) => (
                <li key={e.source}>
                  <strong>{e.source}:</strong> {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
