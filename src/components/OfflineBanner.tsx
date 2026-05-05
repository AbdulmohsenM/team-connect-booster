import { useEffect, useState } from "react";
import { WifiOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global offline banner. Sits on top of the app whenever the browser reports
 * navigator.onLine === false. Stays visible until the connection is restored
 * or the user retries successfully.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const retry = async () => {
    setChecking(true);
    try {
      // Lightweight reachability probe — favicon avoids CORS issues and is
      // typically cached/cheap to request.
      await fetch(`${window.location.origin}/favicon.ico?_=${Date.now()}`, {
        cache: "no-store",
      });
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setChecking(false);
    }
  };

  if (online) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-3 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-destructive/30 bg-card px-4 py-2 shadow-elevated">
        <div className="size-7 rounded-full bg-danger-soft flex items-center justify-center">
          <WifiOff className="size-3.5 text-destructive" />
        </div>
        <div className="text-xs">
          <p className="font-semibold text-destructive leading-tight">You're offline</p>
          <p className="text-muted-foreground leading-tight">
            We'll reconnect automatically when your internet is back.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={retry}
          disabled={checking}
          className="h-7 text-xs gap-1.5"
        >
          <RotateCw className={checking ? "size-3 animate-spin" : "size-3"} />
          {checking ? "Checking…" : "Retry"}
        </Button>
      </div>
    </div>
  );
}
