import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Component, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Download, Eye, FileText, Image as ImageIcon, MessageSquare, Send, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { formatDocumentStatusDb } from "@/lib/client-dashboard-ui";
import { DossierAnalyseIA } from "@/components/DossierAnalyseIA";
import {
  getImpersonatedExpertDisplayName,
  getImpersonatedExpertId,
  getImpersonatedExpertNomPrenomForDossierFilter,
} from "@/lib/expertImpersonation";

export const Route = createFileRoute("/expert/dossiers/$id")({
  component: ExpertDossierDetailPage,
});

type DossierRow = Tables<"dossiers"> & {
  nom_assure?: string | null;
  prenom_assure?: string | null;
  nom_expert?: string | null;
  prenom_expert?: string | null;
};

type DocumentRow = Tables<"documents"> & { chemin?: string | null; storage_path?: string | null };
type MessageRow = Tables<"messages">;
type ProfileRow = Pick<Tables<"profiles">, "full_name" | "email">;

function normalize(s: string | null | undefined) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatStatut(statut: string): { label: string; bg: string; color: string } {
  const s = normalize(statut);
  if (s.includes("qualif")) return { label: "Qualification", bg: "#FEF3C7", color: "#92400E" };
  if (s.includes("analyse")) return { label: "En analyse", bg: "#FFF3CD", color: "#856404" };
  if (s.includes("en_cours") || s === "en cours") return { label: "En cours", bg: "#D1ECF1", color: "#0C5460" };
  if (s.includes("gagn")) return { label: "Gagné", bg: "#D4EDDA", color: "#155724" };
  if (s.includes("perdu") || s.includes("refus")) return { label: "Perdu", bg: "#F8D7DA", color: "#721C24" };
  if (s.includes("clotur") || s.includes("clos")) return { label: "Clôturé", bg: "#E2E3E5", color: "#383D41" };
  const map: Record<string, { label: string; bg: string; color: string }> = {
    negociation: { label: "Négociation", bg: "#EEE9FF", color: "#5B50F0" },
    "négociation": { label: "Négociation", bg: "#EEE9FF", color: "#5B50F0" },
  };
  return map[statut] ?? { label: statut, bg: "#E2E3E5", color: "#383D41" };
}

function eur(n: number | null | undefined) {
  const v = n == null ? 0 : Number(n);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number.isFinite(v) ? v : 0,
  );
}

function dateFr(d: string | null | undefined) {
  if (!d) return "Non renseigné";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "Non renseigné";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
}

function authorLabel(auteur: string, expertDisplay: string) {
  if (auteur === "admin") return "Administrateur";
  if (auteur === "expert") return expertDisplay.trim() || "Expert";
  if (auteur === "client") return "Assuré";
  return auteur;
}

function isStaffMessage(auteur: string) {
  return auteur === "admin" || auteur === "expert";
}

function docIcon(nom: string) {
  const lower = nom.toLowerCase();
  if (lower.endsWith(".pdf")) return <FileText className="h-5 w-5 shrink-0 text-red-600" aria-hidden />;
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(lower)) return <ImageIcon className="h-5 w-5 shrink-0 text-[#5B50F0]" aria-hidden />;
  return <FileText className="h-5 w-5 shrink-0 text-[#6B7280]" aria-hidden />;
}

function storagePathFor(doc: DocumentRow): string | null {
  const chemin = doc.chemin ?? null;
  const path = chemin ?? doc.storage_path ?? doc.nom;
  return path && String(path).trim() ? String(path).trim() : null;
}

function previewKindFromNom(nom: string): "pdf" | "image" | "other" {
  const lower = nom.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) return "image";
  return "other";
}

function cardClass() {
  return "rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]";
}

class DossierAnalyseIAErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className={`${cardClass()} mt-6`}>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">Analyse IA</p>
            <p className="mt-1">Une erreur s&apos;est produite dans cette section.</p>
            <button
              type="button"
              className="mt-3 inline-flex rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              onClick={() => this.setState({ hasError: false })}
            >
              Réessayer
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

