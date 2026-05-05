import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Clock, RotateCcw, ArrowRight, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRetention } from "../state/RetentionContext";
import { useNow } from "../hooks/useNow";
import { timeRemaining } from "../utils/time";
import { RiskBadge } from "../components/RiskBadge";

/** Snoozed Accounts page — table with countdown + Resume action. */
export default function SnoozedAccountsPage() {
  const { accounts, snoozed, unsnooze, preferences } = useRetention();
  const now = useNow(30_000);
  const [query, setQuery] = useState("");

  const items = Array.from(snoozed.values())
    .map((s) => ({ snooze: s, account: accounts.find((a) => a.id === s.accountId)! }))
    .filter(({ account }) => !query || account.team.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.snooze.snoozedAt + a.snooze.durationMs) - (b.snooze.snoozedAt + b.snooze.durationMs));

  const dueSoon = items.filter(({ snooze }) => {
    const r = snooze.snoozedAt + snooze.durationMs - now;
    return r <= 6 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-muted/30">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Retention</p>
            <h1 className="text-2xl font-semibold mt-0.5">Snoozed accounts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              These accounts will resurface in the at-risk queue when their timer ends — or sooner if risk worsens.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="outline" size="sm">Back to queue</Button></Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Currently snoozed</p>
            <p className="text-2xl font-semibold mt-1 tabular-nums">{items.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Due within 6h</p>
            <p className={cn("text-2xl font-semibold mt-1 tabular-nums", dueSoon > 0 && "text-warning")}>{dueSoon}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Default snooze</p>
            <p className="text-2xl font-semibold mt-1">48h</p>
          </div>
        </div>

        <div className="mt-6 relative max-w-sm">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search snoozed accounts…"
            className="w-full text-sm pl-8 pr-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_1fr_120px_180px] gap-4 px-5 py-3 border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <span>Account</span>
            <span>Risk</span>
            <span>Reason for snooze</span>
            <span>Snoozed by</span>
            <span className="text-right">Resumes in</span>
          </div>

          {items.length === 0 && (
            <div className="px-5 py-16 text-center">
              <Clock className="size-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">No snoozed accounts</p>
              <p className="text-xs text-muted-foreground mt-1">
                Snooze an account from the at-risk queue to defer it for 48h.
              </p>
              <Link to="/" className="inline-block mt-4">
                <Button size="sm" variant="outline" className="gap-1.5">Go to queue <ArrowRight className="size-3.5" /></Button>
              </Link>
            </div>
          )}

          {items.map(({ snooze, account }) => {
            const t = timeRemaining(snooze.snoozedAt, snooze.durationMs, now);
            return (
              <div
                key={account.id}
                className="grid grid-cols-[1fr_140px_1fr_120px_180px] gap-4 px-5 py-4 border-b border-border last:border-b-0 items-center hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 shrink-0 rounded-lg primary-gradient flex items-center justify-center text-primary-foreground text-xs font-semibold">
                    {account.owner.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{account.team}</p>
                    <p className="text-xs text-muted-foreground truncate">{account.owner.name} · {account.plan} · ${account.mrr}/mo</p>
                  </div>
                </div>
                <div>
                  <RiskBadge score={account.riskScore} size="sm" />
                </div>
                <p className="text-xs text-foreground/80 line-clamp-2">{account.topReason}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="size-5 rounded-full primary-gradient text-primary-foreground text-[9px] font-semibold flex items-center justify-center">
                    {snooze.by.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="truncate">{snooze.by.split(" ")[0]}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs font-medium tabular-nums",
                    t.urgent ? "text-warning" : "text-muted-foreground"
                  )}>
                    {t.urgent && <AlertTriangle className="size-3" />}
                    <Clock className="size-3" />
                    {t.label}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => {
                      unsnooze(account.id);
                      toast.success(`Resumed ${account.team}`, { description: "Back in the at-risk queue." });
                    }}
                  >
                    <RotateCcw className="size-3" /> Resume
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
