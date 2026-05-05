import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Quote, Sparkles, Send, Clock, TrendingUp, AlertTriangle, CheckCircle2, X, ChevronRight, History, AlertOctagon, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RiskScoreRing } from "./RiskBadge";
import { channelIcon } from "../utils/channels";
import { formatRelative } from "../utils/time";
import type { Account, Action, AccountNote, LogEntry, RiskEvent } from "../data/types";

interface Props {
  account: Account;
  intervened: boolean;
  log: LogEntry[];
  notes: AccountNote[];
  riskEvent: RiskEvent | null;
  currentUserName: string;
  /** Should resolve on success and reject on delivery failure. */
  onIntervene: (actionId: string) => Promise<void> | void;
  onSnooze: () => void;
  onClose: () => void;
  snoozeHours: number;
}

/**
 * Account Detail Panel — primary workspace surface.
 * Three visual tiers: Hero (suggested intervention), Context (why + quote),
 * Supporting (activity & ownership timeline).
 */
export function AccountDetailPanel({ account, intervened, log, notes, riskEvent, currentUserName, onIntervene, onSnooze, onClose, snoozeHours }: Props) {
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
    } catch (e) {
      setSending(false);
      setError({
        message: e instanceof Error ? e.message : "Unknown delivery error",
        failedActionId: selected.id,
      });
    }
  };

  // Clear the error when the user picks a different action.
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
        {/* HERO: Suggested intervention */}
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

        {/* CONTEXT: Why + Quote */}
        <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
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

        {/* SUPPORTING: Activity & ownership */}
        <section>
          <div className="flex items-center justify-between mb-2.5 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 mt-3">
              <History className="size-3.5 text-muted-foreground" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Activity & ownership</h3>
            </div>
            <div className="flex items-center gap-2 text-xs mt-3">
              <span className="text-muted-foreground">Owner</span>
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5">
                <div className="size-4 rounded-full primary-gradient text-primary-foreground text-[9px] font-semibold flex items-center justify-center">
                  {(currentUserName || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <span className="font-medium">{currentUserName || "You"}</span>
                <span className="text-muted-foreground">· you</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <ol className="relative">
              {log.map((entry, i) => {
                const Icon = channelIcon[entry.channel];
                const isYou = entry.by === currentUserName;
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
                      <p className="text-xs text-muted-foreground mt-1 capitalize">via {entry.channel} · {entry.status.toLowerCase()}</p>
                    </div>
                  </li>
                );
              })}

              {riskEvent && (
                <li className="flex gap-3 px-4 py-3.5 border-b border-border">
                  <div className="size-8 shrink-0 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center">
                    AI
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">Risk model</span>
                      <span className="text-muted-foreground"> flagged this account · {formatRelative(riskEvent.occurredAt)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Score crossed threshold ({riskEvent.newScore}).</p>
                  </div>
                </li>
              )}

              {notes.map((n) => (
                <li key={n.id} className="flex gap-3 px-4 py-3.5 border-b border-border last:border-b-0">
                  <div className="size-8 shrink-0 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center">
                    {n.authorName.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{n.authorName}</span>
                      <span className="text-muted-foreground"> added a note · {formatRelative(n.createdAt)}</span>
                    </p>
                    <p className="text-xs text-foreground mt-0.5 italic">"{n.body}"</p>
                  </div>
                </li>
              ))}
            </ol>

            {log.length > 0 && (
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border bg-muted/40 text-xs">
                <span className="text-muted-foreground">Next: follow up if no response in {snoozeHours}h</span>
                <button className="font-medium text-primary hover:underline">Schedule follow-up</button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Action bar */}
      <div className="border-t border-border bg-card px-7 py-4 space-y-3">
        {error && !intervened && (() => {
          const isAuthError =
            /401|jwt|session|rls|unauthor|expired/i.test(error.message);
          if (isAuthError) {
            return (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-danger-soft px-4 py-3"
              >
                <div className="size-8 shrink-0 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertOctagon className="size-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-destructive">
                    Your session expired. Please sign in again.
                  </p>
                  <p className="text-xs text-destructive/80 mt-0.5 truncate">{error.message}</p>
                </div>
                <Link to="/auth">
                  <Button size="sm" className="h-8 text-xs">Sign in</Button>
                </Link>
              </div>
            );
          }
          return (
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
          );
        })()}

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
              <Clock className="size-3.5" /> Snooze {snoozeHours}h
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
