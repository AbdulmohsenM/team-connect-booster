import { useMemo, useState } from "react";
import { useRetention } from "@/state/RetentionContext";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Sparkles, Search, Download, ChevronDown, Clock, CheckCircle2, AlertCircle, Filter as FilterIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const channelIcon = {
  "in-app nudge": Sparkles,
  email: Mail,
  "Slack message": MessageSquare,
};

const statusStyle = {
  "Awaiting response": { label: "Awaiting", cls: "bg-warning-soft text-warning border-warning/20", Icon: Clock },
  "Responded": { label: "Responded", cls: "bg-accent text-accent-foreground border-primary/20", Icon: AlertCircle },
  "Re-engaged": { label: "Re-engaged", cls: "bg-success-soft text-success border-success/20", Icon: CheckCircle2 },
} as const;

function formatTimestamp(ts: number) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type StatusFilter = "all" | "Awaiting response" | "Responded" | "Re-engaged";
type ChannelFilter = "all" | "in-app nudge" | "email" | "Slack message";

export default function History() {
  const { logs } = useRetention();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (channel !== "all" && l.channel !== channel) return false;
      if (query && !`${l.accountTeam} ${l.ownerName} ${l.actionTitle}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [logs, status, channel, query]);

  const counts = {
    all: logs.length,
    awaiting: logs.filter((l) => l.status === "Awaiting response").length,
    responded: logs.filter((l) => l.status === "Responded").length,
    reengaged: logs.filter((l) => l.status === "Re-engaged").length,
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-muted/30">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Retention</p>
            <h1 className="text-2xl font-semibold mt-0.5">Intervention history</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every PM action sent from the at-risk queue, with response status and 48h follow-up tracking.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="size-3.5" /> Export CSV
            </Button>
            <Link to="/"><Button size="sm">Back to queue</Button></Link>
          </div>
        </div>

        {/* Status segmented filters */}
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          {([
            { id: "all", label: "All", count: counts.all },
            { id: "Awaiting response", label: "Awaiting", count: counts.awaiting },
            { id: "Responded", label: "Responded", count: counts.responded },
            { id: "Re-engaged", label: "Re-engaged", count: counts.reengaged },
          ] as { id: StatusFilter; label: string; count: number }[]).map((s) => {
            const isActive = status === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                {s.label}
                <span className={cn(
                  "tabular-nums px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {s.count}
                </span>
              </button>
            );
          })}

          <div className="h-5 w-px bg-border mx-1" />

          {/* Channel select-like dropdown (simple) */}
          <div className="relative">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelFilter)}
              className="appearance-none pl-7 pr-7 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All channels</option>
              <option value="in-app nudge">In-app nudge</option>
              <option value="email">Email</option>
              <option value="Slack message">Slack</option>
            </select>
            <FilterIcon className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <ChevronDown className="size-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <div className="ml-auto relative w-64">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search account, owner, action…"
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Activity log */}
        <div className="mt-5 rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_1.6fr_140px_140px_120px] gap-4 px-5 py-3 border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <span>Account</span>
            <span>Action</span>
            <span>Channel</span>
            <span>Status</span>
            <span className="text-right">When</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Sparkles className="size-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">No interventions match these filters</p>
              <p className="text-xs text-muted-foreground mt-1">
                {logs.length === 0
                  ? "Send an intervention from the at-risk queue to start tracking outcomes."
                  : "Try clearing a filter or widening the channel."}
              </p>
              {logs.length === 0 && (
                <Link to="/" className="inline-block mt-4">
                  <Button size="sm" variant="outline">Open at-risk queue</Button>
                </Link>
              )}
            </div>
          ) : (
            filtered.map((entry) => {
              const Icon = channelIcon[entry.channel];
              const s = statusStyle[entry.status];
              const SIcon = s.Icon;
              return (
                <div
                  key={entry.id}
                  className="grid grid-cols-[1fr_1.6fr_140px_140px_120px] gap-4 px-5 py-4 border-b border-border last:border-b-0 items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 shrink-0 rounded-lg primary-gradient flex items-center justify-center text-primary-foreground text-[10px] font-semibold">
                      {entry.ownerName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{entry.accountTeam}</p>
                      <p className="text-xs text-muted-foreground truncate">{entry.ownerName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90 line-clamp-2">{entry.actionTitle}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                    <Icon className="size-3.5 text-primary" /> {entry.channel}
                  </div>
                  <div>
                    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border", s.cls)}>
                      <SIcon className="size-3" /> {s.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground tabular-nums">{formatTimestamp(entry.at)}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">by {entry.by.split(" ")[0]}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
