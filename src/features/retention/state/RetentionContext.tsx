import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/features/auth/SessionProvider";
import type { Account, Action, Channel, LogEntry, Signal, SnoozeEntry } from "../data/types";

type Ctx = {
  accounts: Account[];
  intervened: Set<string>;
  snoozed: Map<string, SnoozeEntry>;
  logs: LogEntry[];
  loading: boolean;
  intervene: (accountId: string, actionId: string) => Promise<LogEntry>;
  snooze: (accountId: string, hours?: number) => Promise<void>;
  unsnooze: (accountId: string) => Promise<void>;
  forceFailNext: boolean;
  setForceFailNext: (v: boolean) => void;
  hideAll: boolean;
  setHideAll: (v: boolean) => void;
};

const RetentionContext = createContext<Ctx | null>(null);

const FAILURE_RATE = 0; // disabled — real backend now decides success
const SEND_LATENCY_MS = 400;

type AccountRow = {
  id: string; team: string; plan: string; seats: number;
  owner_name: string; owner_role: string; owner_avatar: string | null;
  days_since_signup: number; risk_score: number;
  trend: "up" | "down" | "flat"; top_reason: string; mrr: number;
  quote_text: string | null; quote_source: string | null; quote_channel: string | null;
};
type SignalRow = { id: string; account_id: string; label: string; detail: string; weight: "high" | "med" | "low"; position: number };
type ActionRow = { id: string; account_id: string; title: string; preview: string; channel: Channel; expected_lift: string; is_recommended: boolean; position: number };
type LogRow = { id: string; account_id: string; action_id: string; channel: Channel; sent_at: string; sent_by: string; status: "Awaiting response" | "Responded" | "Re-engaged" };
type SnoozeRow = { id: string; account_id: string; duration_ms: number; snoozed_at: string; snoozed_by: string };

function shapeAccount(a: AccountRow, signals: SignalRow[], actions: ActionRow[]): Account {
  const sigs: Signal[] = signals
    .filter((s) => s.account_id === a.id)
    .sort((x, y) => x.position - y.position)
    .map((s) => ({ label: s.label, detail: s.detail, weight: s.weight }));
  const acts = actions
    .filter((x) => x.account_id === a.id)
    .sort((x, y) => x.position - y.position)
    .map<Action>((x) => ({
      id: x.id,
      title: x.title,
      preview: x.preview,
      channel: x.channel,
      expectedLift: x.expected_lift,
    }));
  const recommended =
    acts.find((_, i) => actions.find((r) => r.id === acts[i].id)?.is_recommended) ?? acts[0];
  const alternates = acts.filter((x) => x.id !== recommended?.id);
  return {
    id: a.id,
    team: a.team,
    plan: a.plan,
    seats: a.seats,
    owner: { name: a.owner_name, role: a.owner_role, avatar: a.owner_avatar ?? "" },
    daysSinceSignup: a.days_since_signup,
    riskScore: a.risk_score,
    trend: a.trend,
    topReason: a.top_reason,
    mrr: Number(a.mrr),
    signals: sigs,
    quote: {
      text: a.quote_text ?? "",
      source: a.quote_source ?? "",
      channel: a.quote_channel ?? "",
    },
    recommended: recommended ?? { id: "", title: "", preview: "", channel: "in-app nudge", expectedLift: "" },
    alternates,
  };
}

