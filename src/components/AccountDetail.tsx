import { Account, Action } from "@/data/atRiskAccounts";
import { RiskScoreRing } from "./RiskBadge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Quote, Sparkles, Send, Mail, MessageSquare, Clock, TrendingUp, AlertTriangle, CheckCircle2, X, ChevronRight, History, AlertOctagon, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";
import type { LogEntry } from "@/state/RetentionContext";

interface Props {
  account: Account;
  intervened: boolean;
  log: LogEntry[];
  /** Should resolve on success and reject on delivery failure. */
  onIntervene: (actionId: string) => Promise<void> | void;
  onSnooze: () => void;
  onClose: () => void;
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const channelIcon = {
  "in-app nudge": Sparkles,
  email: Mail,
  "Slack message": MessageSquare,
};

export function AccountDetail({ account, intervened, log, onIntervene, onSnooze, onClose }: Props) {
  const [selected, setSelected] = useState<Action>(account.recommended);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ message: string; failedActionId: string } | null>(null);

  useEffect(() => {
    setSelected(account.recommended);
    setSending(false);
    setError(null);
  }, [account.id]);

  const allActions = [account.recommended, ...account.alternates];

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      await onIntervene(selected.id);
      // Parent navigates away on success; nothing else to do here.
    } catch (e) {
      setSending(false);
      setError({
        message: e instanceof Error ? e.message : "Unknown delivery error",
        failedActionId: selected.id,
      });
    }
  };

  // Clear the error if the user picks a different action.
  useEffect(() => {
    if (error && selected.id !== error.failedActionId) setError(null);
  }, [selected.id, error]);


  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-7 pt-6 pb-5 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <RiskScoreRing score={account.riskScore} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{account.team}</h2>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{account.plan}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {account.owner.name}, {account.owner.role} · Day {account.daysSinceSignup} · ${account.mrr}/mo MRR
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-7 space-y-8">
        {/* ───────────── HERO: Suggested intervention ───────────── */}
        {/* Promoted to the top, elevated surface, larger type, dominant action cards. */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-tight">Suggested intervention</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pick a channel and send — typically resolves in &lt;48h.</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
              <TrendingUp className="size-3.5" />
              <span className="tabular-nums">{selected.expectedLift}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-accent/30 p-4 shadow-card">
            <div className="space-y-2">
              {allActions.map((a) => {
                const Icon = channelIcon[a.channel];
                const isSelected = selected.id === a.id;
                const isRecommended = a.id === account.recommended.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={cn(
                      "w-full text-left rounded-xl border p-5 transition-all",
                      isSelected
                        ? "border-primary bg-card ring-2 ring-primary/20 shadow-card"
                        : "border-transparent bg-card/60 hover:bg-card hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "size-10 shrink-0 rounded-lg flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[15px] leading-snug">{a.title}</span>
                          {isRecommended && (
                            <span className="text-[10px] uppercase font-semibold tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">via {a.channel}</p>
                      </div>
                      <ChevronRight className={cn(
                        "size-5 shrink-0 mt-1 transition-transform",
                        isSelected ? "text-primary rotate-90" : "text-muted-foreground"
                      )} />
                    </div>
                    {isSelected && (
                      <div className="mt-4 ml-14 rounded-lg bg-background border border-border p-4">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Message preview</p>
                        <p className="text-sm text-foreground leading-relaxed">{a.preview}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───────────── CONTEXT: Why + Quote (paired, equal weight, demoted) ───────────── */}
        <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Why — risk reason */}
          <div className="xl:col-span-3">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="size-3.5 text-warning" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Why they're at risk</h3>
            </div>
            <div className="rounded-xl risk-gradient border border-warning/20 p-4 h-full">
              <p className="font-medium text-sm text-foreground">{account.topReason}</p>
              <ul className="mt-3 space-y-2">
                {account.signals.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-xs">
                    <span className={cn("mt-1.5 size-1.5 rounded-full shrink-0",
                      s.weight === "high" && "bg-destructive",
                      s.weight === "med" && "bg-warning",
                      s.weight === "low" && "bg-muted-foreground"
                    )} />
                    <div className="leading-relaxed">
                      <span className="font-medium text-foreground">{s.label}</span>
                      <span className="text-muted-foreground"> — {s.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quote — real user voice */}
          <div className="xl:col-span-2">
            <div className="flex items-center gap-2 mb-2.5">
              <Quote className="size-3.5 text-primary" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">In their words</h3>
            </div>
            <blockquote className="rounded-xl border-l-4 border-primary bg-accent/30 px-4 py-3.5 h-full">
              <p className="text-sm text-foreground italic leading-relaxed">"{account.quote.text}"</p>
              <footer className="mt-2.5 text-[11px] text-muted-foreground">
                — {account.quote.source} · <span className="italic">{account.quote.channel}</span>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* ───────────── SUPPORTING: Activity & ownership (demoted) ───────────── */}
        <section>
          <div className="flex items-center justify-between mb-2.5 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 mt-3">
              <History className="size-3.5 text-muted-foreground" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Activity & ownership</h3>
            </div>
            <div className="flex items-center gap-2 text-xs mt-3">
              <span className="text-muted-foreground">Owner</span>
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5">
                <div className="size-4 rounded-full primary-gradient text-primary-foreground text-[9px] font-semibold flex items-center justify-center">JK</div>
                <span className="font-medium">Jordan Kim</span>
                <span className="text-muted-foreground">· you</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <ol className="relative">
              {/* New: live intervention entries */}
              {log.map((entry, i) => {
                const Icon = channelIcon[entry.channel];
                const isYou = entry.by === "Jordan Kim";
                return (
                  <li key={`log-${i}`} className="flex gap-3 px-4 py-3.5 border-b border-border last:border-b-0 bg-success-soft/30">
                    <div className="relative shrink-0">
                      <div className="size-8 rounded-full primary-gradient text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                        {entry.by.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-success text-success-foreground flex items-center justify-center ring-2 ring-card">
                        <Icon className="size-2.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{isYou ? "You" : entry.by}</span>
                        <span className="text-muted-foreground"> sent intervention · </span>
                        <span className="text-muted-foreground">{formatRelative(entry.at)}</span>
                      </p>
                      <p className="text-sm text-foreground mt-0.5">{entry.actionTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">via {entry.channel} · awaiting response</p>
                    </div>
                  </li>
                );
              })}

              {/* Seed: prior PM workflow events to make it read as collaborative work */}
              <li className="flex gap-3 px-4 py-3.5 border-b border-border">
                <div className="size-8 shrink-0 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center">
                  AI
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">Risk model</span>
                    <span className="text-muted-foreground"> flagged this account · {Math.max(2, account.daysSinceSignup - 4)}h ago</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Score crossed threshold ({account.riskScore}). Routed to Jordan Kim (Growth PM).</p>
                </div>
              </li>
              <li className="flex gap-3 px-4 py-3.5">
                <div className="size-8 shrink-0 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center">
                  CS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">Casey Singh</span>
                    <span className="text-muted-foreground"> (CSM) added a note · 1d ago</span>
                  </p>
                  <p className="text-xs text-foreground mt-0.5 italic">"Saw the same pattern on three other accounts this week. Worth a tighter playbook."</p>
                </div>
              </li>
            </ol>

            {log.length > 0 && (
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border bg-muted/40 text-xs">
                <span className="text-muted-foreground">Next: follow up if no response in 48h</span>
                <button className="font-medium text-primary hover:underline">Schedule follow-up</button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Action bar */}
      <div className="border-t border-border bg-card px-7 py-4 space-y-3">
        {/* Error state — exact required copy + retry / pick another action */}
        {error && !intervened && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-danger-soft px-4 py-3"
          >
            <div className="size-8 shrink-0 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertOctagon className="size-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-destructive">
                Intervention failed to send. Please retry or choose another action.
              </p>
              <p className="text-xs text-destructive/80 mt-0.5 truncate">{error.message}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setError(null);
                  // Scroll-into-view nudge: focus the next non-failed action.
                  const next = allActions.find((a) => a.id !== error.failedActionId);
                  if (next) setSelected(next);
                }}
              >
                Choose another action
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleSend}
                disabled={sending}
              >
                <RotateCw className={cn("size-3.5", sending && "animate-spin")} />
                {sending ? "Retrying…" : "Retry"}
              </Button>
            </div>
          </div>
        )}

        {intervened ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-success">
              <CheckCircle2 className="size-5" />
              <div>
                <p className="text-sm font-semibold">Intervention sent</p>
                <p className="text-xs text-muted-foreground">We'll notify you when {account.owner.name.split(" ")[0]} responds.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>Next at-risk account</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <button onClick={onSnooze} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
              <Clock className="size-3.5" /> Snooze 48h
            </button>
            <Button size="lg" onClick={handleSend} disabled={sending} className="gap-2 shadow-elevated">
              {sending ? "Sending…" : <>Send intervention <Send className="size-4" /></>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
