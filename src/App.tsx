import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "./components/Header";
import { StatusBadge } from "./components/StatusBadge";
import { RoadToFinal } from "./components/RoadToFinal";
import { loadWorldCupData } from "./api/worldCupApi";
import type { WorldCupData } from "./types";
import "./App.css";

// How often to re-check the published data while the app is in the foreground.
// The source JSON only changes when CI regenerates it (every few minutes), so
// polling faster than this wouldn't surface fresher data — it would just repeat
// identical downloads.
const REFRESH_INTERVAL_MS = 5_000;

export default function App() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);

  // Background polls don't toggle `loading`, so frequent refreshes stay silent
  // instead of flickering the "Refreshing…" state on every tick.
  const refresh = useCallback(async (opts?: { background?: boolean }) => {
    const background = opts?.background === true;
    if (!background) setLoading(true);
    const result = await loadWorldCupData();
    setData(result);
    if (!background) setLoading(false);
  }, []);

  useEffect(() => {
    let timer: number | undefined;

    const stop = () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };
    const start = () => {
      stop();
      refresh({ background: true });
      timer = window.setInterval(() => refresh({ background: true }), REFRESH_INTERVAL_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    refresh();
    if (document.visibilityState === "visible") {
      timer = window.setInterval(() => refresh({ background: true }), REFRESH_INTERVAL_MS);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  return (
    <div className="app-shell">
      <Header />

      {data && (
        <StatusBadge
          source={data.source}
          sourceName={data.sourceName}
          fetchedAt={data.fetchedAt}
          errors={data.errors}
          loading={loading}
          onRefresh={refresh}
        />
      )}

      {!data ? (
        <motion.div
          className="loading-state"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          ⚽
        </motion.div>
      ) : (
        <RoadToFinal matches={data.matches} />
      )}

      <footer className="app-footer">
        Data via football-data.org (or TheSportsDB as backup), with a fun demo bracket as a last resort.
      </footer>
    </div>
  );
}
