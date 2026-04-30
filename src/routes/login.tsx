import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";
import {
  migrateLegacyQualificationLocalStorage,
  QUALIFICATION_STORAGE_KEYS,
} from "@/lib/qualificationLocalStorage";

const oauthRedirect = () => {
  if (typeof window === "undefined") return "";
  migrateLegacyQualificationLocalStorage();
  return `${window.location.origin}/onboarding`;
};

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion ,  Vertual" },
      { name: "description", content: "Connectez-vous à votre espace client." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isExpert, loading } = useAuth();
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetResult, setResetResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    migrateLegacyQualificationLocalStorage();
    if (loading || !user) return;
    if (isAdmin) {
      navigate({ to: "/admin", replace: true });
      return;
    }
    if (isExpert) {
      navigate({ to: "/expert", replace: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      const { data } = await supabase.from("profiles").select("mandat_signe").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      const meta = user.user_metadata as { mandat_signe?: boolean } | undefined;
      const signed = data?.mandat_signe === true || meta?.mandat_signe === true;
      if (!signed) {
        navigate({ to: "/onboarding", replace: true });
        return;
      }
      const hasEvaluation =
        typeof window !== "undefined" && !!window.localStorage.getItem(QUALIFICATION_STORAGE_KEYS.evaluation);
      navigate({ to: hasEvaluation ? "/dashboard/nouveau" : "/dashboard", replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, isAdmin, isExpert, user, navigate]);

  async function signInWithOAuth(provider: "google" | "apple") {
    setBusy(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: oauthRedirect(),
        },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast.success("Bienvenue !");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      const friendly =
        msg.includes("Invalid login") ? "Email ou mot de passe incorrect."
        : msg.includes("Email not confirmed") ? "Email non confirmé. Vérifiez votre boîte mail."
        : msg;
      toast.error(friendly);
    } finally {
      setSubmitting(false);
    }
  }

  async function sendResetEmail(e: React.FormEvent) {
    e.preventDefault();
    const value = resetEmail.trim();
    if (!value) return;

    setResetSubmitting(true);
    setResetResult(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: "https://vertual.fr/reset-password",
      });
      if (error) throw error;
      setResetResult({ kind: "success", message: "Email envoyé ! Vérifiez votre boîte mail." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setResetResult({ kind: "error", message: msg });
    } finally {
      setResetSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
        <Link to="/" className="mb-12 inline-block">
          <Logo />
        </Link>

        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Espace client</h1>
          <p className="mt-2 text-sm text-muted-foreground">Connectez-vous en un clic ou avec votre email.</p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              disabled={!!busy || loading}
              onClick={() => void signInWithOAuth("google")}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-secondary disabled:opacity-60"
            >
              <GoogleGlyph />
              {busy === "google" ? "Redirection…" : "Continuer avec Google"}
            </button>

            <button
              type="button"
              disabled={!!busy || loading}
              onClick={() => void signInWithOAuth("apple")}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
            >
              <AppleGlyph className="text-primary-foreground" />
              {busy === "apple" ? "Redirection…" : "Continuer avec Apple"}
            </button>
          </div>

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {mode === "login" ? (
            <form onSubmit={signInWithEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="vous@exemple.fr"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoComplete="current-password"
                />
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email.trim());
                      setResetResult(null);
                      setMode("reset");
                    }}
                    className="cursor-pointer text-sm font-medium text-[#5B50F0] hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loading || !!busy}
                className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
              >
                {submitting ? "Connexion…" : "Se connecter"}
              </button>

              <div className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link to="/auth" search={{ mode: "signup" }} className="font-medium text-primary hover:underline">
                  Créer un compte
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={sendResetEmail} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Réinitialiser votre mot de passe</h2>
                <p className="mt-1 text-sm text-muted-foreground">Entrez votre email, nous vous enverrons un lien.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="vous@exemple.fr"
                  autoComplete="email"
                />
              </div>

              {resetResult && (
                <div
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    resetResult.kind === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  {resetResult.message}
                </div>
              )}

              <button
                type="submit"
                disabled={resetSubmitting || loading || !!busy}
                className="w-full rounded-lg bg-[#5B50F0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-95 disabled:opacity-60"
              >
                {resetSubmitting ? "Envoi…" : "Envoyer le lien →"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetResult(null);
                  setMode("login");
                }}
                className="w-full text-center text-sm font-medium text-muted-foreground hover:underline"
              >
                Retour à la connexion
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          En continuant, vous acceptez nos conditions d'utilisation.
        </p>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className ?? ""}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
