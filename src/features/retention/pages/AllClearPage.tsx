import { Link } from "react-router-dom";
import { CheckCircle2, History as HistoryIcon, Clock, TrendingDown, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRetention } from "../state/RetentionContext";

/** All Clear page — empty/inbox-zero state for the at-risk queue. */
export default function AllClearPage() {
  const { intervened, snoozed, logs, riskEvents, hideAll, setHideAll } = useRetention();
  const intervenedCount = intervened.size;
  const snoozedCount = snoozed.size;
  const recent = logs.slice(0, 3);

  // Interventions sent this quarter (from logs.at).
  const quarterStart = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1).getTime();
  })();
  const quarterIntervenedCount = logs.filter((l) => l.at >= quarterStart).length;

  // Week-over-week at-risk change from risk_events.
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const flagged = riskEvents.filter((r) => r.eventType === "flagged");
  const thisWeek = flagged.filter((r) => r.occurredAt >= now - weekMs).length;
  const priorWeek = flagged.filter((r) => r.occurredAt >= now - 2 * weekMs && r.occurredAt < now - weekMs).length;
  const weekOverWeek = priorWeek === 0
    ? (thisWeek === 0 ? 0 : 100)
    : Math.round(((thisWeek - priorWeek) / priorWeek) * 100);
  const weekOverWeekLabel = `${weekOverWeek > 0 ? "+" : ""}${weekOverWeek}%`;
  const weekOverWeekIsImproving = weekOverWeek <= 0;

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-muted/30">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-success-soft mb-6">
            <CheckCircle2 className="size-10 text-success" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-success">Inbox zero</p>
          <h1 className="text-3xl font-semibold mt-2">You're all caught up.</h1>
          <p className="text-base text-muted-foreground mt-3 max-w-lg mx-auto">
            No accounts require action right now.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-3 max-w-lg mx-auto">
            Plansmith will ping you when a new account crosses the risk threshold — usually within a few hours.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="size-3.5" />
              <p className="text-[10px] uppercase tracking-wider font-semibold">Interventions sent</p>
            </div>
            <p className="text-3xl font-semibold mt-2 tabular-nums">{intervenedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">this quarter</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-3.5" />
              <p className="text-[10px] uppercase tracking-wider font-semibold">Snoozed</p>
            </div>
            <p className="text-3xl font-semibold mt-2 tabular-nums">{snoozedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">resume in &lt; 48h</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-success">
              <TrendingDown className="size-3.5" />
              <p className="text-[10px] uppercase tracking-wider font-semibold">At-risk this week</p>
            </div>
            <p className="text-3xl font-semibold mt-2 tabular-nums text-success">−32%</p>
            <p className="text-xs text-muted-foreground mt-1">vs prior 7 days</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">While you wait</h2>
          <div className="space-y-3">
            <Link to="/history" className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-accent flex items-center justify-center">
                  <HistoryIcon className="size-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Review intervention history</p>
                  <p className="text-xs text-muted-foreground">See which messages drove responses this week.</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link to="/snoozed" className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-accent flex items-center justify-center">
                  <Clock className="size-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Check snoozed queue ({snoozedCount})</p>
                  <p className="text-xs text-muted-foreground">Pull anything back early if you have bandwidth.</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {recent.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">Latest interventions</p>
              <ul className="space-y-2.5">
                {recent.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 text-sm">
                    <div className="size-1.5 rounded-full bg-success" />
                    <span className="font-medium">{entry.accountTeam}</span>
                    <span className="text-muted-foreground truncate">— {entry.actionTitle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setHideAll(!hideAll)}
            className={cn("text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline")}
          >
            {hideAll ? "← Restore at-risk accounts (preview mode)" : "Tip: showing this state because the queue was cleared"}
          </button>
        </div>
      </div>
    </div>
  );
}
