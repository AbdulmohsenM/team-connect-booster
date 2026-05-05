import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/features/auth/SessionProvider";
import { accounts as demoAccounts } from "../data/accounts";
import type {
  Account, Action, Channel, LogEntry, Signal, SnoozeEntry,
  AccountNote, RiskEvent, FollowUp, OrgGoal, UserPreferences,
} from "../data/types";

type Ctx = {
  accounts: Account[];
  intervened: Set<string>;
  snoozed: Map<string, SnoozeEntry>;
  logs: LogEntry[];
  notes: AccountNote[];
  riskEvents: RiskEvent[];
  followUps: FollowUp[];
  orgGoal: OrgGoal | null;
  preferences: UserPreferences;
  accountsUpdatedAt: number | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  intervene: (accountId: string, actionId: string) => Promise<LogEntry>;
  snooze: (accountId: string, hours?: number) => Promise<void>;
  unsnooze: (accountId: string) => Promise<void>;
  forceFailNext: boolean;
  setForceFailNext: (v: boolean) => void;
  hideAll: boolean;
  setHideAll: (v: boolean) => void;
};

const RetentionContext = createContext<Ctx | null>(null);

const FAILURE_RATE = 0;
const DEMO_NOW = new Date("2026-05-05T10:00:00Z").getTime();

type AccountRow = {
  id: string; team: string; plan: string; seats: number;
  owner_name: string; owner_role: string; owner_avatar: string | null;
  days_since_signup: number; risk_score: number;
  trend: "up" | "down" | "flat"; top_reason: string; mrr: number;
  quote_text: string | null; quote_source: string | null; quote_channel: string | null;
  updated_at: string;
};
type SignalRow = { id: string; account_id: string; label: string; detail: string; weight: "high" | "med" | "low"; position: number };
type ActionRow = { id: string; account_id: string; title: string; preview: string; channel: Channel; expected_lift: string; is_recommended: boolean; position: number };
type LogRow = { id: string; account_id: string; action_id: string; channel: Channel; sent_at: string; sent_by: string; status: "Awaiting response" | "Responded" | "Re-engaged" };
type SnoozeRow = { id: string; account_id: string; duration_ms: number; snoozed_at: string; snoozed_by: string };
type NoteRow = { id: string; account_id: string; author_id: string; body: string; created_at: string };
type RiskEventRow = { id: string; account_id: string; event_type: "flagged" | "score_change" | "cleared"; previous_score: number | null; new_score: number; occurred_at: string };
type FollowUpRow = { id: string; log_id: string; account_id: string; scheduled_at: string; completed_at: string | null };
type OrgGoalRow = { id: string; metric: string; target_pct: number; period_start: string; period_end: string };
type PrefRow = { user_id: string; default_snooze_hours: number; notification_settings: unknown };

const DEMO_RISK_EVENTS: RiskEvent[] = [
  { id: "risk-acme", accountId: "acme-robotics", eventType: "flagged", previousScore: 81, newScore: 92, occurredAt: DEMO_NOW - 2 * 24 * 60 * 60 * 1000 },
  { id: "risk-northwind", accountId: "northwind", eventType: "flagged", previousScore: 69, newScore: 78, occurredAt: DEMO_NOW - 4 * 24 * 60 * 60 * 1000 },
  { id: "risk-globex", accountId: "globex", eventType: "flagged", previousScore: 65, newScore: 71, occurredAt: DEMO_NOW - 5 * 24 * 60 * 60 * 1000 },
  { id: "risk-fern", accountId: "fern-co", eventType: "flagged", previousScore: 52, newScore: 64, occurredAt: DEMO_NOW - 1 * 24 * 60 * 60 * 1000 },
  { id: "risk-old-1", accountId: "vertex", eventType: "flagged", previousScore: 54, newScore: 61, occurredAt: DEMO_NOW - 10 * 24 * 60 * 60 * 1000 },
  { id: "risk-old-2", accountId: "globex", eventType: "flagged", previousScore: 57, newScore: 66, occurredAt: DEMO_NOW - 12 * 24 * 60 * 60 * 1000 },
  { id: "risk-old-3", accountId: "northwind", eventType: "flagged", previousScore: 60, newScore: 68, occurredAt: DEMO_NOW - 13 * 24 * 60 * 60 * 1000 },
];

