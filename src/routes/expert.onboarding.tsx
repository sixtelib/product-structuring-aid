import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/expert/onboarding")({
  head: () => ({
    meta: [
      { title: "Bienvenue expert — Vertual" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ExpertOnboardingPage,
});

function ExpertOnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) void navigate({ to: "/login", replace: true });
  }, [authLoading, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const p = prenom.trim();
    const n = nom.trim();
    if (!p || !n) {
      toast.error("Prénom et nom sont obligatoires.");
      return;
    }

    const meta = user.user_metadata as { specialite?: string } | undefined;
    const specialite = typeof meta?.specialite === "string" ? meta.specialite.trim() : "";

    setSubmitting(true);
    try {
      const full_name = `${p} ${n}`.trim();
      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          prenom: p,
          nom: n,
          full_name,
          telephone: telephone.trim() || null,
          role: "expert",
          specialite: specialite || null,
        })
        .eq("id", user.id);
      if (upErr) throw new Error(upErr.message);

      toast.success("Profil enregistré.");
      void navigate({ to: "/expert/dossiers", replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer le profil.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FF] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
        <img src="/logo-vertual.png" alt="Vertual" className="mx-auto h-9 w-auto" />
        <p className="mt-6 text-center text-lg font-semibold text-[#111827]">
          Bienvenue sur Vertual — complétez votre profil
        </p>
        <p className="mt-2 text-center text-sm text-[#6B7280]">{user.email}</p>

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
