import { useEffect, useState } from "react";
import { useNavigate, Navigate as RouterNavigate } from "react-router-dom";
import { Bell, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRetention } from "../state/RetentionContext";
import { useAccountQueue, useInterventionProgress, type QueueFilter } from "../hooks/useAccountQueue";
import { useDetailLoading } from "../hooks/useDetailLoading";
import { AccountRow } from "../components/AccountRow";
import { AccountDetailPanel } from "../components/AccountDetailPanel";
import { AccountDetailPanelSkeleton } from "../components/AccountDetailPanelSkeleton";

/**
 * At-Risk Queue page — left: prioritized queue with workflow filters,
 * right: AccountDetailPanel for the active selection.
 */
export default function AtRiskQueuePage() {
  const navigate = useNavigate();
  const { accounts, intervened, snoozed, logs, intervene, snooze, hideAll, loading, accountsUpdatedAt } = useRetention();

  const [filter, setFilter] = useState<QueueFilter>("needs-action");
  const { visible, counts, needsAction } = useAccountQueue(filter);
  const { total, sent: intervenedCount, pct, targetPct } = useInterventionProgress();

  const [activeId, setActiveId] = useState<string | null>(null);
  const loadingDetail = useDetailLoading(activeId, 500);

  // Pick a default selection once accounts arrive.
  useEffect(() => {
    if (activeId === null && accounts.length > 0) {
      setActiveId(needsAction[0]?.id ?? accounts[0].id);
    }
  }, [activeId, accounts, needsAction]);

  if (loading && accounts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Loading at-risk queue…
      </div>
    );
  }

  // Empty state takeover
  if (hideAll || (accounts.length > 0 && needsAction.length === 0 && intervened.size === 0 && snoozed.size === 0)) {
    return <RouterNavigate to="/all-clear" replace />;
  }

  const active = accounts.find((a) => a.id === activeId) ?? visible[0] ?? accounts[0];
  if (!active) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        No accounts yet. Seed the database to begin.
      </div>
    );
  }
  const activeLogs = logs.filter((l) => l.accountId === active.id);

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
                  onClick={() => setFilter(t.id as QueueFilter)}
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
        {loadingDetail ? (
          <AccountDetailPanelSkeleton />
        ) : (
          <AccountDetailPanel
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
        )}
      </section>
    </>
  );
}
