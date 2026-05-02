import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { expertMisfitRedirectPath } from "@/lib/expertRoleRouting";
import { Logo } from "@/components/site/Logo";
import {
  migrateLegacyQualificationLocalStorage,
  QUALIFICATION_STORAGE_KEYS,
} from "@/lib/qualificationLocalStorage";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => {
    return { mode: search.mode === "signup" ? "signup" : "login" } as const;
  },
  head: () => ({
    meta: [
      { title: "Connexion ,  Vertual" },
      { name: "description", content: "Accédez à votre espace assuré pour suivre vos dossiers et échanger avec nos experts." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isExpert, loading } = useAuth();
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [phone, setPhone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const expertPath = await expertMisfitRedirectPath(supabase, user, false);
      if (cancelled) return;
      if (expertPath) {
        navigate({ to: expertPath, replace: true });
        return;
      }
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
      migrateLegacyQualificationLocalStorage();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      migrateLegacyQualificationLocalStorage();
      if (mode === "signup") {
        const p = prenom.trim();
        const n = nom.trim();
        if (!p || !n) {
          toast.error("Prénom et nom sont obligatoires.");
          return;
        }
        const full_name_computed = `${p} ${n}`.trim();
        const phoneVal = phone.trim() || null;
        const adresseVal = adresse.trim() || null;

        const { data: signData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/espace/dossiers`,
            data: {
              role: "assure",
              full_name: full_name_computed,
              prenom: p,
              nom: n,
              phone: phoneVal ?? undefined,
              adresse: adresseVal ?? undefined,
            },
          },
        });
        if (error) throw error;

        const uid = signData.user?.id;
        if (uid && signData.session) {
          const authEmail = (signData.user.email ?? email).trim() || null;
          const { error: profileErr } = await supabase
            .from("profiles")
            .update({
              role: "assure",
              prenom: p,
              nom: n,
              full_name: full_name_computed,
              phone: phoneVal,
              adresse: adresseVal,
              email: authEmail,
            })
            .eq("id", uid);
          if (profileErr) throw profileErr;
        }

        toast.success("Compte créé. Vous êtes connecté.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
      }
      if (isAdmin) {
        navigate({ to: "/admin", replace: true });
      } else if (isExpert) {
        navigate({ to: "/expert", replace: true });
      } else if (mode === "signup") {
        navigate({ to: "/onboarding", replace: true });
      } else {
        const hasEvaluation =
          typeof window !== "undefined" && !!window.localStorage.getItem(QUALIFICATION_STORAGE_KEYS.evaluation);
        navigate({ to: hasEvaluation ? "/dashboard/nouveau" : "/dashboard", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      const friendly =
        msg.includes("Invalid login") ? "Email ou mot de passe incorrect."
        : msg.includes("already registered") ? "Cet email est déjà utilisé."
        : msg.includes("Password should") ? "Le mot de passe doit faire au moins 6 caractères."
        : msg;
      toast.error(friendly);
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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {mode === "login" ? "Bon retour" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Accédez à votre espace pour suivre vos dossiers."
              : "Quelques secondes pour démarrer la défense de vos droits."}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              disabled={!!busy || loading || submitting}
              onClick={() => void signInWithOAuth("google")}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-secondary disabled:opacity-60"
            >
              <GoogleGlyph />
              {busy === "google" ? "Redirection…" : "Continuer avec Google"}
            </button>

            <button
              type="button"
              disabled={!!busy || loading || submitting}
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

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground">Prénom</label>
                    <input
                      type="text"
                      required
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      autoComplete="given-name"
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Marie"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Nom</label>
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      autoComplete="family-name"
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Dupont"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="06 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Adresse</label>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    autoComplete="street-address"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Numéro et rue, code postal, ville…"
                  />
                </div>
              </>
            )}

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
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              {mode === "signup" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum 6 caractères. Évitez les mots de passe compromis.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
            >
              {submitting ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Pas encore de compte ?{" "}
                <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">
                  S'inscrire
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button onClick={() => setMode("login")} className="font-medium text-primary hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </div>
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
