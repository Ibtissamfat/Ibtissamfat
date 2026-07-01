export function formatMatchDateTime(dateIso: string | null): string | null {
  if (!dateIso) return null;
  const raw = dateIso.trim();

  // Date-only values (YYYY-MM-DD) carry no meaningful kickoff time, so show just
  // the day. Parse as local to avoid a timezone shifting it to the day before.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    const parsed = new Date(y, m - 1, d);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
