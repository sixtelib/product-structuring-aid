import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { CLAIM_TYPES } from "@/lib/claim-types";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/nouveau")({
  component: DashboardNouveauPage,
});

type PendingStoredFile = {
  name: string;
  base64: string;
  type?: string;
  size?: number;
};

type StoredCollectedData = {
  type_sinistre?: string;
  assureur?: string;
  montant_propose?: string;
  date_sinistre?: string;
  description?: string;
};

function dataUrlToBlob(dataUrl: string, fallbackType = "application/octet-stream") {
  const [meta, b64] = dataUrl.split(",");
  if (!meta || !b64) throw new Error("Base64 invalide.");
  const mime = meta.match(/data:(.*?);base64/)?.[1] || fallbackType;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return { blob: new Blob([bytes], { type: mime }), mime };
}

function mapClaimType(input?: string) {
  const txt = (input || "").toLowerCase();
  if (txt.includes("dégât des eaux") || txt.includes("degat des eaux")) return "degat_des_eaux";
  if (txt.includes("incendie")) return "incendie";
  if (txt.includes("tempête") || txt.includes("tempete")) return "tempete";
  if (txt.includes("catastrophe")) return "catastrophe_naturelle";
  if (txt.includes("vol")) return "vol";
  return CLAIM_TYPES[0]?.value ?? "degat_des_eaux";
}

function DashboardNouveauPage() {
  return <DashboardNouveauContent />;
}

function DashboardNouveauContent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [welcomeEvaluation, setWelcomeEvaluation] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    claim_type: CLAIM_TYPES[0]?.value ?? "degat_des_eaux",
    incident_date: "",
    description: "",
    insurer_name: "",
    policy_number: "",
    estimated_amount: "",
    insurer_offer: "",
  });

  const inputCls = useMemo(
    () =>
      "mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
    [],
  );

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const evalRaw = window.localStorage.getItem("claimeur_evaluation");
    if (evalRaw) setWelcomeEvaluation(evalRaw);

    const collectedRaw = window.localStorage.getItem("claimeur_collected_data");
    if (!collectedRaw) return;
    try {
      const c = JSON.parse(collectedRaw) as StoredCollectedData;
      setForm((prev) => ({
        ...prev,
        title: prev.title || (c.type_sinistre ? `Sinistre ${c.type_sinistre}` : prev.title),
        claim_type: mapClaimType(c.type_sinistre),
        incident_date: prev.incident_date || (c.date_sinistre || ""),
        description: prev.description || (c.description || ""),
        insurer_name: prev.insurer_name || (c.assureur || ""),
        insurer_offer: prev.insurer_offer || (c.montant_propose || ""),
      }));
    } catch {
      // ignore malformed local data
    }
  }, []);

  async function uploadPendingFilesForDossier(dossierId: string) {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("claimeur_pending_files");
    if (!raw) return;

    let files: PendingStoredFile[] = [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      files = Array.isArray(parsed) ? (parsed as PendingStoredFile[]) : [];
    } catch {
      window.localStorage.removeItem("claimeur_pending_files");
      return;
    }
    if (files.length === 0) {
      window.localStorage.removeItem("claimeur_pending_files");
      return;
    }

    let uploaded = 0;
    for (const file of files) {
      try {
        const { blob, mime } = dataUrlToBlob(file.base64, file.type || "application/octet-stream");
        const safeName = (file.name || "document").replace(/[^\w.\- ()[\]]+/g, "_");
        const path = `dossiers/${dossierId}/${Date.now()}-${safeName}`;

        const up = await supabase.storage.from("documents").upload(path, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: mime,
        });
        if (up.error) throw up.error;

        const { error: insErr } = await supabase.from("documents").insert({
          dossier_id: dossierId,
          nom: file.name || safeName,
          storage_path: path,
          statut: "recu",
        });
        if (insErr) throw insErr;
        uploaded += 1;
      } catch (err) {
        console.error("Upload pending file failed:", err);
      }
    }

    window.localStorage.removeItem("claimeur_pending_files");
    if (uploaded > 0) {
      toast.success(`${uploaded} document${uploaded > 1 ? "s" : ""} ajouté${uploaded > 1 ? "s" : ""} au dossier.`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;

    const amount = form.estimated_amount ? Number(form.estimated_amount) : 0;
    const offer = form.insurer_offer ? Number(form.insurer_offer) : 0;

    if (!form.title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Préjudice estimé invalide.");
      return;
    }
    if (!Number.isFinite(offer) || offer < 0) {
      toast.error("Offre assureur invalide.");
      return;
    }

    setSubmitting(true);
    try {
      const typeLabel = CLAIM_TYPES.find((t) => t.value === form.claim_type)?.label ?? form.claim_type;
      const { data, error } = await supabase
        .from("dossiers")
        .insert({
          user_id: user.id,
          statut: "en_analyse",
          type_sinistre: typeLabel,
          titre: form.title,
          description: form.description || null,
          assureur_nom: form.insurer_name || null,
          numero_contrat: form.policy_number || null,
          date_sinistre: form.incident_date || null,
          montant_estime: amount,
          offre_assureur: form.insurer_offer ? offer : null,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (!data?.id) throw new Error("ID dossier manquant.");

      await uploadPendingFilesForDossier(data.id);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("claimeur_evaluation");
        window.localStorage.removeItem("claimeur_collected_data");
      }
      toast.success("Dossier créé.");
      navigate({ to: "/dashboard/dossiers/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour au dashboard
        </Link>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Nouveau dossier</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Créez votre dossier pour démarrer l'analyse et échanger avec un expert.
        </p>

        {welcomeEvaluation && (
          <div className="mt-6 rounded-xl border border-[#5B50F0]/30 bg-[#F5F3FF] p-4">
            <p className="text-sm font-semibold text-foreground">Bienvenue, votre évaluation personnalisée :</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">{welcomeEvaluation}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
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

          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg border-2 border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
            >
              {submitting ? "Création..." : "Créer le dossier"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

