/** Short relative time string for activity timelines: "3m ago", "2h ago". */
export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Compact timestamp for the history table — relative if recent, else date. */
export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Snooze countdown — used in the Snoozed Accounts table. */
export function timeRemaining(snoozedAt: number, durationMs: number, now: number) {
  const remaining = snoozedAt + durationMs - now;
  if (remaining <= 0) return { label: "due now", urgent: true, pct: 100 };
  const h = Math.floor(remaining / (60 * 60 * 1000));
  const m = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  const elapsed = now - snoozedAt;
  const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
  if (h >= 1) return { label: `${h}h ${m}m left`, urgent: h < 6, pct };
  return { label: `${m}m left`, urgent: true, pct };
}