function ExpertDossierDetailPage() {
  const { id: dossierId } = Route.useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isExpert } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<DossierRow | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [mandatDocuments, setMandatDocuments] = useState<DocumentRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [assureProfile, setAssureProfile] = useState<ProfileRow | null>(null);
  const [selfExpertName, setSelfExpertName] = useState("");

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);
  const [previewSignedUrl, setPreviewSignedUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const expertMessageLabel = useMemo(() => {
    const imp = getImpersonatedExpertDisplayName();
    if (imp?.trim()) return imp.trim();
    return selfExpertName.trim() || "Expert";
  }, [selfExpertName]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin && !getImpersonatedExpertId()) {
        void navigate({ to: "/admin", replace: true });
        return;
      }
      if (!isAdmin && !isExpert) {
        void navigate({ to: "/dashboard", replace: true });
        return;
      }

      const { data: dRow, error: dErr } = await supabase
        .from("dossiers")
        .select("*, analyse_ia, analyse_ia_date")
        .eq("id", dossierId)
        .maybeSingle();
      if (dErr) throw dErr;
      if (!dRow) {
        setDossier(null);
        setDocuments([]);
        setMandatDocuments([]);
        setMessages([]);
        setAssureProfile(null);
        return;
      }
      const d = dRow as DossierRow;

      if (isAdmin) {
        const imp = getImpersonatedExpertId();
        const { nom, prenom } = getImpersonatedExpertNomPrenomForDossierFilter();
        const matchId = imp && d.expert_id === imp;
        const matchName =
          nom.trim() !== "" || prenom.trim() !== ""
            ? String(d.nom_expert ?? "").trim() === nom.trim() && String(d.prenom_expert ?? "").trim() === prenom.trim()
            : false;
        if (imp && !matchId && !matchName) {
          toast.error("Ce dossier n'est pas accessible pour cet aperçu expert.");
          setDossier(null);
          setLoading(false);
          return;
        }
      }

      setDossier(d);

      const [docRes, msgRes] = await Promise.all([
        supabase.from("documents").select("*").eq("dossier_id", dossierId),
        supabase.from("messages").select("*").eq("dossier_id", dossierId).order("created_at", { ascending: true }),
      ]);
      setDocuments((docRes.data as DocumentRow[]) ?? []);
      setMessages((msgRes.data as MessageRow[]) ?? []);

      const { data: mandatRows } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", d.user_id)
        .eq("type", "mandat");
      setMandatDocuments((mandatRows as DocumentRow[]) ?? []);

      const aRes = await supabase.from("profiles").select("full_name, email").eq("id", d.user_id).maybeSingle();
      setAssureProfile((aRes.data as ProfileRow) ?? null);

      if (user?.id && isExpert && !isAdmin) {
        const pr = await supabase.from("profiles").select("full_name, prenom, nom").eq("id", user.id).maybeSingle();
        const row = pr.data as { full_name?: string | null; prenom?: string | null; nom?: string | null } | null;
        if (row) {
          const nm = (row.full_name ?? "").trim() || `${row.prenom ?? ""} ${row.nom ?? ""}`.trim();
          setSelfExpertName(nm);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Impossible de charger le dossier.");
      setDossier(null);
    } finally {
      setLoading(false);
    }
  }, [dossierId, navigate, isAdmin, isExpert, user?.id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    const ch = supabase
      .channel(`expert-messages-${dossierId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `dossier_id=eq.${dossierId}` },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [dossierId]);

  async function downloadDoc(doc: DocumentRow) {
    const path = storagePathFor(doc);
    if (!path) {
      toast.error("Chemin de fichier manquant.");
      return;
    }
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw error ?? new Error("Lien indisponible.");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Téléchargement impossible.");
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
      toast.error("Chemin de fichier manquant.");
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

  async function sendMessage() {
    const text = messageText.trim();
    if (!text) return;
    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        dossier_id: dossierId,
        auteur: "expert",
        contenu: text,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setMessageText("");
      const { data: msgData, error: qErr } = await supabase
        .from("messages")
        .select("*")
        .eq("dossier_id", dossierId)
        .order("created_at", { ascending: true });
      if (qErr) throw qErr;
      setMessages((msgData as MessageRow[]) ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible.");
    } finally {
      setSendingMessage(false);
    }
  }

  async function copyId() {
    if (!dossier?.id) return;
    try {
      await navigator.clipboard.writeText(dossier.id);
      toast.success("ID copié.");
    } catch {
      toast.error("Impossible de copier.");
    }
  }

  const commission = useMemo(() => {
    if (dossier?.montant_estime == null) return null;
    const n = Number(dossier.montant_estime);
    if (!Number.isFinite(n)) return null;
    return n * 0.1;
  }, [dossier?.montant_estime]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F8F9FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="mx-auto max-w-[1100px] bg-[#F8F9FF] px-4 py-10">
        <p className="text-sm text-[#6B7280]">Dossier introuvable.</p>
        <button
          type="button"
          onClick={() => void navigate({ to: "/expert/dossiers" })}
          className="mt-4 text-sm font-semibold text-[#5B50F0] hover:underline"
        >
          ← Retour aux dossiers
        </button>
      </div>
    );
  }

  const statutFmt = formatStatut(dossier.statut);
  const assureurLabel = dossier.assureur_nom ?? (dossier as { assureur?: string | null }).assureur ?? "Non renseigné";
  const assureNom =
    dossier.nom_assure || dossier.prenom_assure
      ? `${dossier.prenom_assure ?? ""} ${dossier.nom_assure ?? ""}`.trim()
      : assureProfile?.full_name?.trim() || "Inconnu";

  return (
    <div className="bg-[#F8F9FF] pb-12">
      {previewDoc ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div role="presentation" className="absolute inset-0 bg-[rgba(0,0,0,0.7)]" onClick={closePreview} />
          <div className="relative z-10 flex max-h-[90vh] w-[90vw] max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E5E7EB] px-6 py-5">
              <h2 className="min-w-0 flex-1 break-words pr-2 text-base font-semibold text-[#111827]">{previewDoc.nom}</h2>
              <button type="button" onClick={closePreview} className="shrink-0 rounded-lg p-2 text-[#6B7280] hover:bg-[#F3F4F6]" aria-label="Fermer">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-6">
              {previewLoading ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
                  <p className="text-sm font-medium text-[#6B7280]">Chargement…</p>
                </div>
              ) : previewError || !previewSignedUrl ? (
                <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
                  <p className="max-w-md text-sm text-[#374151]">Impossible de charger l&apos;aperçu.</p>
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
              ) : previewKindFromNom(previewDoc.nom) === "pdf" ? (
                <iframe title={previewDoc.nom} src={previewSignedUrl} className="w-full rounded-lg border-0" style={{ height: "70vh" }} />
              ) : previewKindFromNom(previewDoc.nom) === "image" ? (
                <img src={previewSignedUrl} alt={previewDoc.nom} className="mx-auto rounded-lg" style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
                  <p className="text-sm text-[#374151]">Aperçu non disponible pour ce type.</p>
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
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        <button
          type="button"
          onClick={() => void navigate({ to: "/expert/dossiers" })}
          className="inline-flex items-center gap-2 font-medium text-[#5B50F0] hover:underline"
          style={{ fontSize: "0.875rem" }}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          ← Dossiers
        </button>

        <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">{assureNom}</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              {dossier.type_sinistre} · Ouvert le {dateFr(dossier.date_ouverture)}
            </p>
          </div>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: statutFmt.bg, color: statutFmt.color }}
          >
            {statutFmt.label}
          </span>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className={cardClass()}>
            <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
              <FileText className="h-5 w-5 text-[#5B50F0]" aria-hidden />
              <h2 className="text-lg font-semibold text-[#111827]">Détails du dossier</h2>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">ID</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  <code className="break-all text-sm text-[#111827]">{dossier.id}</code>
                  <button
                    type="button"
                    onClick={() => void copyId()}
                    className="rounded-lg bg-[#F3F4F6] px-2 py-1 text-xs font-semibold text-[#111827] hover:bg-[#E5E7EB]"
                  >
                    Copier
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Date d&apos;ouverture</dt>
                <dd className="mt-1 text-sm font-medium text-[#111827]">{dateFr(dossier.date_ouverture)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Type de sinistre</dt>
                <dd className="mt-1 text-sm font-medium text-[#111827]">{dossier.type_sinistre}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Montant estimé</dt>
                <dd className="mt-1 text-sm font-medium text-[#111827]">{eur(dossier.montant_estime)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Commission Vertual</dt>
                <dd className="mt-1 text-sm font-semibold text-[#5B50F0]">{commission == null ? "—" : eur(commission)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Assureur</dt>
                <dd className="mt-1 text-sm font-medium text-[#111827]">{assureurLabel}</dd>
              </div>
              {dossier.description ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Description</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{dossier.description}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className={cardClass()}>
            <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
              <Shield className="h-5 w-5 text-[#5B50F0]" aria-hidden />
              <h2 className="text-lg font-semibold text-[#111827]">Assuré</h2>
            </div>
            <p className="text-sm font-medium text-[#111827]">{assureNom}</p>
            {assureProfile?.email ? <p className="mt-2 text-sm text-[#6B7280]">{assureProfile.email}</p> : null}
          </section>
        </div>

        <DossierAnalyseIAErrorBoundary key={dossierId}>
          <DossierAnalyseIA
            dossier={{
              id: dossier.id,
              type_sinistre: dossier.type_sinistre,
              montant_estime: Number(dossier.montant_estime),
              statut: dossier.statut,
              assureur: (dossier.assureur_nom ?? (dossier as { assureur?: string }).assureur) ?? undefined,
              description: dossier.description ?? undefined,
              nom_assure: dossier.nom_assure ?? undefined,
              prenom_assure: dossier.prenom_assure ?? undefined,
              analyse_ia: (dossier as { analyse_ia?: string | null }).analyse_ia ?? null,
              analyse_ia_date: (dossier as { analyse_ia_date?: string | null }).analyse_ia_date ?? null,
            }}
            documents={documents.map((d) => ({
              id: d.id,
              nom: d.nom,
              chemin: d.chemin ?? d.storage_path ?? undefined,
            }))}
          />
        </DossierAnalyseIAErrorBoundary>

        <section className={`${cardClass()} mt-6`}>
          <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
            <MessageSquare className="h-5 w-5 text-[#5B50F0]" aria-hidden />
            <h2 className="text-lg font-semibold text-[#111827]">Messagerie interne</h2>
          </div>
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="text-sm text-[#6B7280]">Aucun message.</p>
            ) : (
              messages.map((m) => {
                const staff = isStaffMessage(m.auteur);
                return (
                  <div key={m.id} className={`flex ${staff ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm sm:max-w-[70%] ${
                        staff ? "bg-[#F3F4F6] text-[#111827]" : "bg-[#EEE9FF] text-[#111827]"
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#6B7280]">{authorLabel(m.auteur, expertMessageLabel)}</p>
                      <p className="mt-2 whitespace-pre-wrap leading-relaxed">{m.contenu}</p>
                      <p className="mt-2 text-[11px] text-[#6B7280]">{timeAgo(m.created_at)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-[#F3F4F6] pt-4 sm:flex-row sm:items-end">
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Écrire un message..."
              className="min-h-[88px] w-full flex-1 resize-y rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
            />
            <button
              type="button"
              disabled={sendingMessage || !messageText.trim()}
              onClick={() => void sendMessage()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#5B50F0" }}
            >
              <Send className="h-4 w-4" aria-hidden />
              Envoyer
            </button>
          </div>
        </section>

        {mandatDocuments.length > 0 ? (
          <section className={`${cardClass()} mt-6`}>
            <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
              <Shield className="h-5 w-5 text-[#5B50F0]" aria-hidden />
              <h2 className="text-lg font-semibold text-[#111827]">Mandat de représentation</h2>
            </div>
            <ul className="space-y-3">
              {mandatDocuments.map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {docIcon(doc.nom)}
                    <span className="truncate text-sm font-medium text-[#111827]">{doc.nom}</span>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">Signé</span>
                  </div>
                  <button
                    type="button"
                    disabled={downloadingId === doc.id}
                    onClick={() => void downloadDoc(doc)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#5B50F0] bg-white px-3 py-2 text-sm font-semibold text-[#5B50F0] hover:bg-[#F5F3FF] disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Télécharger
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className={`${cardClass()} mt-6`}>
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
                return (
                  <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <button type="button" onClick={() => void openPreview(doc)} className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-80">
                        {docIcon(doc.nom)}
                        <span className="truncate text-sm font-medium text-[#111827]">{doc.nom}</span>
                      </button>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${st.className}`}>{st.label}</span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void openPreview(doc)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
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
