import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Public route used by the password recovery email.
 * Detects `type=recovery` in the URL hash; in the production flow this calls
 * supabase.auth.updateUser({ password }). In demo mode it just acknowledges
 * the action and routes back to /auth.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash || "";
    setIsRecovery(hash.includes("type=recovery"));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Real flow:
      // const { error } = await supabase.auth.updateUser({ password });
      // if (error) throw error;
      toast.success("Password updated", { description: "You can now sign in." });
      navigate("/auth", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Reset your password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRecovery
              ? "Enter a new password for your account."
              : "Open this page from the recovery email link."}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="At least 6 characters"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "…" : "Update password"}
        </Button>

        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="block w-full text-xs text-center text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </button>
      </form>
    </div>
  );
}
