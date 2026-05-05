import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  session: Session | null;
  user: User | null;
  displayName: string;
  loading: boolean;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // Defer profile fetch to avoid recursive auth callbacks.
        setTimeout(async () => {
          const { data } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", s.user.id)
            .maybeSingle();
          setDisplayName(data?.display_name ?? s.user.email?.split("@")[0] ?? "User");
        }, 0);
      } else {
        setDisplayName("");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SessionContext.Provider
      value={{ session, user: session?.user ?? null, displayName, loading, signOut }}
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
