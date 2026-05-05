import { AlertOctagon, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

/** Full-screen error card used when the workspace fails to load. */
export function WorkspaceErrorCard({ title = "Couldn't reach the database", message, onRetry, retrying }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-8 shadow-card text-center">
        <div className="mx-auto size-12 rounded-full bg-danger-soft flex items-center justify-center">
          <AlertOctagon className="size-6 text-destructive" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} disabled={retrying} className="mt-6 gap-2">
            <RotateCw className={retrying ? "size-4 animate-spin" : "size-4"} />
            {retrying ? "Retrying…" : "Retry"}
          </Button>
        )}
      </div>
    </div>
  );
}
