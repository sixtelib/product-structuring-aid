import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { formatDocumentStatusDb } from "@/lib/client-dashboard-ui";

export const Route = createFileRoute("/admin/utilisateurs/$userId")({
  component: AdminUtilisateurDetailPage,
});

type DossierRow = Tables<"dossiers"> & {
  nom_assure?: string | null;
  prenom_assure?: string | null;
  assureur?: string | null;
};

type DocumentRow = Tables<"documents"> & { chemin?: string | null };
type ProfileRow = Tables<"profiles">;

type ProfileFormState = {
  prenom: string;
  nom: string;
  email_contact: string;
  telephone: string;
  adresse: string;
  numero_contrat: string;
  assureur_principal: string;
};

function parseFullName(full: string | null | undefined): { prenom: string; nom: string } {
  const t = (full ?? "").trim();
  if (!t) return { prenom: "", nom: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { prenom: t, nom: "" };
  return { prenom: t.slice(0, i).trim(), nom: t.slice(i + 1).trim() };
}

function formatStatut(statut: string): { label: string; bg: string; color: string } {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    en_analyse: { label: "En analyse", bg: "#FFF3CD", color: "#856404" },
    en_cours: { label: "En cours", bg: "#D1ECF1", color: "#0C5460" },
    negociation: { label: "Négociation", bg: "#EEE9FF", color: "#5B50F0" },
    négociation: { label: "Négociation", bg: "#EEE9FF", color: "#5B50F0" },
    gagne: { label: "Gagné", bg: "#D4EDDA", color: "#155724" },
    gagné: { label: "Gagné", bg: "#D4EDDA", color: "#155724" },
    perdu: { label: "Perdu", bg: "#F8D7DA", color: "#721C24" },
    cloture: { label: "Clôturé", bg: "#E2E3E5", color: "#383D41" },
    clôturé: { label: "Clôturé", bg: "#E2E3E5", color: "#383D41" },
  };
  return map[statut] ?? { label: statut, bg: "#E2E3E5", color: "#383D41" };
}

function eur(n: number | null | undefined) {
  const v = n == null ? 0 : Number(n);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v) ? v : 0);
}

function dateFr(d: string | null | undefined) {
  if (!d) return "Non renseigné";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "Non renseigné";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function docIcon(nom: string) {
  const lower = nom.toLowerCase();
  if (lower.endsWith(".pdf"))
    return <FileText className="h-5 w-5 shrink-0 text-red-600" aria-hidden />;
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(lower))
    return <ImageIcon className="h-5 w-5 shrink-0 text-[#5B50F0]" aria-hidden />;
  return <FileText className="h-5 w-5 shrink-0 text-[#6B7280]" aria-hidden />;
}

function storagePathFor(doc: DocumentRow): string | null {
  const raw = doc as DocumentRow & { storage_path?: string | null };
  const chemin = doc.chemin ?? null;
  const path = chemin ?? raw.storage_path ?? doc.nom;
  return path && String(path).trim() ? String(path).trim() : null;
}

function previewKindFromNom(nom: string): "pdf" | "image" | "other" {
  const lower = nom.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) return "image";
  return "other";
}

function infoCardClass() {
  return "rounded-[12px] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)] sm:p-[24px]";
}

function AdminUtilisateurDetailPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [dossiers, setDossiers] = useState<DossierRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [mandats, setMandats] = useState<DocumentRow[]>([]);
  const [expertById, setExpertById] = useState<Map<string, string>>(new Map());

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    prenom: "",
    nom: "",
    email_contact: "",
    telephone: "",
    adresse: "",
    numero_contrat: "",
    assureur_principal: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);
  const [previewSignedUrl, setPreviewSignedUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: profileData, error: profileErr },
        { data: dossiersData, error: dossiersErr },
        { data: mandatsData, error: mandatsErr },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("dossiers")
          .select("*")
          .eq("user_id", userId)
          .order("date_ouverture", { ascending: false }),
        supabase.from("documents").select("*").eq("user_id", userId).eq("type", "mandat"),
      ]);

      if (profileErr) throw profileErr;
      if (dossiersErr) throw dossiersErr;
      if (mandatsErr) throw mandatsErr;

      const dossierList = (dossiersData as DossierRow[]) ?? [];
      setProfile((profileData as ProfileRow) ?? null);
      setDossiers(dossierList);
      setMandats((mandatsData as DocumentRow[]) ?? []);

      const dossierIds = dossierList.map((d) => d.id).filter(Boolean);
      if (dossierIds.length === 0) {
        setDocuments([]);
      } else {
        const { data: docsData, error: docsErr } = await supabase
          .from("documents")
          .select("*")
          .in("dossier_id", dossierIds);
        if (docsErr) throw docsErr;
        setDocuments((docsData as DocumentRow[]) ?? []);
      }

      const expertIds = [
        ...new Set(dossierList.map((d) => d.expert_id).filter(Boolean)),
      ] as string[];
      if (expertIds.length === 0) {
        setExpertById(new Map());
      } else {
        const { data: expData, error: expErr } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", expertIds);
        if (expErr) throw expErr;
        const m = new Map<string, string>();
        for (const row of expData ?? []) {
          const r = row as { id: string; full_name: string | null; email: string | null };
          const label = (r.full_name ?? "").trim() || r.email || r.id.slice(0, 8);
          m.set(r.id, label);
        }
        setExpertById(m);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
      setProfile(null);
      setDossiers([]);
      setDocuments([]);
      setMandats([]);
      setExpertById(new Map());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const firstDossier = dossiers[0] ?? null;
  const parsedName = useMemo(() => parseFullName(profile?.full_name), [profile?.full_name]);

  const displayPrenom = firstDossier?.prenom_assure?.trim() || parsedName.prenom || "";
  const displayNom = firstDossier?.nom_assure?.trim() || parsedName.nom || "";
  const displayEmail = profile?.email ?? "—";
  const displayTelephone = profile?.phone?.trim() || "Non renseigné";

  const membreDepuis = useMemo(() => {
    const times = dossiers
      .map((d) => (d.date_ouverture ? new Date(d.date_ouverture).getTime() : null))
      .filter((t): t is number => t != null && Number.isFinite(t));
    if (times.length === 0) return null;
    return new Date(Math.min(...times));
  }, [dossiers]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      prenom: (profile as any).prenom || "",
      nom: (profile as any).nom || "",
      email_contact: (profile as any).email_contact || "",
      telephone: (profile as any).telephone || "",
      adresse: (profile as any).adresse || "",
      numero_contrat: (profile as any).numero_contrat || "",
      assureur_principal: (profile as any).assureur_principal || "",
    });
  }, [profile]);

  const mandatSigne = mandats.length > 0 || Boolean(profile?.mandat_signe);
  const mandatDate = profile?.mandat_signe_le ?? mandats[0]?.created_at ?? null;
  const mandatNomSigne = profile?.mandat_signature?.trim() || null;
  const mandatDocPourTelechargement = mandats[0] ?? null;

  async function handleSave() {
    try {
      setSaving(true);
      setSaveError(null);

      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: userId,
        prenom: form.prenom,
        nom: form.nom,
        email_contact: form.email_contact,
        telephone: form.telephone,
        adresse: form.adresse,
        numero_contrat: form.numero_contrat,
        assureur_principal: form.assureur_principal,
        updated_at: new Date().toISOString(),
      } as any);

      if (upsertError) throw upsertError;

      if (form.nom || form.prenom) {
        await supabase
          .from("dossiers")
          .update({
            nom_assure: form.nom,
            prenom_assure: form.prenom,
          })
          .eq("user_id", userId);
      }

      setProfile((prev) => (prev ? ({ ...prev, ...(form as any) } as any) : prev));
      setEditing(false);

      setSuccessMessage("Profil mis à jour avec succès");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setSaveError("Erreur lors de la sauvegarde : " + (err?.message ?? "Erreur inconnue"));
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (profile) {
      setForm({
        prenom: (profile as any).prenom || "",
        nom: (profile as any).nom || "",
        email_contact: (profile as any).email_contact || "",
        telephone: (profile as any).telephone || "",
        adresse: (profile as any).adresse || "",
        numero_contrat: (profile as any).numero_contrat || "",
        assureur_principal: (profile as any).assureur_principal || "",
      });
    }
    setSaveError(null);
    setEditing(false);
  }

  async function downloadDoc(doc: DocumentRow) {
    const path = storagePathFor(doc);
    if (!path) {
      setSaveError("Chemin de fichier manquant.");
      return;
    }
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw error ?? new Error("Lien indisponible.");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Téléchargement impossible.");
    } finally {
      setDownloadingId(null);
    }
  }

  function closePreview() {
    setPreviewDoc(null);
    setPreviewSignedUrl(null);
    setPreviewError(false);
    setPreviewLoading(false);
  }

  async function openPreview(doc: DocumentRow) {
    const path = storagePathFor(doc);
    if (!path) {
      setSaveError("Chemin de fichier manquant.");
      return;
    }
    setPreviewDoc(doc);
    setPreviewSignedUrl(null);
    setPreviewError(false);
    setPreviewLoading(true);
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw error ?? new Error("signed url");
      setPreviewSignedUrl(data.signedUrl);
    } catch {
      setPreviewError(true);
    } finally {
      setPreviewLoading(false);
    }
  }

  const dossierById = useMemo(() => new Map(dossiers.map((d) => [d.id, d])), [dossiers]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F8F9FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-12">
      {successMessage ? (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 100,
            background: "#D4EDDA",
            border: "1px solid #C3E6CB",
            color: "#155724",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: 600,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
          role="status"
          aria-live="polite"
        >
          ✓ {successMessage}
        </div>
      ) : null}
      {saveError ? (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 100,
            background: "#F8D7DA",
            border: "1px solid #F5C6CB",
            color: "#721C24",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: 600,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
          role="alert"
        >
          {saveError}
        </div>
      ) : null}

      {previewDoc ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            role="presentation"
            className="absolute inset-0 bg-[rgba(0,0,0,0.7)]"
            onClick={closePreview}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-doc-title"
            className="relative z-10 flex max-h-[90vh] w-[90vw] max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E5E7EB] px-6 py-5">
              <h2
                id="preview-doc-title"
                className="min-w-0 flex-1 break-words pr-2 text-base font-semibold text-[#111827]"
              >
                {previewDoc.nom}
              </h2>
              <button
                type="button"
                onClick={closePreview}
                className="shrink-0 rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-6">
              {previewLoading ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
                  <p className="text-sm font-medium text-[#6B7280]">Chargement de l&apos;aperçu…</p>
                </div>
              ) : previewError || !previewSignedUrl ? (
                <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
                  <p className="max-w-md text-sm leading-relaxed text-[#374151]">
                    Impossible de charger l&apos;aperçu. Essayez de télécharger le fichier.
                  </p>
                  <button
                    type="button"
                    onClick={() => void downloadDoc(previewDoc)}
                    disabled={downloadingId === previewDoc.id}
                    className="inline-flex items-center gap-2 rounded-[10px] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: "#5B50F0" }}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Télécharger
                  </button>
                </div>
              ) : (
                (() => {
                  const kind = previewKindFromNom(previewDoc.nom);
                  if (kind === "pdf") {
                    return (
                      <iframe
                        title={previewDoc.nom}
                        src={previewSignedUrl}
                        className="w-full rounded-lg border-0"
                        style={{ height: "70vh", border: "none", borderRadius: "8px" }}
                      />
                    );
                  }
                  if (kind === "image") {
                    return (
                      <img
                        src={previewSignedUrl}
                        alt={previewDoc.nom}
                        className="mx-auto rounded-lg"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "70vh",
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                      />
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
                      <p className="text-sm leading-relaxed text-[#374151]">
                        Aperçu non disponible pour ce type de fichier
                      </p>
                      <button
                        type="button"
                        onClick={() => void downloadDoc(previewDoc)}
                        disabled={downloadingId === previewDoc.id}
                        className="inline-flex items-center gap-2 rounded-[10px] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        style={{ backgroundColor: "#5B50F0" }}
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Télécharger
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[900px] space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/utilisateurs" })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B50F0] hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Utilisateurs
          </button>
          <button
            type="button"
            onClick={() => setSaveError("Fonctionnalité bientôt disponible")}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
          >
            Suspendre le compte
          </button>
        </div>

        {error ? (
          <div className="rounded-[12px] border border-red-200 bg-white p-6 text-sm text-red-700 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            {error}
          </div>
        ) : null}

        <section className={infoCardClass()}>
          <div className="mb-6 flex items-start justify-between gap-3 border-b border-[#F3F4F6] pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#5B50F0]" aria-hidden />
              <h2 className="text-lg font-semibold text-[#111827]">Informations personnelles</h2>
            </div>
            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setSaveError(null);
                  setEditing(true);
                }}
                style={{
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                <Edit className="h-4 w-4" aria-hidden />
                Modifier
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  style={{
                    background: "#5B50F0",
                    color: "white",
                    border: "1px solid #5B50F0",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? (
                    <>
                      <span
                        aria-hidden
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Sauvegarder
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#111827",
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Annuler
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Prénom</p>
              {editing ? (
                <input
                  value={form.prenom}
                  onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                  type="text"
                  style={{
                    marginTop: "8px",
                    border: "1px solid #5B50F0",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "100%",
                    fontSize: "0.95rem",
                    background: "#FAFAFE",
                  }}
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-[#111827]">
                  {(profile as any)?.prenom?.trim?.() || displayPrenom || "—"}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Nom</p>
              {editing ? (
                <input
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  type="text"
                  style={{
                    marginTop: "8px",
                    border: "1px solid #5B50F0",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "100%",
                    fontSize: "0.95rem",
                    background: "#FAFAFE",
                  }}
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-[#111827]">
                  {(profile as any)?.nom?.trim?.() || displayNom || "—"}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Email</p>
              {editing ? (
                <input
                  value={form.email_contact}
                  onChange={(e) => setForm((f) => ({ ...f, email_contact: e.target.value }))}
                  type="email"
                  style={{
                    marginTop: "8px",
                    border: "1px solid #5B50F0",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "100%",
                    fontSize: "0.95rem",
                    background: "#FAFAFE",
                  }}
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-[#111827]">
                  {(profile as any)?.email_contact?.trim?.() || displayEmail || "—"}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Téléphone
              </p>
              {editing ? (
                <input
                  value={form.telephone}
                  onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  type="text"
                  style={{
                    marginTop: "8px",
                    border: "1px solid #5B50F0",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "100%",
                    fontSize: "0.95rem",
                    background: "#FAFAFE",
                  }}
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-[#111827]">
                  {(profile as any)?.telephone?.trim?.() || displayTelephone}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Membre depuis
              </p>
              <p className="mt-2 text-sm font-medium text-[#111827]">
                {membreDepuis
                  ? membreDepuis.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Non renseigné"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Rôle</p>
              <span className="mt-2 inline-flex items-center rounded-full bg-[#DBEAFE] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
                Assuré
              </span>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Adresse</p>
              {editing ? (
                <textarea
                  value={form.adresse}
                  onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
                  rows={2}
                  style={{
                    marginTop: "8px",
                    border: "1px solid #5B50F0",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "100%",
                    fontSize: "0.95rem",
                    background: "#FAFAFE",
                    resize: "vertical",
                  }}
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-[#111827]">
                  {(profile as any)?.adresse?.trim?.() ? (
                    (profile as any).adresse.trim()
                  ) : (
                    <span className="text-[#9CA3AF] italic">Non renseigné</span>
                  )}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Numéro de contrat</p>
              {editing ? (
                <input
                  value={form.numero_contrat}
                  onChange={(e) => setForm((f) => ({ ...f, numero_contrat: e.target.value }))}
                  type="text"
                  style={{
                    marginTop: "8px",
                    border: "1px solid #5B50F0",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "100%",
                    fontSize: "0.95rem",
                    background: "#FAFAFE",
                  }}
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-[#111827]">
                  {(profile as any)?.numero_contrat?.trim?.() ? (
                    (profile as any).numero_contrat.trim()
                  ) : (
                    <span className="text-[#9CA3AF] italic">Non renseigné</span>
                  )}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Assureur principal</p>
              {editing ? (
                <input
                  value={form.assureur_principal}
                  onChange={(e) => setForm((f) => ({ ...f, assureur_principal: e.target.value }))}
                  type="text"
                  style={{
                    marginTop: "8px",
                    border: "1px solid #5B50F0",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "100%",
                    fontSize: "0.95rem",
                    background: "#FAFAFE",
                  }}
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-[#111827]">
                  {(profile as any)?.assureur_principal?.trim?.() ? (
                    (profile as any).assureur_principal.trim()
                  ) : (
                    <span className="text-[#9CA3AF] italic">Non renseigné</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className={infoCardClass()}>
          <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
            <Shield className="h-5 w-5 text-[#5B50F0]" aria-hidden />
            <h2 className="text-lg font-semibold text-[#111827]">Mandat de représentation</h2>
          </div>
          {mandatSigne ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  Signé
                </span>
                <p className="text-sm text-[#374151]">
                  <span className="font-semibold text-[#111827]">Date de signature :</span>{" "}
                  {dateFr(mandatDate)}
                </p>
              </div>
              {mandatNomSigne ? (
                <p className="text-sm text-[#374151]">
                  <span className="font-semibold text-[#111827]">Nom signé :</span> {mandatNomSigne}
                </p>
              ) : null}
              {mandatDocPourTelechargement ? (
                <button
                  type="button"
                  disabled={downloadingId === mandatDocPourTelechargement.id}
                  onClick={() => void downloadDoc(mandatDocPourTelechargement)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#5B50F0] bg-white px-4 py-2 text-sm font-semibold text-[#5B50F0] hover:bg-[#F5F3FF] disabled:opacity-50"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Télécharger le mandat
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
                Non signé
              </span>
              <p className="text-sm text-[#6B7280]">
                L&apos;assuré n&apos;a pas encore signé le mandat.
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#111827]">
            Dossiers ({dossiers.length})
          </h2>
          {dossiers.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Aucun dossier pour cet assuré</p>
          ) : (
            <div className="space-y-3">
              {dossiers.map((d) => {
                const st = formatStatut(d.statut);
                const expertLabel = d.expert_id
                  ? (expertById.get(String(d.expert_id)) ?? null)
                  : null;
                const assureur = (d.assureur_nom ?? d.assureur ?? "Non renseigné") as string;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      navigate({ to: "/admin/dossiers/$dossierId", params: { dossierId: d.id } })
                    }
                    className="w-full cursor-pointer rounded-[12px] border border-solid border-[#F3F4F6] bg-white p-5 text-left transition-colors hover:bg-[#F8F9FF]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">
                          {d.type_sinistre ?? "—"}
                        </p>
                        <p className="mt-2 text-xs text-[#6B7280]">
                          Ouvert le {dateFr(d.date_ouverture)} · {eur(d.montant_estime)} ·{" "}
                          {assureur}
                        </p>
                      </div>
                      <span
                        className="inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ backgroundColor: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[#374151]">
                      <span className="font-medium text-[#111827]">Expert :</span>{" "}
                      {expertLabel ? (
                        expertLabel
                      ) : (
                        <span className="text-[#6B7280]">Non assigné</span>
                      )}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className={infoCardClass()}>
          <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
            <FileText className="h-5 w-5 text-[#5B50F0]" aria-hidden />
            <h2 className="text-lg font-semibold text-[#111827]">Documents ({documents.length})</h2>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Aucun document</p>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => {
                const st = formatDocumentStatusDb(doc.statut);
                const dossierLabel = dossierById.get(doc.dossier_id ?? "")?.type_sinistre ?? "—";
                return (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void openPreview(doc)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left transition-opacity hover:opacity-80"
                      >
                        {docIcon(doc.nom)}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#111827]">
                            {doc.nom}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-[#6B7280]">
                            Dossier : {dossierLabel}
                          </span>
                        </span>
                      </button>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void openPreview(doc)}
                        className="inline-flex items-center gap-2 rounded-lg border border-solid border-[#E5E7EB] bg-white px-[14px] py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
                      >
                        <Eye className="h-4 w-4 shrink-0" aria-hidden />
                        Aperçu
                      </button>
                      <button
                        type="button"
                        disabled={downloadingId === doc.id}
                        onClick={() => void downloadDoc(doc)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#5B50F0] bg-white px-3 py-2 text-sm font-semibold text-[#5B50F0] hover:bg-[#F5F3FF] disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Télécharger
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
