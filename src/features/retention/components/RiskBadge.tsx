import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  score: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function bucket(score: number) {
  if (score >= 80) return { label: "Critical", bg: "bg-danger", text: "text-destructive-foreground", soft: "bg-danger-soft text-destructive" };
  if (score >= 60) return { label: "High", bg: "bg-warning", text: "text-warning-foreground", soft: "bg-warning-soft text-warning-foreground" };
  if (score >= 40) return { label: "Medium", bg: "bg-warning/70", text: "text-warning-foreground", soft: "bg-warning-soft/60 text-warning-foreground" };
  return { label: "Low", bg: "bg-success", text: "text-success-foreground", soft: "bg-success-soft text-success" };
}

export function RiskBadge({ score, className, size = "md" }: RiskBadgeProps) {
  const b = bucket(score);
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full font-medium", b.soft,
      size === "sm" && "px-2 py-0.5 text-xs",
      size === "md" && "px-2.5 py-1 text-xs",
      size === "lg" && "px-3 py-1.5 text-sm",
      className)}>
      <span className={cn("size-1.5 rounded-full", b.bg)} />
      {b.label} · {score}
    </div>
  );
}

export function RiskScoreRing({ score }: { score: number }) {
  const b = bucket(score);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r="28" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
        <circle
          cx="36" cy="36" r="28" strokeWidth="6" fill="none" strokeLinecap="round"
          stroke={score >= 80 ? "hsl(var(--danger))" : score >= 60 ? "hsl(var(--warning))" : "hsl(var(--success))"}
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold leading-none">{score}</span>
        <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{b.label}</span>
      </div>
    </div>
  );
}
