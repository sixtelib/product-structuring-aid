import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { CLAIM_TYPES, claimTypeLabel } from "@/lib/claim-types";
import { supabase } from "@/integrations/supabase/client";
import {
  migrateLegacyQualificationLocalStorage,
  QUALIFICATION_STORAGE_KEYS,
} from "@/lib/qualificationLocalStorage";

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

function normalizeForSignature(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function signatureMatchesMandant(signature: string, reference: string): boolean {
  const sig = normalizeForSignature(signature);
  const ref = normalizeForSignature(reference);
  if (sig.length < 3 || ref.length < 2) return false;
  if (sig === ref) return true;
  if (ref.includes(sig) || sig.includes(ref)) return true;
  const sigParts = sig.split(" ").filter((p) => p.length > 1);
  if (sigParts.length === 0) return false;
  return sigParts.every((part) => ref.includes(part));
}

function mandantDisplayName(user: User | null): string {
  if (!user) return "l'Assuré";
  const meta = user.user_metadata as { full_name?: string } | undefined;
  const fn = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  if (fn) return fn;
  return user.email?.trim() || "l'Assuré";
}

function mandantReferenceForMatch(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata as { full_name?: string } | undefined;
  const fn = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  const email = user.email?.trim() ?? "";
  const local = email.includes("@") ? email.split("@")[0].replace(/\./g, " ") : email;
  return [fn, local, email].filter(Boolean).join(" ");
}

function DashboardNouveauPage() {
  return <DashboardNouveauContent />;
}

function DashboardNouveauContent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [welcomeEvaluation, setWelcomeEvaluation] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [mandatAccepted, setMandatAccepted] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [mandatError, setMandatError] = useState<string | null>(null);
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

  const mandantName = useMemo(() => mandantDisplayName(user), [user]);
  const mandantMatchRef = useMemo(() => mandantReferenceForMatch(user), [user]);
  const typeSinistreLabel = useMemo(() => claimTypeLabel(form.claim_type), [form.claim_type]);
  const todayFr = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

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
    migrateLegacyQualificationLocalStorage();
    const evalRaw = window.localStorage.getItem(QUALIFICATION_STORAGE_KEYS.evaluation);
    const collectedRaw = window.localStorage.getItem(QUALIFICATION_STORAGE_KEYS.collectedData);
    console.log("[dashboard/nouveau] localStorage:", {
      [QUALIFICATION_STORAGE_KEYS.evaluation]: evalRaw,
      [QUALIFICATION_STORAGE_KEYS.collectedData]: collectedRaw,
    });

    if (evalRaw) setWelcomeEvaluation(evalRaw);
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
    const raw = window.localStorage.getItem(QUALIFICATION_STORAGE_KEYS.pendingFiles);
    if (!raw) return;

    let files: PendingStoredFile[] = [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      files = Array.isArray(parsed) ? (parsed as PendingStoredFile[]) : [];
    } catch {
      window.localStorage.removeItem(QUALIFICATION_STORAGE_KEYS.pendingFiles);
      return;
    }
    if (files.length === 0) {
      window.localStorage.removeItem(QUALIFICATION_STORAGE_KEYS.pendingFiles);
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

    window.localStorage.removeItem(QUALIFICATION_STORAGE_KEYS.pendingFiles);
    if (uploaded > 0) {
      toast.success(`${uploaded} document${uploaded > 1 ? "s" : ""} ajouté${uploaded > 1 ? "s" : ""} au dossier.`);
    }
  }

  function validateStep1(): boolean {
    const amount = form.estimated_amount ? Number(form.estimated_amount) : 0;
    const offer = form.insurer_offer ? Number(form.insurer_offer) : 0;
    if (!form.title.trim()) {
      toast.error("Le titre est requis.");
      return false;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Préjudice estimé invalide.");
      return false;
    }
    if (!Number.isFinite(offer) || offer < 0) {
      toast.error("Offre assureur invalide.");
      return false;
    }
    return true;
  }

  function goToMandatStep(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep1()) return;
    setMandatError(null);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;

    if (!mandatAccepted) {
      setMandatError("Vous devez accepter le mandat pour continuer.");
      return;
    }
    const sig = signatureText.trim();
    if (!sig) {
      setMandatError("Veuillez signer en indiquant votre nom complet.");
      return;
    }
    if (!signatureMatchesMandant(sig, mandantMatchRef)) {
      setMandatError("La signature ne correspond pas au nom du mandant (vérifiez les accents et espaces).");
      return;
    }
    setMandatError(null);

    if (!validateStep1()) return;

    const amount = form.estimated_amount ? Number(form.estimated_amount) : 0;
    const offer = form.insurer_offer ? Number(form.insurer_offer) : 0;

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
          assureur_compagnie_nom: form.insurer_name || null,
          numero_contrat: form.policy_number || null,
          date_sinistre: form.incident_date || null,
          montant_estime: amount,
          offre_assureur: form.insurer_offer ? offer : null,
          mandat_signe: true,
          mandat_signe_le: new Date().toISOString(),
          mandat_signature: sig,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (!data?.id) throw new Error("ID dossier manquant.");

      if (typeof window !== "undefined") {
        let chatbotFiles: string[] = [];
        try {
          chatbotFiles = JSON.parse(window.localStorage.getItem("vertual_uploaded_files") ?? "[]") as string[];
        } catch {
          chatbotFiles = [];
        }

        if (Array.isArray(chatbotFiles) && chatbotFiles.length > 0) {
          for (const path of chatbotFiles) {
            if (!path || typeof path !== "string") continue;
            try {
              const nom = path.split("/").pop() || "document";
              const { error: docErr } = await supabase.from("documents").insert({
                dossier_id: data.id,
                nom,
                storage_path: path,
                statut: "recu",
              });
              if (docErr) throw docErr;
            } catch (err) {
              console.error("Insert chatbot document failed:", err);
            }
          }
          window.localStorage.removeItem("vertual_uploaded_files");
        }
      }

      await uploadPendingFilesForDossier(data.id);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(QUALIFICATION_STORAGE_KEYS.evaluation);
        window.localStorage.removeItem(QUALIFICATION_STORAGE_KEYS.collectedData);
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

        <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-3 text-sm font-bold ${
              step === 1 ? "bg-[#5B50F0] text-white" : "bg-[#E5E7EB] text-[#374151]"
            }`}
          >
            1
          </span>
          <span
            className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-3 text-sm font-bold ${
              step === 2 ? "bg-[#5B50F0] text-white" : "bg-[#E5E7EB] text-[#374151]"
            }`}
          >
            2
          </span>
          <p className="w-full text-sm font-semibold text-foreground sm:ml-1 sm:w-auto">
            {step === 1 ? "Étape 1 sur 2 : Votre dossier" : "Étape 2 sur 2 : Mandat"}
          </p>
        </div>

        {step === 1 ? (
          <form
            onSubmit={goToMandatStep}
            className="mt-6 space-y-6 rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8"
          >
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
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                Continuer vers le mandat
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Mandat de représentation</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Lisez et signez ce document pour que nous puissions agir en votre nom auprès de votre assureur.
              </p>
            </div>

            <div
              className="overflow-y-auto rounded-xl border border-[#E5E7EB] bg-[#F8F9FF] p-8 text-sm leading-relaxed text-[#111827]"
              style={{ height: 400 }}
            >
              <p className="text-center text-base font-bold uppercase tracking-wide">
                MANDAT DE REPRÉSENTATION ET CONVENTION D&apos;HONORAIRES
              </p>
              <p className="mt-6 font-medium">Entre les soussignés :</p>
              <p className="mt-3">
                <span className="font-semibold">Le mandant :</span> {mandantName}
              </p>
              <p className="mt-2">
                <span className="font-semibold">Le mandataire :</span> Vertual, plateforme d&apos;expertise pour les assurés
                sinistrés
              </p>
              <p className="mt-6 font-semibold">Article 1 - Objet du mandat</p>
              <p className="mt-2">
                L&apos;Assuré confie à Vertual mission de le représenter et de défendre ses intérêts auprès de son assureur
                dans le cadre du sinistre déclaré, portant sur <span className="font-semibold">{typeSinistreLabel}</span>.
              </p>
              <p className="mt-6 font-semibold">Article 2 - Étendue du mandat</p>
              <p className="mt-2">
                Vertual est autorisée à prendre contact avec l&apos;assureur au nom de l&apos;Assuré, accéder aux documents du
                dossier, contester les conclusions de l&apos;expert de l&apos;assureur et négocier le montant de
                l&apos;indemnisation.
              </p>
              <p className="mt-2">Vertual ne peut pas accepter une offre sans accord explicite de l&apos;Assuré.</p>
              <p className="mt-6 font-semibold">Article 3 - Honoraires</p>
              <p className="mt-2">
                La mission est rémunérée exclusivement au succès : 10% HT du montant supplémentaire obtenu au-delà de
                l&apos;offre initiale. Aucun honoraire en cas d&apos;échec.
              </p>
              <p className="mt-6 font-semibold">Article 4 - Obligations de l&apos;Assuré</p>
              <p className="mt-2">
                L&apos;Assuré s&apos;engage à fournir tous les documents utiles et à informer Vertual de tout contact direct avec
                l&apos;assureur.
              </p>
              <p className="mt-6 font-semibold">Article 5 - Durée</p>
              <p className="mt-2">
                Ce mandat prend effet à la signature et est valable jusqu&apos;à la clôture du dossier.
              </p>
              <p className="mt-8 text-sm italic text-muted-foreground">Fait électroniquement le {todayFr}.</p>
            </div>

            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground">
                <input
                  type="checkbox"
                  checked={mandatAccepted}
                  onChange={(e) => {
                    setMandatAccepted(e.target.checked);
                    if (e.target.checked) setMandatError(null);
                  }}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-border text-[#5B50F0] focus:ring-[#5B50F0]/30"
                />
                <span>
                  J&apos;ai lu et j&apos;accepte le mandat de représentation et la convention d&apos;honoraires (10% du gain obtenu)
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Signez en tapant votre nom complet</label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Prénom Nom"
                className={inputCls}
                autoComplete="name"
              />
            </div>

            {mandatError && <p className="text-sm font-medium text-destructive">{mandatError}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setMandatError(null);
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={submitting || !mandatAccepted || !signatureText.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5B50F0] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-45"
              >
                {submitting ? "Création..." : "Créer mon dossier →"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

