import { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { AccountRow } from "@/components/AccountRow";
import { AccountDetail } from "@/components/AccountDetail";
import { AccountDetailSkeleton } from "@/components/AccountDetailSkeleton";
import { toast } from "sonner";
import { Bell, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRetention } from "@/state/RetentionContext";

const Index = () => {
  const navigate = useNavigate();
  const { accounts, intervened, snoozed, logs, intervene, snooze, hideAll } = useRetention();

  // Empty state takeover when nothing at-risk
  const needsAction = useMemo(
    () => accounts.filter((a) => !intervened.has(a.id) && !snoozed.has(a.id)),
    [accounts, intervened, snoozed],
  );

  const [filter, setFilter] = useState<"needs-action" | "snoozed" | "intervened">("needs-action");
  const [activeId, setActiveId] = useState<string | null>(needsAction[0]?.id ?? accounts[0]?.id ?? null);
  // Brief loading state when switching accounts (simulates fetching the
  // full risk profile + signals + recommended action). Keyed off activeId.
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!activeId) return;
    setLoadingDetail(true);
    const t = setTimeout(() => setLoadingDetail(false), 500);
    return () => clearTimeout(t);
  }, [activeId]);

  // If hideAll dev toggle is on, show empty state
  if (hideAll || (needsAction.length === 0 && intervened.size === 0 && snoozed.size === 0)) {
    return <Navigate to="/all-clear" replace />;
  }

  const counts = {
    "needs-action": accounts.filter((a) => !snoozed.has(a.id) && !intervened.has(a.id)).length,
    snoozed: snoozed.size,
    intervened: intervened.size,
  };

  const visible = accounts
    .filter((a) => {
      if (filter === "needs-action") return !snoozed.has(a.id) && !intervened.has(a.id);
      if (filter === "snoozed") return snoozed.has(a.id);
      return intervened.has(a.id);
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  const active = accounts.find((a) => a.id === activeId) ?? visible[0] ?? accounts[0];

  // Logs scoped to active account
  const activeLogs = logs.filter((l) => l.accountId === active.id);

  // Throws if delivery fails so AccountDetail can show its inline error state.
  const handleIntervene = async (actionId: string) => {
    const entry = await intervene(active.id, actionId);
    navigate(`/confirmation/${entry.id}`);
  };

  const handleSnooze = () => {
    snooze(active.id, 48);
    toast(`Snoozed ${active.team} for 48h`, { description: "We'll resurface if risk worsens." });
    const next = accounts
      .filter((a) => a.id !== active.id && !snoozed.has(a.id) && !intervened.has(a.id))
      .sort((a, b) => b.riskScore - a.riskScore)[0];
    if (next) setActiveId(next.id);
  };

  const total = accounts.length;
  const intervenedCount = intervened.size;
  const pct = Math.round((intervenedCount / total) * 100);

  return (
    <>
      {/* Queue */}
      <section className="w-[440px] shrink-0 border-r border-border flex flex-col bg-muted/30">
        <header className="px-6 pt-6 pb-4 bg-background border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-semibold">At-risk accounts</h1>
            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Bell className="size-4" /></button>
          </div>
          <p className="text-xs text-muted-foreground">Sorted by risk · Updated 4 min ago</p>

          <div className="mt-4 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium">Q2 goal: intervene on 50% of at-risk</span>
              <span className="text-muted-foreground">{intervenedCount} / {total}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full primary-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search accounts…"
                className="w-full text-sm pl-8 pr-3 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground">
              <Filter className="size-3.5" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
            {([
              { id: "needs-action", label: "Needs action", tone: "danger" as const },
              { id: "snoozed", label: "Snoozed", tone: "muted" as const },
              { id: "intervened", label: "Intervened", tone: "success" as const },
            ]).map((t) => {
              const isActive = filter === t.id;
              const count = counts[t.id as keyof typeof counts];
              return (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id as typeof filter)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 text-xs px-2 py-1.5 rounded-md font-medium transition-colors",
                    isActive ? "bg-background text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{t.label}</span>
                  <span className={cn(
                    "min-w-[18px] px-1 text-[10px] font-semibold rounded-full leading-tight py-0.5 tabular-nums",
                    isActive && t.tone === "danger" && "bg-danger-soft text-destructive",
                    isActive && t.tone === "muted" && "bg-muted-foreground/15 text-muted-foreground",
                    isActive && t.tone === "success" && "bg-success-soft text-success",
                    !isActive && "bg-background/60 text-muted-foreground"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {visible.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {filter === "needs-action" && "All clear — every at-risk account has been actioned or snoozed."}
              {filter === "snoozed" && "Nothing snoozed."}
              {filter === "intervened" && "No interventions sent yet. Open an account to send one."}
            </div>
          )}
          {visible.map((a) => (
            <AccountRow
              key={a.id}
              account={a}
              active={a.id === active.id}
              intervened={intervened.has(a.id)}
              onClick={() => setActiveId(a.id)}
            />
          ))}
        </div>
      </section>

      <section className="flex-1 min-w-0">
        <AccountDetail
          key={active.id}
          account={active}
          intervened={intervened.has(active.id)}
          log={activeLogs}
          onIntervene={handleIntervene}
          onSnooze={handleSnooze}
          onClose={() => {
            const next = visible.find((a) => a.id !== active.id);
            if (next) setActiveId(next.id);
          }}
        />
      </section>
    </>
  );
};

export default Index;
