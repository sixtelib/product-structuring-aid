import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileText, MessageSquare, Save, Send, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Tables } from "@/integrations/supabase/types";
import { useDossierSummary } from "@/hooks/useDossierSummary";
import { DossierAnalyseIA } from "@/components/DossierAnalyseIA";

export const Route = createFileRoute("/expert/dossiers/$id")({
  component: ExpertDossierDetailPage,
});

type DossierRow = Tables<"dossiers">;
type DocumentRow = Tables<"documents">;
type MessageRow = Tables<"messages">;
type ProfileRow = Tables<"profiles">;

function renderInlineMarkdown(text: string) {
  const nodes: Array<string | JSX.Element> = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(<strong key={`b-${match.index}`}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderMarkdown(text: string) {
  return text
    .split(/\r?\n/)
    .map((raw, idx) => {
      const line = raw.trimEnd();
      if (!line.trim()) return null;
      if (line.trim() === "---") return <hr key={`hr-${idx}`} className="my-3 border-border" />;
      if (line.startsWith("## ")) {
        return (
          <h2 key={`h2-${idx}`} className="mt-4 text-base font-semibold text-foreground">
            {renderInlineMarkdown(line.slice(3))}
          </h2>
        );
      }
      return (
        <p key={`p-${idx}`} className="mt-2 text-sm leading-relaxed text-foreground">
          {renderInlineMarkdown(line)}
        </p>
      );
    })
    .filter(Boolean);
}

function statusBadge(statut: string) {
  const bucket =
    statut === "attente_documents"
      ? "waiting"
      : statut === "gagne" || statut === "perdu" || statut === "clos"
        ? "closed"
        : "active";
  if (bucket === "waiting") return { label: "En attente", cls: "bg-accent/10 text-accent" };
  if (bucket === "closed") return { label: "Clos", cls: "bg-muted text-muted-foreground" };
  return { label: "En cours", cls: "bg-sky-500/10 text-sky-700" };
}

function eur(amount: number | string | null | undefined) {
  const n = amount == null ? 0 : typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function ExpertDossierDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<DossierRow | null>(null);
  const [assure, setAssure] = useState<ProfileRow | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [mandatDocuments, setMandatDocuments] = useState<DocumentRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const summaryInput = useMemo(() => {
    if (!dossier) return null;
    return {
      id: dossier.id,
      type_sinistre: dossier.type_sinistre,
      statut: dossier.statut,
      montant_estime: dossier.montant_estime,
      description: dossier.description,
      assureur_nom: dossier.assureur_nom,
      date_sinistre: dossier.date_sinistre,
      date_ouverture: dossier.date_ouverture,
      documents: documents.map((d) => ({ nom: d.nom, statut: d.statut, created_at: d.created_at })),
    };
  }, [dossier, documents]);

  const { summary, loading: summaryLoading, error: summaryError, generate } = useDossierSummary(summaryInput);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);

      const { data: d, error: dErr } = await supabase
        .from("dossiers")
        .select("*, analyse_ia, analyse_ia_date")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (dErr) {
        toast.error(dErr.message);
        setDossier(null);
        setMandatDocuments([]);
        setLoading(false);
        return;
      }
      if (!d) {
        setDossier(null);
        setMandatDocuments([]);
        setLoading(false);
        return;
      }

      setDossier(d as DossierRow);
      setNotes((d as any).notes_expert ?? "");

      const [pRes, docRes, msgRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", (d as any).user_id).maybeSingle(),
        supabase.from("documents").select("*").eq("dossier_id", id).order("created_at", { ascending: false }),
        supabase.from("messages").select("*").eq("dossier_id", id).order("created_at", { ascending: true }),
      ]);

      if (cancelled) return;

      if (pRes.error) toast.error(pRes.error.message);
      setAssure((pRes.data as ProfileRow | null) ?? null);

      if (docRes.error) toast.error(docRes.error.message);
      setDocuments((docRes.data as DocumentRow[]) ?? []);

      const { data: mandatRows, error: mandatErr } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", (d as DossierRow).user_id)
        .eq("type", "mandat");
      if (mandatErr) console.error(mandatErr);
      setMandatDocuments((mandatRows as DocumentRow[]) ?? []);

      if (msgRes.error) toast.error(msgRes.error.message);
      setMessages((msgRes.data as MessageRow[]) ?? []);

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  const header = useMemo(() => {
    if (!dossier) return null;
    const badge = statusBadge(dossier.statut);
    return {
      badge,
      opened: new Date(dossier.date_ouverture).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
      amount: eur(dossier.montant_estime),
    };
  }, [dossier]);

  const dossierAnalysePayload = useMemo(() => {
    if (!dossier) return null;
    const full = (assure?.full_name ?? "").trim();
    const parts = full.split(/\s+/).filter(Boolean);
    const prenom_assure = parts.length > 1 ? parts[0] : undefined;
    const nom_assure = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
    return {
      dossier: {
        id: dossier.id,
        type_sinistre: dossier.type_sinistre,
        montant_estime: Number(dossier.montant_estime),
        statut: dossier.statut,
        assureur: dossier.assureur_nom ?? undefined,
        description: dossier.description ?? undefined,
        nom_assure: nom_assure ?? undefined,
        prenom_assure: prenom_assure,
        analyse_ia: (dossier as any).analyse_ia ?? null,
        analyse_ia_date: (dossier as any).analyse_ia_date ?? null,
      },
      documents: documents.map((d) => ({
        id: d.id,
        nom: d.nom,
        chemin: d.storage_path ?? undefined,
      })),
    };
  }, [dossier, assure, documents]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({ dossier_id: id, auteur: "expert", contenu: text })
        .select()
        .single();
      if (error) throw error;
      setDraft("");
      if (data) setMessages((prev) => [...prev, data as MessageRow]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  async function saveNotes() {
    if (!dossier) return;
    setSavingNotes(true);
    try {
      const { error } = await supabase.from("dossiers").update({ notes_expert: notes }).eq("id", dossier.id);
      if (error) throw error;
      toast.success("Notes sauvegardées.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de sauvegarder les notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function downloadDoc(doc: DocumentRow) {
    if (!doc.storage_path) {
      toast.error("Chemin de fichier manquant.");
      return;
    }
    setDownloadingPath(doc.storage_path);
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 60);
      if (error || !data?.signedUrl) throw error ?? new Error("Lien indisponible");
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de télécharger le document.");
    } finally {
      setDownloadingPath(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/expert" })}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          Retour
        </button>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Aller au dashboard client
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : !dossier || !header ? (
        <div className="rounded-xl border border-border bg-white p-10 text-center shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-foreground">Dossier introuvable</p>
          <p className="mt-2 text-sm text-muted-foreground">Vérifiez l'identifiant ou vos droits d'accès.</p>
        </div>
      ) : (
        <>
          {/* 1) Header dossier */}
          <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dossier</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{dossier.type_sinistre}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${header.badge.cls}`}>
                    {header.badge.label}
                  </span>
                  <span className="text-sm text-muted-foreground">Ouvert le {header.opened}</span>
                  <span className="text-sm font-semibold text-foreground">{header.amount}</span>
                </div>
              </div>

              <div className="w-full max-w-sm rounded-xl border border-border bg-secondary p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assuré</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{assure?.full_name || ", "}</p>
                <p className="mt-1 text-sm text-muted-foreground">{assure?.id ? `Email : ${assure.id}` : "Email : , "}</p>
                <p className="mt-1 text-sm text-muted-foreground">{assure?.phone ? `Téléphone : ${assure.phone}` : "Téléphone : , "}</p>
                {dossier.user_id ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/admin/utilisateurs/$userId",
                        params: { userId: String(dossier.user_id) },
                      })
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-white px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                  >
                    Voir profil
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          {/* Résumé IA */}
          <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-lg" aria-hidden>
                  ✨
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Résumé IA</h2>
              </div>
              <button
                type="button"
                onClick={() => void generate()}
                disabled={summaryLoading || !summaryInput}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
              >
                {summaryLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Génération…
                  </span>
                ) : (
                  "✨ Générer le résumé IA"
                )}
              </button>
            </div>

            {summaryError && <p className="mt-4 text-sm text-destructive">{summaryError}</p>}

            {summary && (
              <div className="mt-5 rounded-xl border border-dashed border-primary bg-[#F5F3FF] p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg" aria-hidden>
                    ✨
                  </span>
                  <div className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">
                    {renderMarkdown(summary)}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Mandat de représentation (hors dossier) */}
          {mandatDocuments.length > 0 ? (
            <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex items-center gap-2.5 border-b border-border pb-4">
                <Shield className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Mandat de représentation</h2>
              </div>
              <ul className="mt-4 divide-y divide-border">
                {mandatDocuments.map((doc) => (
                  <li key={doc.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{doc.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        Signé
                      </span>
                      <button
                        type="button"
                        onClick={() => void downloadDoc(doc)}
                        disabled={!doc.storage_path || downloadingPath === doc.storage_path}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-transparent px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* 2) Documents */}
          <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex items-center gap-2.5 border-b border-border pb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Documents</h2>
            </div>
            {documents.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">Aucun document uploadé.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{doc.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {doc.statut}
                      </span>
                      <button
                        type="button"
                        onClick={() => void downloadDoc(doc)}
                        disabled={!doc.storage_path || downloadingPath === doc.storage_path}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-transparent px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 3) Messagerie */}
          <section className="overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2.5 border-b border-border px-6 py-4 sm:px-8">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Messagerie</h2>
            </div>
            <div className="max-h-[420px] space-y-4 overflow-y-auto px-6 py-6 sm:px-8">
              {messages.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun message.</p>
              ) : (
                messages.map((m) => {
                  const mine = m.auteur === "expert";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${
                          mine
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-secondary text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.contenu}</p>
                        <p className={`mt-2 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={(e) => void sendMessage(e)} className="flex gap-3 border-t border-border bg-white px-5 py-4 sm:px-8">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Écrire un message à l'assuré..."
                className="min-h-10 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/25"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-45"
              >
                <Send className="h-4 w-4" />
                Envoyer
              </button>
            </form>
          </section>

          {dossierAnalysePayload ? (
            <DossierAnalyseIA dossier={dossierAnalysePayload.dossier} documents={dossierAnalysePayload.documents} />
          ) : null}

          {/* 4) Notes internes */}
          <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interne</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Notes internes</h2>
              </div>
              <button
                type="button"
                onClick={() => void saveNotes()}
                disabled={savingNotes}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-transparent px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Sauvegarder les notes
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Notes visibles uniquement par vous (expert)…"
              className="mt-5 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/25"
            />
          </section>
        </>
      )}
    </div>
  );
}

