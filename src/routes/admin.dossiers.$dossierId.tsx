import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Component, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Download, FileText, Image as ImageIcon, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { nomPrenomExpertFromFullName } from "@/lib/expertFullNameSplit";
import { DossierAnalyseIA } from "@/components/DossierAnalyseIA";
import { DossierDocumentsSection } from "@/components/admin/DossierDocumentsSection";
import { DossierInfosCard } from "@/components/admin/DossierInfosCard";
import { DossierMessagerieSection } from "@/components/admin/DossierMessagerieSection";
import { DossierPartiesCard } from "@/components/admin/DossierPartiesCard";
import type { Document, Dossier, Expert, Message, ProfileShort } from "@/types";
import { formaterDate, formaterStatut } from "@/utils/calculs";

export const Route = createFileRoute("/admin/dossiers/$dossierId")({
  component: AdminDossierDetailPage,
});

const STATUT_OPTIONS = [
  { value: "en_analyse", label: "En analyse" },
  { value: "en_cours", label: "En cours" },
  { value: "négociation", label: "Négociation" },
  { value: "gagné", label: "Gagné" },
  { value: "perdu", label: "Perdu" },
  { value: "clôturé", label: "Clôturé" },
] as const;

function cardClass() {
  return "rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]";
}

function mandatDocIcon(nom: string) {
  const lower = nom.toLowerCase();
  if (lower.endsWith(".pdf")) return <FileText className="h-5 w-5 shrink-0 text-red-600" aria-hidden />;
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(lower))
    return <ImageIcon className="h-5 w-5 shrink-0 text-[#5B50F0]" aria-hidden />;
  return <FileText className="h-5 w-5 shrink-0 text-[#6B7280]" aria-hidden />;
}

