import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { getImpersonatedExpertId } from "@/lib/expertImpersonation";

export const Route = createFileRoute("/expert/profil")({
  component: ExpertProfilPage,
});

type ProfileForm = {
  prenom: string;
  nom: string;
  telephone: string;
  specialite: string;
  email_contact: string;
};

function ExpertProfilPage() {
  const { user, isAdmin, isExpert, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    prenom: "",
    nom: "",
    telephone: "",
    specialite: "",
    email_contact: "",
  });

  const profileId = isAdmin ? getImpersonatedExpertId() : user?.id ?? null;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    if (isAdmin && !getImpersonatedExpertId()) {
      void navigate({ to: "/admin", replace: true });
      return;
    }
    if (!isAdmin && !isExpert) {
      void navigate({ to: "/dashboard", replace: true });
      return;
    }
    if (!profileId) {
      void navigate({ to: "/admin", replace: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("prenom, nom, telephone, phone, specialite, email_contact")
        .eq("id", profileId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      const row = data as {
        prenom?: string | null;
        nom?: string | null;
        telephone?: string | null;
        phone?: string | null;
        specialite?: string | null;
        email_contact?: string | null;
      } | null;
      if (row) {
        setForm({
          prenom: row.prenom ?? "",
          nom: row.nom ?? "",
          telephone: (row.telephone ?? row.phone ?? "") ?? "",
          specialite: row.specialite ?? "",
          email_contact: row.email_contact ?? "",
        });
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, isAdmin, isExpert, navigate, profileId]);

  async function save() {
    if (!profileId) return;
    setSaving(true);
    try {
      const nom = form.nom.trim();
      const prenom = form.prenom.trim();
      const { error } = await supabase
        .from("profiles")
        .update({
          nom: nom || null,
          prenom: prenom || null,
          telephone: form.telephone.trim() || null,
          specialite: form.specialite.trim() || null,
          email_contact: form.email_contact.trim() || null,
        })
        .eq("id", profileId);
      if (error) throw error;

      const { error: dErr } = await supabase
        .from("dossiers")
        .update({ nom_expert: nom || null, prenom_expert: prenom || null })
        .eq("expert_id", profileId);
      if (dErr) console.error(dErr);

      toast.success("Profil enregistré.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur à l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold text-[#111827]">Profil</h1>
      <p className="mt-1 text-sm text-[#6B7280]">Informations visibles côté dossiers.</p>

      <div className="mt-8 space-y-4 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Prénom</label>
          <input
            value={form.prenom}
            onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Nom</label>
          <input
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Téléphone</label>
          <input
            value={form.telephone}
            onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Spécialité</label>
          <input
            value={form.specialite}
            onChange={(e) => setForm((f) => ({ ...f, specialite: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Email contact</label>
          <input
            type="email"
            value={form.email_contact}
            onChange={(e) => setForm((f) => ({ ...f, email_contact: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="mt-4 w-full rounded-lg bg-[#5B50F0] py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
