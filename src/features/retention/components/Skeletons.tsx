import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton row matching AccountRow layout for the at-risk queue. */
export function AccountRowSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 flex items-start gap-3">
      <Skeleton className="size-10 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

/** Skeleton row matching the table rows on Snoozed / History pages. */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div
      className="grid gap-4 px-5 py-4 border-b border-border last:border-b-0 items-center"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 min-w-0">
          {i === 0 && <Skeleton className="size-9 rounded-lg shrink-0" />}
          <Skeleton className="h-3.5 w-full max-w-[140px]" />
        </div>
      ))}
    </div>
  );
}