const DEMO_NOTES: AccountNote[] = [
  { id: "note-acme", accountId: "acme-robotics", authorId: "00000000-0000-4000-8000-000000000001", authorName: "Jordan Kim", body: "Priya is blocked on team invites, not product value. Prioritize the forwarding link instead of a generic nurture.", createdAt: DEMO_NOW - 7 * 60 * 60 * 1000 },
  { id: "note-globex", accountId: "globex", authorId: "00000000-0000-4000-8000-000000000001", authorName: "Jordan Kim", body: "High expansion upside, but rollout fear is the real risk. Position support as white-glove rather than training.", createdAt: DEMO_NOW - 28 * 60 * 60 * 1000 },
];

const DEMO_ORG_GOAL: OrgGoal = {
  id: "goal-q2",
  metric: "intervention_coverage_pct",
  targetPct: 50,
  periodStart: new Date("2026-04-01T00:00:00Z").getTime(),
  periodEnd: new Date("2026-06-30T23:59:59Z").getTime(),
};

function shapeAccount(a: AccountRow, signals: SignalRow[], actions: ActionRow[]): Account {
  const sigs: Signal[] = signals
    .filter((s) => s.account_id === a.id)
    .sort((x, y) => x.position - y.position)
    .map((s) => ({ label: s.label, detail: s.detail, weight: s.weight }));
  const acts = actions
    .filter((x) => x.account_id === a.id)
    .sort((x, y) => x.position - y.position);
  const recRow = acts.find((x) => x.is_recommended) ?? acts[0];
  const toAction = (x: ActionRow): Action => ({
    id: x.id, title: x.title, preview: x.preview, channel: x.channel, expectedLift: x.expected_lift,
  });
  const recommended = recRow ? toAction(recRow) : { id: "", title: "", preview: "", channel: "in-app nudge" as Channel, expectedLift: "" };
  const alternates = acts.filter((x) => x.id !== recRow?.id).map(toAction);
  return {
    id: a.id, team: a.team, plan: a.plan, seats: a.seats,
    owner: { name: a.owner_name, role: a.owner_role, avatar: a.owner_avatar ?? "" },
    daysSinceSignup: a.days_since_signup, riskScore: a.risk_score, trend: a.trend,
    topReason: a.top_reason, mrr: Number(a.mrr),
    signals: sigs,
    quote: { text: a.quote_text ?? "", source: a.quote_source ?? "", channel: a.quote_channel ?? "" },
    recommended, alternates,
  };
}

const DEFAULT_PREFS: UserPreferences = { defaultSnoozeHours: 48 };

