import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useRef } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DEMO_SESSION_KEY = "plansmith-demo-session";
const DEMO_DISPLAY_NAME = "Jordan Kim";
const DEMO_EMAIL = "demo@plansmith.local";
const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

function createDemoSession(): Session {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: "demo-access-token",
    refresh_token: "demo-refresh-token",
    expires_in: 60 * 60 * 24 * 365,
    expires_at: now + 60 * 60 * 24 * 365,
    token_type: "bearer",
    user: {
      id: DEMO_USER_ID,
      app_metadata: {},
      user_metadata: { display_name: DEMO_DISPLAY_NAME },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: DEMO_EMAIL,
    } as User,
  } as Session;
}

function readDemoEnabled() {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(DEMO_SESSION_KEY);
  if (stored === null) {
    window.localStorage.setItem(DEMO_SESSION_KEY, "true");
    return true;
  }
  return stored === "true";
}

export function enableDemoSession() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_SESSION_KEY, "true");
  }
}

export function clearDemoSession() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_SESSION_KEY, "false");
  }
}

type Ctx = {
  session: Session | null;
  user: User | null;
  displayName: string;
  loading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [demoEnabled, setDemoEnabled] = useState(readDemoEnabled);

  useEffect(() => {
    const sync = () => setDemoEnabled(readDemoEnabled());
    window.addEventListener("storage", sync);
    window.addEventListener("plansmith-demo-auth-change", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("plansmith-demo-auth-change", sync as EventListener);
    };
  }, []);

  const session = useMemo(() => (demoEnabled ? createDemoSession() : null), [demoEnabled]);
  const displayName = session?.user.user_metadata?.display_name ?? DEMO_DISPLAY_NAME;
  const loading = false;

  const signOut = async () => {
    clearDemoSession();
    window.dispatchEvent(new Event("plansmith-demo-auth-change"));
  };

  return (
    <SessionContext.Provider
      value={{ session, user: session?.user ?? null, displayName, loading, isDemo: demoEnabled, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const v = useContext(SessionContext);
  if (!v) throw new Error("useSession must be inside SessionProvider");
  return v;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace state={{ from: location }} />;
  return <>{children}</>;
}
