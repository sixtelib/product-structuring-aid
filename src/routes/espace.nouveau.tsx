import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CLAIM_TYPES } from "@/lib/claim-types";

export const Route = createFileRoute("/espace/nouveau")({
  component: EspaceNouveauRedirect,
});

function EspaceNouveauRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);
  return null;
}

function NouveauDossierPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    claim_type: "degat_des_eaux",
    description: "",
    insurer_name: "",
    policy_number: "",
    incident_date: "",
    estimated_amount: "",
    insurer_offer: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("cases")
        .insert({
          owner_id: user.id,
          title: form.title,
          claim_type: form.claim_type as never,
          description: form.description || null,
          insurer_name: form.insurer_name || null,
          policy_number: form.policy_number || null,
          incident_date: form.incident_date || null,
          estimated_amount: form.estimated_amount ? Number(form.estimated_amount) : null,
          insurer_offer: form.insurer_offer ? Number(form.insurer_offer) : null,
          status: "qualification",
        })
        .select("id")
        .single();
      if (error) throw error;

      // Event de création (visible client)
      await supabase.from("case_events").insert({
        case_id: data.id,
        actor_id: user.id,
        event_type: "creation",
        title: "Dossier créé",
        description: "Le dossier a été ouvert et est en attente de qualification.",
        is_visible_to_client: true,
      });

      toast.success("Dossier créé");
      navigate({ to: "/dashboard/dossiers/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const inputCls =
    "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Retour au dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Nouveau dossier</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Décrivez votre sinistre — un expert le qualifiera sous 48 h.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-lg border border-border bg-background p-6">
        <div>
          <label className="block text-sm font-medium text-foreground">Titre du dossier *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Ex : Dégât des eaux appartement Lyon 6e"
            className={inputCls}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Type de sinistre *</label>
            <select
              required
              value={form.claim_type}
              onChange={(e) => update("claim_type", e.target.value)}
              className={inputCls}
            >
              {CLAIM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Date du sinistre</label>
            <input
              type="date"
              value={form.incident_date}
              onChange={(e) => update("incident_date", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Description</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Circonstances, dommages constatés, démarches déjà entreprises..."
            className={inputCls}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Assureur</label>
            <input
              type="text"
              value={form.insurer_name}
              onChange={(e) => update("insurer_name", e.target.value)}
              placeholder="Ex : MAIF, AXA, Maaf..."
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">N° de contrat</label>
            <input
              type="text"
              value={form.policy_number}
              onChange={(e) => update("policy_number", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Préjudice estimé (€)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={form.estimated_amount}
              onChange={(e) => update("estimated_amount", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Offre actuelle de l'assureur (€)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={form.insurer_offer}
              onChange={(e) => update("insurer_offer", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Création..." : "Créer le dossier"}
          </button>
        </div>
      </form>
    </div>
  );
}
