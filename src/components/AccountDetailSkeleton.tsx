import { Skeleton } from "@/components/ui/skeleton";

/**
 * Matches the real AccountDetail layout 1:1 (header ring, why block,
 * quote, 3 action cards, action bar) so the panel doesn't reflow on load.
 */
export function AccountDetailSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background" aria-busy="true" aria-label="Loading account details">
      {/* Header */}
      <div className="px-7 pt-6 pb-5 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <Skeleton className="h-3.5 w-64" />
            </div>
          </div>
          <Skeleton className="size-6 rounded-md" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-7 py-6 space-y-6">
        {/* WHY block */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="rounded-xl border border-warning/20 risk-gradient p-5 space-y-4">
            <Skeleton className="h-4 w-3/4 bg-foreground/10" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-1.5 mt-1.5 rounded-full bg-foreground/15" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-2/3 bg-foreground/10" />
                    <Skeleton className="h-3 w-1/2 bg-foreground/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="rounded-xl border-l-4 border-primary/40 bg-accent/40 px-5 py-4 space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
        </section>

        {/* SUGGESTED ACTIONS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="size-4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Action bar */}
      <div className="border-t border-border bg-card px-7 py-4 flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-11 w-44 rounded-md" />
      </div>
    </div>
  );
}
