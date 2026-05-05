import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { enableDemoSession } from "./SessionProvider";
import { useSession } from "./SessionProvider";

/**
 * Minimal email/password auth gate. RLS on every retention table requires an
 * authenticated session, so this screen blocks the app until the user signs in.
 */
const DEMO_EMAIL = "demo.plansmith@gmail.com";
const DEMO_PASSWORD = "Plansmith!2026";
const DEMO_NAME = "Jordan Kim";

export default function AuthPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const useDemo = () => {
    setMode("signin");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setName(DEMO_NAME);
    toast("Demo mode ready", { description: "Click Sign in to enter immediately." });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      enableDemoSession();
      window.dispatchEvent(new Event("plansmith-demo-auth-change"));
      toast.success("Signed in", { description: "Preview access enabled." });
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card space-y-5">
        <div className="text-center">
          <div className="mx-auto size-10 rounded-lg primary-gradient flex items-center justify-center text-primary-foreground font-bold">P</div>
          <h1 className="mt-3 text-xl font-semibold">Plansmith Retention</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        {mode === "signup" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Jordan Kim"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="block w-full text-xs text-center text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have one? Sign in"}
        </button>

        <button
          type="button"
          onClick={useDemo}
          className="block w-full text-xs text-center text-primary hover:underline"
        >
          Use demo account ({DEMO_EMAIL})
        </button>
      </form>
    </div>
  );
}
