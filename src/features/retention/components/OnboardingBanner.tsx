import { useEffect, useState } from "react";
import { Sparkles, X, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "plansmith-onboarding-dismissed";

/** First-run guidance banner shown above the at-risk queue. */
export function OnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVisible(window.localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 relative">
      <button
        onClick={dismiss}
        aria-label="Dismiss onboarding"
        className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/60"
      >
        <X className="size-3.5" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="size-8 shrink-0 rounded-lg bg-primary/15 flex items-center justify-center">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Welcome to your at-risk queue</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            This page surfaces accounts most likely to churn, sorted by risk. Review the top
            account, then send a one-click intervention to re-engage the team.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={dismiss} className="h-7 text-xs">
              <ArrowDown className="size-3.5 mr-1" />
              Select an account to send your first intervention
            </Button>
            <button
              onClick={dismiss}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
