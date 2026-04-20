import { Account } from "@/data/atRiskAccounts";
import { RiskBadge } from "./RiskBadge";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus, CheckCircle2 } from "lucide-react";

interface Props {
  account: Account;
  active: boolean;
  intervened: boolean;
  onClick: () => void;
}

export function AccountRow({ account, active, intervened, onClick }: Props) {
  const TrendIcon = account.trend === "up" ? ArrowUpRight : account.trend === "down" ? ArrowDownRight : Minus;
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-xl border bg-card px-4 py-3.5 transition-all",
        "hover:border-primary/40 hover:shadow-card",
        active ? "border-primary ring-2 ring-primary/15 shadow-card" : "border-border",
        intervened && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-9 shrink-0 rounded-lg primary-gradient flex items-center justify-center text-primary-foreground text-xs font-semibold">
            {account.owner.avatar}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{account.team}</h3>
              {intervened && <CheckCircle2 className="size-3.5 text-success shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {account.owner.name} · {account.plan} · {account.seats} seats · ${account.mrr}/mo
            </p>
            <p className="text-xs text-foreground/80 mt-2 line-clamp-1">
              <span className="text-muted-foreground">Why:</span> {account.topReason}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <RiskBadge score={account.riskScore} size="sm" />
          <div className={cn("flex items-center gap-0.5 text-[10px] font-medium",
            account.trend === "up" && "text-destructive",
            account.trend === "down" && "text-success",
            account.trend === "flat" && "text-muted-foreground"
          )}>
            <TrendIcon className="size-3" />
            <span>{account.trend === "up" ? "rising" : account.trend === "down" ? "falling" : "stable"}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
