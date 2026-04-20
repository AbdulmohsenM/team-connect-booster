import { useMemo, useState } from "react";
import { accounts as seed } from "@/data/atRiskAccounts";
import { AccountRow } from "@/components/AccountRow";
import { AccountDetail, type LogEntry } from "@/components/AccountDetail";
import { toast } from "sonner";
import { LayoutGrid, Inbox, Users, Bell, Search, Filter, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [intervened, setIntervened] = useState<Set<string>>(new Set());
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string>(seed[0].id);
  const [filter, setFilter] = useState<"needs-action" | "snoozed" | "intervened">("needs-action");
  const [logs, setLogs] = useState<Record<string, LogEntry[]>>({});

  const counts = useMemo(() => ({
    "needs-action": seed.filter((a) => !snoozed.has(a.id) && !intervened.has(a.id)).length,
    snoozed: seed.filter((a) => snoozed.has(a.id)).length,
    intervened: seed.filter((a) => intervened.has(a.id)).length,
  }), [snoozed, intervened]);

  const visible = useMemo(() => {
    return seed
      .filter((a) => {
        if (filter === "needs-action") return !snoozed.has(a.id) && !intervened.has(a.id);
        if (filter === "snoozed") return snoozed.has(a.id);
        return intervened.has(a.id);
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [snoozed, intervened, filter]);

  const active = seed.find((a) => a.id === activeId)!;

  const handleIntervene = (actionId: string) => {
    const action = [active.recommended, ...active.alternates].find((x) => x.id === actionId)!;
    const entry: LogEntry = {
      actionId,
      actionTitle: action.title,
      channel: action.channel,
      at: Date.now(),
      by: "Jordan Kim",
    };
    setLogs((prev) => ({ ...prev, [active.id]: [entry, ...(prev[active.id] ?? [])] }));
    setIntervened((prev) => new Set(prev).add(active.id));
    toast.success(`Intervention sent to ${active.owner.name}`, {
      description: `${action.title} · via ${action.channel}`,
    });
  };

  const handleSnooze = () => {
    setSnoozed((prev) => new Set(prev).add(active.id));
    toast(`Snoozed ${active.team} for 48h`, { description: "We'll resurface if risk worsens." });
    const next = visible.find((a) => a.id !== active.id && !intervened.has(a.id));
    if (next) setActiveId(next.id);
  };


  const total = seed.length;
  const intervenedCount = intervened.size;
  const pct = Math.round((intervenedCount / total) * 100);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="size-8 rounded-lg primary-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-sidebar-primary-foreground">Plansmith</span>
        </div>
        <nav className="px-3 space-y-0.5 text-sm">
          {[
            { icon: LayoutGrid, label: "Projects" },
            { icon: Inbox, label: "Inbox" },
            { icon: Users, label: "Customers" },
          ].map((i) => (
            <a key={i.label} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer">
              <i.icon className="size-4" /> {i.label}
            </a>
          ))}
          <a className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground cursor-pointer">
            <span className="flex items-center gap-3"><ShieldAlert className="size-4" /> Retention</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
              {total - intervenedCount}
            </span>
          </a>
        </nav>
        <div className="mt-auto px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2">
            <div className="size-7 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
              JK
            </div>
            <div className="text-xs">
              <div className="text-sidebar-primary-foreground">Jordan Kim</div>
              <div className="text-sidebar-foreground/60">PM · Growth</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex min-w-0">
        {/* Queue */}
        <section className="w-[440px] shrink-0 border-r border-border flex flex-col bg-muted/30">
          <header className="px-6 pt-6 pb-4 bg-background border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg font-semibold">At-risk accounts</h1>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Bell className="size-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sorted by risk · Updated 4 min ago
            </p>

            {/* Quarter goal banner */}
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
            <div className="mt-3 flex items-center gap-1">
              {([
                { id: "all", label: `All ${visible.length === seed.length ? "" : ""}` },
                { id: "critical", label: "Critical" },
                { id: "rising", label: "Rising" },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium transition-colors",
                    filter === t.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {visible.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No accounts match this filter.
              </div>
            )}
            {visible.map((a) => (
              <AccountRow
                key={a.id}
                account={a}
                active={a.id === activeId}
                intervened={intervened.has(a.id)}
                onClick={() => setActiveId(a.id)}
              />
            ))}
          </div>
        </section>

        {/* Detail */}
        <section className="flex-1 min-w-0">
          <AccountDetail
            key={active.id}
            account={active}
            intervened={intervened.has(active.id)}
            log={logs[active.id] ?? []}
            onIntervene={handleIntervene}
            onSnooze={handleSnooze}
            onClose={() => {
              const next = visible.find((a) => a.id !== active.id);
              if (next) setActiveId(next.id);
            }}
          />
        </section>
      </main>
    </div>
  );
};

export default Index;
