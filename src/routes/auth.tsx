import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Recours" },
      { name: "description", content: "Accédez à votre espace assuré pour suivre vos dossiers et échanger avec nos experts." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/espace/dossiers" });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/espace/dossiers`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Compte créé. Vous êtes connecté.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
      }
      navigate({ to: "/espace/dossiers" });
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
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            {mode === "login" ? "Bon retour" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Accédez à votre espace pour suivre vos dossiers."
              : "Quelques secondes pour démarrer la défense de vos droits."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground">Nom complet</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Marie Dupont"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
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