export function RetentionProvider({ children }: { children: ReactNode }) {
  const { user, displayName } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [snoozed, setSnoozed] = useState<Map<string, SnoozeEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hideAll, setHideAll] = useState(false);
  const [forceFailNext, setForceFailNext] = useState(false);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});

  const intervened = useMemo(() => new Set(logs.map((l) => l.accountId)), [logs]);

  // Initial fetch — gated by an authenticated session because of RLS.
  useEffect(() => {
    if (!user) {
      setAccounts([]); setLogs([]); setSnoozed(new Map()); setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [accRes, sigRes, actRes, logRes, snoozeRes] = await Promise.all([
        supabase.from("accounts").select("*").order("risk_score", { ascending: false }),
        supabase.from("signals").select("*"),
        supabase.from("actions").select("*"),
        supabase.from("intervention_logs").select("*").order("sent_at", { ascending: false }),
        supabase.from("snoozes").select("*"),
      ]);
      if (cancelled) return;

      const accs = (accRes.data ?? []) as AccountRow[];
      const sigs = (sigRes.data ?? []) as SignalRow[];
      const acts = (actRes.data ?? []) as ActionRow[];
      const lgs = (logRes.data ?? []) as LogRow[];
      const sns = (snoozeRes.data ?? []) as SnoozeRow[];

      // Resolve profile display names for "by" labels.
      const userIds = Array.from(new Set([...lgs.map((l) => l.sent_by), ...sns.map((s) => s.snoozed_by)]));
      let names: Record<string, string> = {};
      if (userIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id,display_name").in("id", userIds);
        names = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
      }
      setProfileNames(names);

      const shaped = accs.map((a) => shapeAccount(a, sigs, acts));
      setAccounts(shaped);

      const accountById = new Map(shaped.map((a) => [a.id, a]));
      setLogs(
        lgs.map<LogEntry>((l) => {
          const acc = accountById.get(l.account_id);
          const action = acc ? [acc.recommended, ...acc.alternates].find((x) => x.id === l.action_id) : undefined;
          return {
            id: l.id,
            accountId: l.account_id,
            accountTeam: acc?.team ?? "",
            ownerName: acc?.owner.name ?? "",
            actionId: l.action_id,
            actionTitle: action?.title ?? "Intervention",
            channel: l.channel,
            at: new Date(l.sent_at).getTime(),
            by: names[l.sent_by] ?? "Teammate",
            status: l.status,
          };
        }),
      );

      setSnoozed(
        new Map(
          sns.map<[string, SnoozeEntry]>((s) => [
            s.account_id,
            {
              accountId: s.account_id,
              snoozedAt: new Date(s.snoozed_at).getTime(),
              durationMs: Number(s.duration_ms),
              by: names[s.snoozed_by] ?? "Teammate",
            },
          ]),
        ),
      );
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const intervene = useCallback(
    async (accountId: string, actionId: string): Promise<LogEntry> => {
      if (!user) throw new Error("Not signed in");
      const acc = accounts.find((a) => a.id === accountId);
      const action = acc ? [acc.recommended, ...acc.alternates].find((x) => x.id === actionId) : undefined;
      if (!acc || !action) throw new Error("Account or action not found");

      // Brief simulated send latency for UX parity with the prototype.
      await new Promise((r) => setTimeout(r, SEND_LATENCY_MS));

      if (forceFailNext || Math.random() < FAILURE_RATE) {
        setForceFailNext(false);
        throw new Error(
          action.channel === "email"
            ? "Email provider rejected the request (550)."
            : action.channel === "Slack message"
              ? "Slack delivery failed — workspace token expired."
              : "In-app delivery failed — recipient session offline.",
        );
      }

      const { data, error } = await supabase
        .from("intervention_logs")
        .insert({
          account_id: accountId,
          action_id: actionId,
          channel: action.channel,
          sent_by: user.id,
          status: "Awaiting response",
        })
        .select()
        .single();
      if (error) throw error;

      const entry: LogEntry = {
        id: data.id,
        accountId,
        accountTeam: acc.team,
        ownerName: acc.owner.name,
        actionId,
        actionTitle: action.title,
        channel: action.channel,
        at: new Date(data.sent_at).getTime(),
        by: displayName || "You",
        status: data.status,
      };

      setLogs((prev) => [entry, ...prev]);
      // Clear any snooze on this account, server-side and locally.
      if (snoozed.has(accountId)) {
        await supabase.from("snoozes").delete().eq("account_id", accountId);
        setSnoozed((prev) => {
          const m = new Map(prev); m.delete(accountId); return m;
        });
      }
      return entry;
    },
    [accounts, user, displayName, forceFailNext, snoozed],
  );

  const snooze = useCallback(
    async (accountId: string, hours = 48) => {
      if (!user) return;
      const durationMs = hours * 60 * 60 * 1000;
      // Clear any existing row first (snoozes is unique on account_id).
      await supabase.from("snoozes").delete().eq("account_id", accountId);
      const { data, error } = await supabase
        .from("snoozes")
        .insert({ account_id: accountId, duration_ms: durationMs, snoozed_by: user.id })
        .select()
        .single();
      if (error) throw error;
      setSnoozed((prev) => {
        const m = new Map(prev);
        m.set(accountId, {
          accountId,
          snoozedAt: new Date(data.snoozed_at).getTime(),
          durationMs: Number(data.duration_ms),
          by: displayName || "You",
        });
        return m;
      });
    },
    [user, displayName],
  );

  const unsnooze = useCallback(async (accountId: string) => {
    await supabase.from("snoozes").delete().eq("account_id", accountId);
    setSnoozed((prev) => {
      const m = new Map(prev); m.delete(accountId); return m;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      accounts, intervened, snoozed, logs, loading,
      intervene, snooze, unsnooze,
      forceFailNext, setForceFailNext,
      hideAll, setHideAll,
    }),
    [accounts, intervened, snoozed, logs, loading, intervene, snooze, unsnooze, forceFailNext, hideAll],
  );

  return <RetentionContext.Provider value={value}>{children}</RetentionContext.Provider>;
}

export function useRetention() {
  const v = useContext(RetentionContext);
  if (!v) throw new Error("useRetention must be inside RetentionProvider");
  return v;
}