export function RetentionProvider({ children }: { children: ReactNode }) {
  const { user, displayName, isDemo } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [snoozed, setSnoozed] = useState<Map<string, SnoozeEntry>>(new Map());
  const [notes, setNotes] = useState<AccountNote[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [orgGoal, setOrgGoal] = useState<OrgGoal | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [accountsUpdatedAt, setAccountsUpdatedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [hideAll, setHideAll] = useState(false);
  const [forceFailNext, setForceFailNext] = useState(false);

  const intervened = useMemo(() => new Set(logs.map((l) => l.accountId)), [logs]);

  useEffect(() => {
    if (!isDemo || !user) return;
    setAccounts(demoAccounts);
    setAccountsUpdatedAt(DEMO_NOW);
    setLogs([]);
    setSnoozed(new Map());
    setNotes(DEMO_NOTES);
    setRiskEvents(DEMO_RISK_EVENTS);
    setFollowUps([]);
    setOrgGoal(DEMO_ORG_GOAL);
    setPreferences(DEFAULT_PREFS);
    setHideAll(false);
    setError(null);
    setLoading(false);
  }, [isDemo, user]);

  const reload = useCallback(() => setReloadTick((n) => n + 1), []);

  useEffect(() => {
    if (isDemo) return;
    if (!user) {
      setAccounts([]); setLogs([]); setSnoozed(new Map());
      setNotes([]); setRiskEvents([]); setFollowUps([]);
      setOrgGoal(null); setPreferences(DEFAULT_PREFS);
      setAccountsUpdatedAt(null); setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [accRes, sigRes, actRes, logRes, snoozeRes, noteRes, riskRes, fuRes, goalRes, prefRes] = await Promise.all([
        supabase.from("accounts").select("*").order("risk_score", { ascending: false }),
        supabase.from("signals").select("*"),
        supabase.from("actions").select("*"),
        supabase.from("intervention_logs").select("*").order("sent_at", { ascending: false }),
        supabase.from("snoozes").select("*"),
        (supabase.from as any)("account_notes").select("*").order("created_at", { ascending: false }),
        (supabase.from as any)("risk_events").select("*").order("occurred_at", { ascending: false }),
        (supabase.from as any)("follow_ups").select("*"),
        (supabase.from as any)("org_goals").select("*").eq("metric", "intervention_coverage_pct").order("period_start", { ascending: false }).limit(1).maybeSingle(),
        (supabase.from as any)("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (cancelled) return;

      const accs = (accRes.data ?? []) as AccountRow[];
      const sigs = (sigRes.data ?? []) as SignalRow[];
      const acts = (actRes.data ?? []) as ActionRow[];
      const lgs = (logRes.data ?? []) as LogRow[];
      const sns = (snoozeRes.data ?? []) as SnoozeRow[];
      const nts = (noteRes.data ?? []) as NoteRow[];
      const res = (riskRes.data ?? []) as RiskEventRow[];
      const fus = (fuRes.data ?? []) as FollowUpRow[];
      const goal = (goalRes.data ?? null) as OrgGoalRow | null;
      const pref = (prefRes.data ?? null) as PrefRow | null;

      const userIds = Array.from(new Set([
        ...lgs.map((l) => l.sent_by),
        ...sns.map((s) => s.snoozed_by),
        ...nts.map((n) => n.author_id),
      ]));
      let names: Record<string, string> = {};
      if (userIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id,display_name").in("id", userIds);
        names = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
      }

      const shaped = accs.map((a) => shapeAccount(a, sigs, acts));
      setAccounts(shaped);
      setAccountsUpdatedAt(
        accs.length ? Math.max(...accs.map((a) => new Date(a.updated_at).getTime())) : null,
      );

      const accountById = new Map(shaped.map((a) => [a.id, a]));
      setLogs(
        lgs.map<LogEntry>((l) => {
          const acc = accountById.get(l.account_id);
          const action = acc ? [acc.recommended, ...acc.alternates].find((x) => x.id === l.action_id) : undefined;
          return {
            id: l.id, accountId: l.account_id, accountTeam: acc?.team ?? "",
            ownerName: acc?.owner.name ?? "",
            actionId: l.action_id, actionTitle: action?.title ?? "Intervention",
            channel: l.channel, at: new Date(l.sent_at).getTime(),
            by: names[l.sent_by] ?? "Teammate", status: l.status,
          };
        }),
      );

      setSnoozed(new Map(sns.map<[string, SnoozeEntry]>((s) => [s.account_id, {
        accountId: s.account_id,
        snoozedAt: new Date(s.snoozed_at).getTime(),
        durationMs: Number(s.duration_ms),
        by: names[s.snoozed_by] ?? "Teammate",
      }])));

      setNotes(nts.map<AccountNote>((n) => ({
        id: n.id, accountId: n.account_id, authorId: n.author_id,
        authorName: names[n.author_id] ?? "Teammate",
        body: n.body, createdAt: new Date(n.created_at).getTime(),
      })));

      setRiskEvents(res.map<RiskEvent>((r) => ({
        id: r.id, accountId: r.account_id, eventType: r.event_type,
        previousScore: r.previous_score, newScore: r.new_score,
        occurredAt: new Date(r.occurred_at).getTime(),
      })));

      setFollowUps(fus.map<FollowUp>((f) => ({
        id: f.id, logId: f.log_id, accountId: f.account_id,
        scheduledAt: new Date(f.scheduled_at).getTime(),
        completedAt: f.completed_at ? new Date(f.completed_at).getTime() : null,
      })));

      setOrgGoal(goal ? {
        id: goal.id, metric: goal.metric, targetPct: goal.target_pct,
        periodStart: new Date(goal.period_start).getTime(),
        periodEnd: new Date(goal.period_end).getTime(),
      } : null);

      setPreferences({ defaultSnoozeHours: pref?.default_snooze_hours ?? 48 });

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, isDemo]);

  const intervene = useCallback(
    async (accountId: string, actionId: string): Promise<LogEntry> => {
      if (!user) throw new Error("Not signed in");
      const acc = accounts.find((a) => a.id === accountId);
      const action = acc ? [acc.recommended, ...acc.alternates].find((x) => x.id === actionId) : undefined;
      if (!acc || !action) throw new Error("Account or action not found");

      if (isDemo) {
        const sentAt = Date.now();
        const entry: LogEntry = {
          id: `demo-log-${accountId}-${actionId}-${sentAt}`,
          accountId,
          accountTeam: acc.team,
          ownerName: acc.owner.name,
          actionId,
          actionTitle: action.title,
          channel: action.channel,
          at: sentAt,
          by: displayName || "You",
          status: "Awaiting response",
        };
        setLogs((prev) => [entry, ...prev]);
        setFollowUps((prev) => [
          ...prev,
          {
            id: `demo-fu-${entry.id}`,
            logId: entry.id,
            accountId,
            scheduledAt: sentAt + 48 * 60 * 60 * 1000,
            completedAt: null,
          },
        ]);
        if (snoozed.has(accountId)) {
          setSnoozed((prev) => {
            const m = new Map(prev);
            m.delete(accountId);
            return m;
          });
        }
        return entry;
      }

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
          account_id: accountId, action_id: actionId, channel: action.channel,
          sent_by: user.id, status: "Awaiting response",
        })
        .select()
        .single();
      if (error) throw error;

      const sentAt = new Date(data.sent_at).getTime();
      const entry: LogEntry = {
        id: data.id, accountId, accountTeam: acc.team, ownerName: acc.owner.name,
        actionId, actionTitle: action.title, channel: action.channel,
        at: sentAt, by: displayName || "You", status: data.status,
      };
      setLogs((prev) => [entry, ...prev]);

      // Schedule the 48h auto follow-up.
      const scheduledAt = new Date(sentAt + 48 * 60 * 60 * 1000).toISOString();
      const { data: fu } = await (supabase.from as any)("follow_ups")
        .insert({ log_id: data.id, account_id: accountId, scheduled_at: scheduledAt })
        .select()
        .single();
      if (fu) {
        setFollowUps((prev) => [...prev, {
          id: fu.id, logId: fu.log_id, accountId: fu.account_id,
          scheduledAt: new Date(fu.scheduled_at).getTime(),
          completedAt: fu.completed_at ? new Date(fu.completed_at).getTime() : null,
        }]);
      }

      if (snoozed.has(accountId)) {
        await supabase.from("snoozes").delete().eq("account_id", accountId);
        setSnoozed((prev) => { const m = new Map(prev); m.delete(accountId); return m; });
      }
      return entry;
    },
    [accounts, user, displayName, forceFailNext, snoozed, isDemo],
  );

  const snooze = useCallback(
    async (accountId: string, hours?: number) => {
      if (!user) return;
      const h = hours ?? preferences.defaultSnoozeHours;
      const durationMs = h * 60 * 60 * 1000;
      if (isDemo) {
        setSnoozed((prev) => {
          const m = new Map(prev);
          m.set(accountId, {
            accountId,
            snoozedAt: Date.now(),
            durationMs,
            by: displayName || "You",
          });
          return m;
        });
        return;
      }
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
    [user, displayName, preferences.defaultSnoozeHours, isDemo],
  );

  const unsnooze = useCallback(async (accountId: string) => {
    if (isDemo) {
      setSnoozed((prev) => { const m = new Map(prev); m.delete(accountId); return m; });
      return;
    }
    await supabase.from("snoozes").delete().eq("account_id", accountId);
    setSnoozed((prev) => { const m = new Map(prev); m.delete(accountId); return m; });
  }, [isDemo]);

  const value = useMemo<Ctx>(
    () => ({
      accounts, intervened, snoozed, logs,
      notes, riskEvents, followUps, orgGoal, preferences, accountsUpdatedAt,
      loading, intervene, snooze, unsnooze,
      forceFailNext, setForceFailNext, hideAll, setHideAll,
    }),
    [accounts, intervened, snoozed, logs, notes, riskEvents, followUps, orgGoal, preferences, accountsUpdatedAt, loading, intervene, snooze, unsnooze, forceFailNext, hideAll],
  );

  return <RetentionContext.Provider value={value}>{children}</RetentionContext.Provider>;
}

export function useRetention() {
  const v = useContext(RetentionContext);
  if (!v) throw new Error("useRetention must be inside RetentionProvider");
  return v;
}
