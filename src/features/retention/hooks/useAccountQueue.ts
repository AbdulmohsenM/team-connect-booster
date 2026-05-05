import { useMemo } from "react";
import { useRetention } from "../state/RetentionContext";
import type { Account } from "../data/types";

export type QueueFilter = "needs-action" | "snoozed" | "intervened";

/**
 * Pure data layer for the at-risk queue. Display components read from this —
 * they don't filter or sort accounts themselves.
 */
export function useAccountQueue(filter: QueueFilter) {
  const { accounts, intervened, snoozed } = useRetention();

  return useMemo(() => {
    const needsAction = accounts.filter((a) => !intervened.has(a.id) && !snoozed.has(a.id));

    const counts = {
      "needs-action": needsAction.length,
      snoozed: snoozed.size,
      intervened: intervened.size,
    } as const;

    const visible: Account[] = accounts
      .filter((a) => {
        if (filter === "needs-action") return !snoozed.has(a.id) && !intervened.has(a.id);
        if (filter === "snoozed") return snoozed.has(a.id);
        return intervened.has(a.id);
      })
      .sort((a, b) => b.riskScore - a.riskScore);

    const nextAtRisk = needsAction.sort((a, b) => b.riskScore - a.riskScore)[0] ?? null;

    return { needsAction, visible, counts, nextAtRisk };
  }, [accounts, intervened, snoozed, filter]);
}

/** Q2 progress numbers used by both the queue header and confirmation page. */
export function useInterventionProgress() {
  const { accounts, intervened } = useRetention();
  const total = accounts.length;
  const sent = intervened.size;
  return { total, sent, pct: total === 0 ? 0 : Math.round((sent / total) * 100) };
}
