import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { CheckCircle2, ArrowRight, Clock, History as HistoryIcon, Bell, Calendar, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRetention } from "../state/RetentionContext";
import { useInterventionProgress } from "../hooks/useAccountQueue";
import { channelIcon } from "../utils/channels";
import { formatRelative } from "../utils/time";

/** Intervention Confirmation page — receipt + next-account CTA. */
export default function InterventionConfirmationPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { logs, accounts, intervened, snoozed, followUps } = useRetention();
  const { total, sent: intervenedCount, pct } = useInterventionProgress();

  const entry = useMemo(() => logs.find((l) => l.id === entryId), [logs, entryId]);
  const account = useMemo(() => (entry ? accounts.find((a) => a.id === entry.accountId) : null), [entry, accounts]);

  const nextAccount = useMemo(() => {
    return accounts
      .filter((a) => !intervened.has(a.id) && !snoozed.has(a.id))
      .sort((a, b) => b.riskScore - a.riskScore)[0];
  }, [accounts, intervened, snoozed]);

  useEffect(() => {
    if (!entry) {
      const t = setTimeout(() => navigate("/"), 50);
      return () => clearTimeout(t);
    }
  }, [entry, navigate]);

  if (!entry || !account) return null;

  const Icon = channelIcon[entry.channel];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-muted/30">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="size-4" /> Back to queue
        </Link>

        <div className="rounded-2xl bg-card border border-border shadow-elevated p-8">
          <div className="flex items-start gap-5">
            <div className="size-14 rounded-full bg-success-soft flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-7 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-success">Intervention sent</p>
              <h1 className="text-2xl font-semibold mt-1">{entry.actionTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Delivered to <span className="font-medium text-foreground">{account.owner.name}</span> at{" "}
                <span className="font-medium text-foreground">{account.team}</span> via{" "}
                <span className="capitalize">{entry.channel}</span>.
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
            <div className="bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Channel</p>
              <p className="text-sm font-medium mt-1.5 flex items-center gap-1.5 capitalize">
                <Icon className="size-3.5 text-primary" /> {entry.channel}
              </p>
            </div>
            <div className="bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sent by</p>
              <p className="text-sm font-medium mt-1.5">{entry.by}</p>
            </div>
            <div className="bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Time</p>
              <p className="text-sm font-medium mt-1.5">just now</p>
            </div>
          </div>

          <div className="mt-7">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">What happens next</h3>
            <ol className="space-y-3">
              <li className="flex gap-3 items-start">
                <div className="size-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div className="text-sm">
                  <p className="font-medium">Delivery confirmed</p>
                  <p className="text-muted-foreground">{account.owner.name.split(" ")[0]} will receive the message in the next few minutes.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="size-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div className="text-sm">
                  <p className="font-medium flex items-center gap-2">
                    <Bell className="size-3.5 text-primary" /> You'll be notified when they respond
                  </p>
                  <p className="text-muted-foreground">Tracked in <Link to="/history" className="text-primary hover:underline">Intervention history</Link>.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="size-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div className="text-sm">
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="size-3.5 text-primary" /> Auto follow-up scheduled in 48h
                  </p>
                  <p className="text-muted-foreground">If no response, we'll resurface this account for a manual nudge.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-7 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold">Q2 goal · interventions sent</span>
              <span className="text-muted-foreground tabular-nums">{intervenedCount} / {total} ({pct}%)</span>
            </div>
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <div className="h-full primary-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {intervenedCount === 1
                ? "Nice — first one in. Keep momentum: the queue prioritizes by risk score."
                : `Up ${intervenedCount} this session. Goal is 50% of at-risk accounts touched within 48h.`}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/history">
              <Button variant="outline" size="sm" className="gap-1.5">
                <HistoryIcon className="size-3.5" /> View history
              </Button>
            </Link>
            <Link to="/snoozed">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" /> Snoozed ({snoozed.size})
              </Button>
            </Link>
          </div>

          {nextAccount ? (
            <Button size="lg" onClick={() => navigate("/")} className="gap-2 shadow-elevated">
              Next at-risk: {nextAccount.team} <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate("/all-clear")} className="gap-2 shadow-elevated">
              Queue is clear <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
