import { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { useRetention } from "@/state/RetentionContext";
import { ShieldAlert, Clock, History as HistoryIcon, Inbox, LayoutGrid, Users, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const { accounts, intervened, snoozed, hideAll } = useRetention();
  const needsActionCount = hideAll
    ? 0
    : accounts.filter((a) => !intervened.has(a.id) && !snoozed.has(a.id)).length;
  const snoozedCount = hideAll ? 0 : snoozed.size;
  const intervenedCount = intervened.size;

  const navBase =
    "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer";
  const navActive = "bg-sidebar-accent text-sidebar-accent-foreground";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-56 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="size-8 rounded-lg primary-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-sidebar-primary-foreground">Plansmith</span>
        </div>
        <nav className="px-3 space-y-0.5 text-sm">
          <a className={navBase}>
            <span className="flex items-center gap-3"><LayoutGrid className="size-4" /> Projects</span>
          </a>
          <a className={navBase}>
            <span className="flex items-center gap-3"><Inbox className="size-4" /> Inbox</span>
          </a>
          <a className={navBase}>
            <span className="flex items-center gap-3"><Users className="size-4" /> Customers</span>
          </a>

          <div className="pt-4 pb-1.5 px-3 text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-semibold">
            Retention
          </div>
          <NavLink to="/" end className={navBase} activeClassName={navActive}>
            <span className="flex items-center gap-3"><ShieldAlert className="size-4" /> At-risk queue</span>
            {needsActionCount > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                {needsActionCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/snoozed" className={navBase} activeClassName={navActive}>
            <span className="flex items-center gap-3"><Clock className="size-4" /> Snoozed</span>
            {snoozedCount > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted-foreground/30 text-sidebar-primary-foreground">
                {snoozedCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/history" className={navBase} activeClassName={navActive}>
            <span className="flex items-center gap-3"><HistoryIcon className="size-4" /> Intervention history</span>
            {intervenedCount > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-success text-success-foreground">
                {intervenedCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/empty-preview" className={navBase} activeClassName={navActive}>
            <span className="flex items-center gap-3"><CheckCircle2 className="size-4" /> All-clear preview</span>
          </NavLink>
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

      <main className={cn("flex-1 flex min-w-0")}>{children}</main>
    </div>
  );
}
