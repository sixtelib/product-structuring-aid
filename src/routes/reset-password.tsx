import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Vertual" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const mismatch = useMemo(() => password.length > 0 && confirm.length > 0 && password !== confirm, [password, confirm]);

  useEffect(() => {
    if (result?.kind !== "success") return;
    const t = window.setTimeout(() => {
      navigate({ to: "/login", replace: true });
    }, 2000);
    return () => window.clearTimeout(t);
  }, [result, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || password !== confirm) return;

    setSubmitting(true);
    setResult(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setResult({ kind: "success", message: "Mot de passe mis à jour. Redirection vers la connexion…" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setResult({ kind: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
        <Link to="/" className="mb-12 inline-block">
          <Logo />
        </Link>

        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choisissez un nouveau mot de passe pour votre compte.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoComplete="new-password"
              />
              {mismatch && <p className="mt-2 text-sm text-red-700">Les deux mots de passe ne correspondent pas.</p>}
            </div>

            {result && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  result.kind === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {result.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || mismatch}
              className="w-full rounded-lg bg-[#5B50F0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-95 disabled:opacity-60"
            >
              {submitting ? "Mise à jour…" : "Mettre à jour →"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">Vous pouvez fermer cet onglet après la mise à jour.</p>
      </div>
    </div>
  );
}

