import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { enableDemoSession, useSession } from "./SessionProvider";

/**
 * Demo-bypass auth gate. Field-level validation is enforced on submit so the
 * UI matches the production auth contract, but submission ultimately enables
 * the local demo session (real Supabase auth is intentionally bypassed for
 * preview to avoid email rate-limit issues).
 */
const DEMO_EMAIL = "demo.plansmith@gmail.com";
const DEMO_PASSWORD = "Plansmith!2026";
const DEMO_NAME = "Jordan Kim";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const errors = useMemo(() => {
    const e: { email?: string; password?: string } = {};
    if (email && !EMAIL_RE.test(email)) e.email = "Enter a valid email address.";
    if (password && password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  }, [email, password]);

  const useDemo = () => {
    setMode("signin");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setName(DEMO_NAME);
    setTouched({});
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

  const forgotPassword = () => {
    if (!email || !EMAIL_RE.test(email)) {
      setTouched((t) => ({ ...t, email: true }));
      toast.error("Enter your email first", {
        description: "We'll send a recovery link to that address.",
      });
      return;
    }
    // In the real flow:
    // supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: `${window.location.origin}/reset-password`,
    // });
    toast.success("Recovery link sent", {
      description: `If ${email} exists, a reset link is on its way.`,
    });
  };

  const inputClass = (hasError?: boolean) =>
    `w-full text-sm px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 ${
      hasError
        ? "border-destructive focus:ring-destructive/20"
        : "border-border focus:ring-primary/20"
    }`;

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
              className={inputClass(false)}
              placeholder="Jordan Kim"
            />
            <p className="text-[11px] text-muted-foreground">
              Saved to your profile so teammates can recognise you.
            </p>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className={inputClass(touched.email && !!errors.email)}
            placeholder="you@company.com"
          />
          {touched.email && errors.email && (
            <p className="text-[11px] text-destructive">{errors.email}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Password</label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={forgotPassword}
                className="text-[11px] text-primary hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            className={inputClass(touched.password && !!errors.password)}
            placeholder="At least 6 characters"
          />
          {touched.password && errors.password && (
            <p className="text-[11px] text-destructive">{errors.password}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>

        <button
          type="button"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setTouched({}); }}
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
