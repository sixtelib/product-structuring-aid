import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/expert_/onboarding")({
  head: () => ({
    meta: [
      { title: "Bienvenue expert — Vertual" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ExpertOnboardingPage,
});

/** `user_metadata.specialite` : string[] ou string — colonne profiles.specialite (texte) en liste séparée par virgules. */
function specialitesProfileStringFromMetadata(meta: { specialite?: unknown } | undefined): string | null {
  const raw = meta?.specialite;
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const list = raw
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter(Boolean);
    return list.length ? list.join(", ") : null;
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return null;
    if (t.startsWith("[")) {
      try {
        const p = JSON.parse(t) as unknown;
        if (Array.isArray(p)) {
          const list = p
            .filter((x): x is string => typeof x === "string")
            .map((x) => x.trim())
            .filter(Boolean);
          return list.length ? list.join(", ") : null;
        }
      } catch {
        return t;
      }
    }
    return t;
  }
  return null;
}

function ExpertOnboardingPage() {
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session?.user) {
        void navigate({ to: "/login", replace: true });
        return;
      }
      setSessionEmail(session.user.email ?? null);
      setSessionReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = prenom.trim();
    const n = nom.trim();
    if (!p || !n) {
      toast.error("Prénom et nom sont obligatoires.");
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      toast.error("Session expirée. Reconnectez-vous.");
      return;
    }

    const userId = session.user.id;
    const meta = session.user.user_metadata as { specialite?: unknown } | undefined;
    const specialite = specialitesProfileStringFromMetadata(meta);

    setSubmitting(true);
    try {
      const full_name = `${p} ${n}`.trim();
      const authEmail = (session.user.email ?? "").trim() || null;
      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          prenom: p,
          nom: n,
          full_name,
          telephone: telephone.trim() || null,
          role: "expert",
          specialite,
          email: authEmail,
        })
        .eq("id", userId);
      if (upErr) throw new Error(upErr.message);

      await supabase.auth.refreshSession();

      toast.success("Profil enregistré.");
      void navigate({ to: "/expert/dossiers", replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer le profil.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FF] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
        <Logo variant="dark" className="mx-auto h-9 w-auto" />
        <p className="mt-6 text-center text-lg font-semibold text-[#111827]">
          Bienvenue sur Vertual — complétez votre profil
        </p>
        <p className="mt-2 text-center text-sm text-[#6B7280]">{sessionEmail ?? ""}</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div>
            <label className="text-xs font-semibold text-[#6B7280]">Prénom *</label>
            <input
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280]">Nom *</label>
            <input
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280]">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-[#5B50F0] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D0] disabled:opacity-60"
          >
            {submitting ? "Enregistrement…" : "Continuer vers mes dossiers"}
          </button>
        </form>
      </div>
    </div>
  );
}
