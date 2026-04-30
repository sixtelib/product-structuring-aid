import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Download,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { formatDocumentStatusDb } from "@/lib/client-dashboard-ui";
import { DossierAnalyseIA } from "@/components/DossierAnalyseIA";

export const Route = createFileRoute("/admin/dossiers/$dossierId")({
  component: AdminDossierDetailPage,
});

type DossierRow = Tables<"dossiers"> & {
  nom_assure?: string | null;
  prenom_assure?: string | null;
  nom_expert?: string | null;
  prenom_expert?: string | null;
  assureur?: string | null;
};

type DocumentRow = Tables<"documents"> & { chemin?: string | null };
type MessageRow = Tables<"messages">;
type ProfileRow = Pick<Tables<"profiles">, "full_name" | "email">;

const STATUT_OPTIONS = [
  { value: "en_analyse", label: "En analyse" },
  { value: "en_cours", label: "En cours" },
  { value: "négociation", label: "Négociation" },
  { value: "gagné", label: "Gagné" },
  { value: "perdu", label: "Perdu" },
  { value: "clôturé", label: "Clôturé" },
] as const;

function normalize(s: string | null | undefined) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function statusBadgeClass(statut: string | null | undefined) {
  const s = normalize(statut);
  if (s.includes("gagn")) return "bg-green-50 text-green-700";
  if (s.includes("perdu")) return "bg-red-50 text-red-700";
  if (s.includes("negoc")) return "bg-[#EDE9FE] text-[#5B50F0]";
  if (s.includes("analyse")) return "bg-orange-50 text-orange-700";
  if (s.includes("clotur") || s.includes("clos")) return "bg-[#F3F4F6] text-[#6B7280]";
  if (s.includes("en_cours") || s.includes("en cours")) return "bg-blue-50 text-blue-700";
  return "bg-[#F3F4F6] text-[#6B7280]";
}

function eur(n: number | null | undefined) {
  const v = n == null ? 0 : Number(n);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number.isFinite(v) ? v : 0,
  );
}

