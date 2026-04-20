import { Account, Action } from "@/data/atRiskAccounts";
import { RiskScoreRing } from "./RiskBadge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Quote, Sparkles, Send, Mail, MessageSquare, Clock, TrendingUp, AlertTriangle, CheckCircle2, X, ChevronRight, History } from "lucide-react";
import { useState, useEffect } from "react";

export type LogEntry = {
  actionId: string;
  actionTitle: string;
  channel: Action["channel"];
  at: number;
  by: string;
};

interface Props {
  account: Account;
  intervened: boolean;
  log: LogEntry[];
  onIntervene: (actionId: string) => void;
  onSnooze: () => void;
  onClose: () => void;
}

const channelIcon = {
  "in-app nudge": Sparkles,
  email: Mail,
  "Slack message": MessageSquare,
};

export function AccountDetail({ account, intervened, log, onIntervene, onSnooze, onClose }: Props) {
  const [selected, setSelected] = useState<Action>(account.recommended);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setSelected(account.recommended);
    setSending(false);
  }, [account.id]);

  const allActions = [account.recommended, ...account.alternates];

  const handleSend = () => {
    setSending(true);
    setTimeout(() => onIntervene(selected.id), 700);
  };

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

      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
        {/* WHY — risk reason */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-warning" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Why they're at risk</h3>
          </div>
          <div className="rounded-xl risk-gradient border border-warning/20 p-5">
            <p className="font-medium text-foreground">{account.topReason}</p>
            <ul className="mt-4 space-y-2.5">
              {account.signals.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className={cn("mt-1.5 size-1.5 rounded-full shrink-0",
                    s.weight === "high" && "bg-destructive",
                    s.weight === "med" && "bg-warning",
                    s.weight === "low" && "bg-muted-foreground"
                  )} />
                  <div>
                    <span className="font-medium text-foreground">{s.label}</span>
                    <span className="text-muted-foreground"> — {s.detail}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* QUOTE — real user voice */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Quote className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">In their words</h3>
          </div>
          <blockquote className="rounded-xl border-l-4 border-primary bg-accent/40 px-5 py-4">
            <p className="text-foreground italic leading-relaxed">"{account.quote.text}"</p>
            <footer className="mt-3 text-xs text-muted-foreground">
              — {account.quote.source} · <span className="italic">{account.quote.channel}</span>
            </footer>
          </blockquote>
        </section>

        {/* SUGGESTED ACTION */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Suggested intervention</h3>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3" /> {selected.expectedLift}
            </span>
          </div>

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
                    "w-full text-left rounded-xl border p-4 transition-all",
                    isSelected ? "border-primary bg-accent/40 ring-2 ring-primary/15" : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("size-8 shrink-0 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{a.title}</span>
                        {isRecommended && (
                          <span className="text-[10px] uppercase font-semibold tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">via {a.channel}</p>
                    </div>
                    <ChevronRight className={cn("size-4 shrink-0 mt-1 transition-transform", isSelected ? "text-primary rotate-90" : "text-muted-foreground")} />
                  </div>
                  {isSelected && (
                    <div className="mt-4 ml-11 rounded-lg bg-background border border-border p-3.5">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">Message preview</p>
                      <p className="text-sm text-foreground leading-relaxed">{a.preview}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Action bar */}
      <div className="border-t border-border bg-card px-7 py-4">
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