function storagePathFor(doc: Document): string | null {
  const raw = doc as Document & { storage_path?: string | null };
  const chemin = doc.chemin ?? null;
  const path = chemin ?? raw.storage_path ?? doc.nom;
  return path && String(path).trim() ? String(path).trim() : null;
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
            <p className="mt-1">Une erreur s&apos;est produite dans cette section. Le reste du dossier reste disponible.</p>
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

function AdminDossierDetailPage() {
  const { dossierId } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [mandatDocuments, setMandatDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [assureProfile, setAssureProfile] = useState<ProfileShort | null>(null);
  const [expertProfile, setExpertProfile] = useState<ProfileShort | null>(null);

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setExperts([]);
    try {
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
        setExpertProfile(null);
        return;
      }
      const d = dRow as Dossier;
      setDossier(d);

      const [docRes, msgRes] = await Promise.all([
        supabase.from("documents").select("*").eq("dossier_id", dossierId),
        supabase.from("messages").select("*").eq("dossier_id", dossierId).order("created_at", { ascending: true }),
      ]);
      if (docRes.error) console.error(docRes.error);
      if (msgRes.error) console.error(msgRes.error);
      setDocuments((docRes.data as Document[]) ?? []);
      setMessages((msgRes.data as Message[]) ?? []);

      const { data: mandatRows, error: mandatErr } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", d.user_id)
        .eq("type", "mandat");
      if (mandatErr) console.error(mandatErr);
      setMandatDocuments((mandatRows as Document[]) ?? []);

      const aRes = await supabase.from("profiles").select("full_name, email").eq("id", d.user_id).maybeSingle();
      if (aRes.error) console.error(aRes.error);
      setAssureProfile((aRes.data as ProfileShort) ?? null);

      let expertProf: ProfileShort | null = null;
      if (d.expert_id) {
        const eRes = await supabase.from("profiles").select("full_name, email").eq("id", d.expert_id).maybeSingle();
        if (eRes.error) console.error(eRes.error);
        expertProf = (eRes.data as ProfileShort) ?? null;
      }
      setExpertProfile(expertProf);

      const profRes = await supabase.from("profiles").select("id, full_name, role, specialite").eq("role", "expert");
      let expertsList: Expert[] = [];
      if (!profRes.error && profRes.data && profRes.data.length > 0) {
        expertsList = profRes.data as Expert[];
      } else {
        const dRes = await supabase
          .from("dossiers")
          .select("expert_id, nom_expert, prenom_expert")
          .not("expert_id", "is", null);
        if (!dRes.error && dRes.data) {
          const seen = new Map<string, Expert>();
          for (const row of dRes.data as Array<{ expert_id: string | null; nom_expert: string | null; prenom_expert: string | null }>) {
            const eid = row.expert_id;
            if (!eid || seen.has(eid)) continue;
            seen.set(eid, {
              id: eid,
              expert_id: eid,
              full_name: null,
              nom_expert: row.nom_expert,
              prenom_expert: row.prenom_expert,
              role: "expert",
              specialite: null,
            });
          }
          expertsList = Array.from(seen.values());
        }
      }
      setExperts(expertsList);
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

  const statutSelectOptions = useMemo(() => {
    const base = STATUT_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
    if (dossier?.statut && !base.some((o) => o.value === dossier.statut)) {
      return [{ value: dossier.statut, label: dossier.statut }, ...base];
    }
    return base;
  }, [dossier?.statut]);

  const headerTitle = useMemo(() => {
    if (!dossier) return "";
    const nom = (dossier.nom_assure ?? "").trim();
    const prenom = (dossier.prenom_assure ?? "").trim();
    if (nom && prenom) return `${prenom} ${nom}`;
    return `Dossier ${dossier.type_sinistre}`;
  }, [dossier]);

  const headerSubtitle = useMemo(() => {
    if (!dossier) return null;
    const type = dossier.type_sinistre;
    const ds = (dossier.date_sinistre ?? "").trim();
    const suffix = ds ? ` · Sinistre du ${formaterDate(ds)}` : ` · Ouvert le ${formaterDate(dossier.date_ouverture)}`;
    return { type, suffix };
  }, [dossier]);

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

  const handleAssignExpert = useCallback(
    async (expertId: string) => {
      const id = expertId.trim();
      if (!id || !dossier) return;
      try {
        const expert = experts.find((ex) => String(ex.id ?? ex.expert_id) === id);
        let nom_expert = "";
        let prenom_expert = "";
        if (expert) {
          const fn = String(expert.full_name ?? "").trim();
          if (fn) {
            const split = nomPrenomExpertFromFullName(fn);
            nom_expert = split.nom_expert;
            prenom_expert = split.prenom_expert;
          } else {
            nom_expert = String(expert.nom_expert ?? "").trim();
            prenom_expert = String(expert.prenom_expert ?? "").trim();
          }
        }
        const { error } = await supabase.from("dossiers").update({ expert_id: id, nom_expert, prenom_expert }).eq("id", dossierId);
        if (error) throw error;
        toast.success("Expert assigné.");
        await loadAll();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Assignation impossible.");
        throw e;
      }
    },
    [dossier, dossierId, experts, loadAll],
  );

  async function downloadDoc(doc: Document) {
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

  const handleEnvoyerMessage = useCallback(
    async (contenu: string) => {
      const text = contenu.trim();
      if (!text) return;
      const { error } = await supabase.from("messages").insert({
        dossier_id: dossierId,
        auteur: "admin",
        contenu: text,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      const { data: msgData, error: qErr } = await supabase
        .from("messages")
        .select("*")
        .eq("dossier_id", dossierId)
        .order("created_at", { ascending: true });
      if (qErr) throw qErr;
      setMessages((msgData as Message[]) ?? []);
    },
    [dossierId],
  );

  const handleEnvoyerMessageWithToast = useCallback(
    async (contenu: string) => {
      try {
        await handleEnvoyerMessage(contenu);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Envoi impossible.");
        throw e;
      }
    },
    [handleEnvoyerMessage],
  );

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

  const statutFmt = formaterStatut(dossier.statut);

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
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">{headerTitle}</h1>
            {headerSubtitle ? (
              <p className="mt-2 text-sm">
                <span className="text-[#6B7280]">{headerSubtitle.type}</span>
                <span className="text-[#6B7280]">{headerSubtitle.suffix}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: statutFmt.bg, color: statutFmt.color }}
            >
              {statutFmt.label}
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
          <DossierInfosCard dossier={dossier} />
          <DossierPartiesCard
            key={dossierId}
            dossier={dossier}
            experts={experts}
            assureProfile={assureProfile}
            expertProfile={expertProfile}
            onAssignerExpert={handleAssignExpert}
          />
        </div>

        <DossierDocumentsSection documents={documents} onTelecharger={downloadDoc} onApercu={() => {}} />

        {mandatDocuments.length > 0 ? (
          <section className={`${cardClass()} mt-6`}>
            <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
              <Shield className="h-5 w-5 text-[#5B50F0]" aria-hidden />
              <h2 className="text-lg font-semibold text-[#111827]">Mandat de représentation</h2>
            </div>
            <ul className="space-y-3">
              {mandatDocuments.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {mandatDocIcon(doc.nom)}
                    <span className="truncate text-sm font-medium text-[#111827]">{doc.nom}</span>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Signé
                    </span>
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

        <DossierMessagerieSection
          dossierId={dossierId}
          messages={messages}
          onEnvoyerMessage={handleEnvoyerMessageWithToast}
          onMessagesUpdated={setMessages}
        />

        <DossierAnalyseIAErrorBoundary key={dossierId}>
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
              analyse_ia: (dossier as Dossier & { analyse_ia?: string | null }).analyse_ia ?? null,
              analyse_ia_date: (dossier as Dossier & { analyse_ia_date?: string | null }).analyse_ia_date ?? null,
            }}
            documents={documents.map((d) => ({
              id: d.id,
              nom: d.nom,
              chemin: d.chemin ?? (d as Document & { storage_path?: string | null }).storage_path ?? undefined,
            }))}
          />
        </DossierAnalyseIAErrorBoundary>
      </div>
    </div>
  );
}
