import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="app-header">
      <motion.span
        className="app-header__ball"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        ⚽
      </motion.span>
      <div>
        <h1 className="app-header__title">Road to the Final</h1>
        <p className="app-header__subtitle">FIFA World Cup 2026 — the knockout journey, one bracket at a time</p>
      </div>
    </header>
  );
}
