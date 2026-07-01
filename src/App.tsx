import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "./components/Header";
import { StatusBadge } from "./components/StatusBadge";
import { RoadToFinal } from "./components/RoadToFinal";
import { loadWorldCupData } from "./api/worldCupApi";
import type { WorldCupData } from "./types";
import "./App.css";

const POLL_INTERVAL_MS = 60_000;

export default function App() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await loadWorldCupData();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
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
