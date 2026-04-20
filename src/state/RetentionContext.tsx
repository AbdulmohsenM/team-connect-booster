import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { accounts as seed, Account, Action } from "@/data/atRiskAccounts";

export type LogEntry = {
  id: string;
  accountId: string;
  accountTeam: string;
  ownerName: string;
  actionId: string;
  actionTitle: string;
  channel: Action["channel"];
  at: number;
  by: string;
  status: "Awaiting response" | "Responded" | "Re-engaged";
};

export type SnoozeEntry = {
  accountId: string;
  snoozedAt: number;
  durationMs: number; // 48h default
  by: string;
};

type Ctx = {
  accounts: Account[];
  intervened: Set<string>;
  snoozed: Map<string, SnoozeEntry>;
  logs: LogEntry[];
  intervene: (accountId: string, actionId: string) => LogEntry;
  snooze: (accountId: string, hours?: number) => void;
  unsnooze: (accountId: string) => void;
  hideAll: boolean; // dev toggle to demo empty state
  setHideAll: (v: boolean) => void;
};

const RetentionContext = createContext<Ctx | null>(null);

export function RetentionProvider({ children }: { children: ReactNode }) {
  const [intervened, setIntervened] = useState<Set<string>>(new Set());
  const [snoozed, setSnoozed] = useState<Map<string, SnoozeEntry>>(new Map());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hideAll, setHideAll] = useState(false);

  const intervene = useCallback((accountId: string, actionId: string): LogEntry => {
    const acc = seed.find((a) => a.id === accountId)!;
    const action = [acc.recommended, ...acc.alternates].find((x) => x.id === actionId)!;
    const entry: LogEntry = {
      id: `${accountId}-${Date.now()}`,
      accountId,
      accountTeam: acc.team,
      ownerName: acc.owner.name,
      actionId,
      actionTitle: action.title,
      channel: action.channel,
      at: Date.now(),
      by: "Jordan Kim",
      status: "Awaiting response",
    };
    setLogs((prev) => [entry, ...prev]);
    setIntervened((prev) => new Set(prev).add(accountId));
    setSnoozed((prev) => {
      if (!prev.has(accountId)) return prev;
      const m = new Map(prev);
      m.delete(accountId);
      return m;
    });
    return entry;
  }, []);

  const snooze = useCallback((accountId: string, hours = 48) => {
    setSnoozed((prev) => {
      const m = new Map(prev);
      m.set(accountId, {
        accountId,
        snoozedAt: Date.now(),
        durationMs: hours * 60 * 60 * 1000,
        by: "Jordan Kim",
      });
      return m;
    });
  }, []);

  const unsnooze = useCallback((accountId: string) => {
    setSnoozed((prev) => {
      const m = new Map(prev);
      m.delete(accountId);
      return m;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ accounts: seed, intervened, snoozed, logs, intervene, snooze, unsnooze, hideAll, setHideAll }),
    [intervened, snoozed, logs, intervene, snooze, unsnooze, hideAll],
  );

  return <RetentionContext.Provider value={value}>{children}</RetentionContext.Provider>;
}

export function useRetention() {
  const v = useContext(RetentionContext);
  if (!v) throw new Error("useRetention must be inside RetentionProvider");
  return v;
}