function dateFr(d: string | null | undefined) {
  if (!d) return "—";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function authorLabel(auteur: string) {
  if (auteur === "admin") return "Administrateur";
  if (auteur === "expert") return "Expert";
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
  const raw = doc as DocumentRow & { storage_path?: string | null };
  const chemin = doc.chemin ?? null;
  const path = chemin ?? raw.storage_path ?? doc.nom;
  return path && String(path).trim() ? String(path).trim() : null;
}

function cardClass() {
  return "rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]";
}

function AdminDossierDetailPage() {
  const { dossierId } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<DossierRow | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [assureProfile, setAssureProfile] = useState<ProfileRow | null>(null);
  const [expertProfile, setExpertProfile] = useState<ProfileRow | null>(null);

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [expertUuid, setExpertUuid] = useState("");
  const [assigningExpert, setAssigningExpert] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: dRow, error: dErr } = await supabase.from("dossiers").select("*").eq("id", dossierId).maybeSingle();
      if (dErr) throw dErr;
      if (!dRow) {
        setDossier(null);
        setDocuments([]);
        setMessages([]);
        setAssureProfile(null);
        setExpertProfile(null);
        return;
      }
      const d = dRow as DossierRow;
      setDossier(d);

      const [docRes, msgRes] = await Promise.all([
        supabase.from("documents").select("*").eq("dossier_id", dossierId),
        supabase.from("messages").select("*").eq("dossier_id", dossierId).order("created_at", { ascending: true }),
      ]);
      if (docRes.error) console.error(docRes.error);
      if (msgRes.error) console.error(msgRes.error);
      setDocuments((docRes.data as DocumentRow[]) ?? []);
      setMessages((msgRes.data as MessageRow[]) ?? []);

      const aRes = await supabase.from("profiles").select("full_name, email").eq("id", d.user_id).maybeSingle();
      if (aRes.error) console.error(aRes.error);
      setAssureProfile((aRes.data as ProfileRow) ?? null);

      let expertProf: ProfileRow | null = null;
      if (d.expert_id) {
        const eRes = await supabase.from("profiles").select("full_name, email").eq("id", d.expert_id).maybeSingle();
        if (eRes.error) console.error(eRes.error);
        expertProf = (eRes.data as ProfileRow) ?? null;
      }
      setExpertProfile(expertProf);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Impossible de charger le dossier.");
      setDossier(null);
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const commission = useMemo(() => {
    if (dossier?.montant_estime == null) return null;
    const n = Number(dossier.montant_estime);
    if (!Number.isFinite(n)) return null;
    return n * 0.1;
  }, [dossier?.montant_estime]);

  const statutSelectOptions = useMemo(() => {
    const base = STATUT_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
    if (dossier?.statut && !base.some((o) => o.value === dossier.statut)) {
      return [{ value: dossier.statut, label: dossier.statut }, ...base];
    }
    return base;
  }, [dossier?.statut]);

  const assureurLabel = dossier?.assureur_nom ?? dossier?.assureur ?? "—";

  const assureNom = useMemo(() => {
    const fromDossier =
      dossier?.nom_assure || dossier?.prenom_assure
        ? `${dossier.prenom_assure ?? ""} ${dossier.nom_assure ?? ""}`.trim()
        : "";
    if (fromDossier) return fromDossier;
    if (assureProfile?.full_name?.trim()) return assureProfile.full_name.trim();
    return "Inconnu";
  }, [dossier?.nom_assure, dossier?.prenom_assure, assureProfile?.full_name]);

  const expertNom = useMemo(() => {
    const fromDossier =
      dossier?.nom_expert || dossier?.prenom_expert
        ? `${dossier.prenom_expert ?? ""} ${dossier.nom_expert ?? ""}`.trim()
        : "";
    if (fromDossier) return fromDossier;
    if (expertProfile?.full_name?.trim()) return expertProfile.full_name.trim();
    return "";
  }, [dossier?.nom_expert, dossier?.prenom_expert, expertProfile?.full_name]);

  async function copyId() {
    if (!dossier?.id) return;
    try {
      await navigator.clipboard.writeText(dossier.id);
      toast.success("ID copié.");
    } catch {
      toast.error("Impossible de copier.");
    }
  }

  async function onStatutChange(statut: string) {
    if (!dossier || !statut) return;
    setStatusUpdating(true);
    try {
      const { error } = await supabase.from("dossiers").update({ statut }).eq("id", dossierId);
      if (error) throw error;
      setDossier((prev) => (prev ? { ...prev, statut } : prev));
      toast.success("Statut mis à jour.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mise à jour impossible.");
    } finally {
      setStatusUpdating(false);
    }
  }

  async function confirmAssignExpert() {
    const id = expertUuid.trim();
    if (!id || !dossier) return;
    setAssigningExpert(true);
    try {
      const { error } = await supabase.from("dossiers").update({ expert_id: id }).eq("id", dossierId);
      if (error) throw error;
      setExpertUuid("");
      toast.success("Expert assigné.");
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Assignation impossible.");
    } finally {
      setAssigningExpert(false);
    }
  }

  async function downloadDoc(doc: DocumentRow) {
    const path = storagePathFor(doc);
    if (!path) {
      toast.error("Chemin de fichier manquant.");
      return;
    }
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw error ?? new Error("Lien indisponible (storage).");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Téléchargement impossible.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function sendMessage() {
    const text = messageText.trim();
    if (!text) return;
    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        dossier_id: dossierId,
        auteur: "admin",
        contenu: text,
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
        <Link to="/admin/dossiers" className="mt-4 inline-block text-sm font-semibold text-[#5B50F0] hover:underline">
          ← Retour aux dossiers
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FF] pb-12">
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/dossiers" })}
          className="inline-flex items-center gap-2 font-medium text-[#5B50F0] hover:underline"
          style={{ fontSize: "0.875rem" }}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          ← Dossiers
        </button>

        <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">{dossier.type_sinistre}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(dossier.statut)}`}>
              {dossier.statut}
            </span>
            <div className="relative">
              <select
                aria-label="Modifier le statut"
                disabled={statusUpdating}
                value={dossier.statut}
                onChange={(e) => void onStatutChange(e.target.value)}
                className="h-10 min-w-[180px] appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-9 text-sm font-semibold text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20 disabled:opacity-60"
              >
                {statutSelectOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">▾</span>
            </div>
          </div>
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
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Date d'ouverture</dt>
                <dd className="mt-1 text-sm font-medium text-[#111827]">{dateFr(dossier.date_ouverture)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Type de sinistre</dt>
                <dd className="mt-1 text-sm font-medium text-[#111827]">{dossier.type_sinistre}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Statut</dt>
                <dd className="mt-1 text-sm font-medium text-[#111827]">{dossier.statut}</dd>
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
              <Users className="h-5 w-5 text-[#5B50F0]" aria-hidden />
              <h2 className="text-lg font-semibold text-[#111827]">Parties prenantes</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Assuré</h3>
                <p className="mt-2 text-sm text-[#374151]">{assureNom}</p>
                {assureProfile?.email ? (
                  <p className="mt-1 text-sm text-[#6B7280]">{assureProfile.email}</p>
                ) : null}
                <Link
                  to="/admin/utilisateurs/$userId"
                  params={{ userId: dossier.user_id }}
                  className="mt-3 inline-flex text-sm font-semibold text-[#5B50F0] hover:underline"
                >
                  Voir profil →
                </Link>
              </div>

              <div className="border-t border-[#F3F4F6] pt-6">
                <h3 className="text-sm font-semibold text-[#111827]">Expert</h3>
                {dossier.expert_id ? (
                  <>
                    <p className="mt-2 text-sm text-[#374151]">{expertNom || "—"}</p>
                    {expertProfile?.email ? <p className="mt-1 text-sm text-[#6B7280]">{expertProfile.email}</p> : null}
                    <Link
                      to="/admin/utilisateurs/$userId"
                      params={{ userId: dossier.expert_id }}
                      className="mt-3 inline-flex text-sm font-semibold text-[#5B50F0] hover:underline"
                    >
                      Voir profil →
                    </Link>
                  </>
                ) : (
                  <div className="mt-2 space-y-3">
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Non assigné
                    </span>
                    <p className="text-sm font-semibold text-[#111827]">Assigner un expert</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        value={expertUuid}
                        onChange={(e) => setExpertUuid(e.target.value)}
                        placeholder="UUID de l'expert"
                        className="h-10 w-full flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20 sm:max-w-md"
                      />
                      <button
                        type="button"
                        disabled={!expertUuid.trim() || assigningExpert}
                        onClick={() => void confirmAssignExpert()}
                        className="h-10 shrink-0 rounded-lg bg-[#5B50F0] px-4 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                      >
                        {assigningExpert ? "…" : "Confirmer"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

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
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {docIcon(doc.nom)}
                      <span className="truncate text-sm font-medium text-[#111827]">{doc.nom}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${st.className}`}>{st.label}</span>
                    </div>
                    <button
                      type="button"
                      disabled={downloadingId === doc.id}
                      onClick={() => void downloadDoc(doc)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#5B50F0] bg-white px-3 py-2 text-sm font-semibold text-[#5B50F0] hover:bg-[#F5F3FF] disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      Télécharger
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

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
                      <p className="text-xs font-semibold text-[#6B7280]">{authorLabel(m.auteur)}</p>
                      <p className="mt-2 whitespace-pre-wrap leading-relaxed">{m.contenu}</p>
                      <p className="mt-2 text-[11px] text-[#6B7280]">
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: fr })}
                      </p>
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
              Envoyer →
            </button>
          </div>
        </section>

        <DossierAnalyseIA
          dossier={{
            id: dossier.id,
            type_sinistre: dossier.type_sinistre,
            montant_estime: Number(dossier.montant_estime),
            statut: dossier.statut,
            assureur: (dossier.assureur_nom ?? dossier.assureur) ?? undefined,
            description: dossier.description ?? undefined,
            nom_assure: dossier.nom_assure ?? undefined,
            prenom_assure: dossier.prenom_assure ?? undefined,
          }}
          documents={documents.map((d) => ({
            id: d.id,
            nom: d.nom,
            chemin: d.chemin ?? (d as DocumentRow & { storage_path?: string | null }).storage_path ?? undefined,
          }))}
        />
      </div>
    </div>
  );
}
