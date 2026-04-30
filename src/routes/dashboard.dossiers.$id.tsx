import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, FileText, FolderOpen, MessageSquare, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { AppGuard } from "@/components/app/AppGuard";
import { useAuth } from "@/lib/auth";
import { dossierStatusMeta, formatDocumentStatusDb } from "@/lib/client-dashboard-ui";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useDossierSummary } from "@/hooks/useDossierSummary";

export const Route = createFileRoute("/dashboard/dossiers/$id")({
  component: ClientDossierDetailPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen bg-[#F8F9FF]">
        <main className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8 sm:py-14">
          <div className="rounded-xl border border-destructive/30 bg-white p-8 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold text-destructive">Erreur : {error.message}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  router.invalidate();
                  reset();
                }}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                Réessayer
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border-2 border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  },
});

type DossierRow = Tables<"dossiers">;
type DocumentRow = Tables<"documents">;
type MessageRow = Tables<"messages">;

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

function eur(amount: number | string | null | undefined) {
  const n = amount == null ? 0 : typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function ClientDossierDetailPage() {
  return (
    <AppGuard signInRedirect="/login">
      <ClientDossierDetailContent />
    </AppGuard>
  );
}

function ClientDossierDetailContent() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<DossierRow | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

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

  const { summary, loading: summaryLoading, error: summaryError, generate } = useDossierSummary(summaryInput, {
    audience: "assure",
  });

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data: d, error: dErr } = await supabase.from("dossiers").select("*").eq("id", id).maybeSingle();
      if (cancelled) return;
      if (dErr) {
        toast.error(dErr.message);
        setDossier(null);
        setLoading(false);
        return;
      }
      if (!d) {
        setDossier(null);
        setLoading(false);
        return;
      }

      setDossier(d as DossierRow);

      const [docRes, msgRes] = await Promise.all([
        supabase.from("documents").select("*").eq("dossier_id", id).order("created_at", { ascending: false }),
        supabase.from("messages").select("*").eq("dossier_id", id).order("created_at", { ascending: true }),
      ]);

      if (cancelled) return;
      if (docRes.error) toast.error(docRes.error.message);
      if (msgRes.error) toast.error(msgRes.error.message);
      setDocuments((docRes.data as DocumentRow[]) ?? []);
      setMessages((msgRes.data as MessageRow[]) ?? []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  const header = useMemo(() => {
    if (!dossier) return null;
    const meta = dossierStatusMeta(dossier.statut);
    return {
      meta,
      opened: new Date(dossier.date_ouverture).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
      amount: eur(dossier.montant_estime),
    };
  }, [dossier]);

  async function handleDocumentSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !dossier) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Format non accepté. Utilisez PDF, JPG ou PNG.");
      return;
    }
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("Fichier trop volumineux. Taille max : 10MB.");
      return;
    }

    setUploadingDoc(true);
    try {
      const safeName = file.name.replace(/[^\w.\- ()[\]]+/g, "_");
      const path = `dossiers/${dossier.id}/${Date.now()}-${safeName}`;
      const up = await supabase.storage.from("documents").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (up.error) throw up.error;

      const { error: insErr } = await supabase.from("documents").insert({
        dossier_id: dossier.id,
        nom: file.name,
        storage_path: path,
        statut: "recu",
      });
      if (insErr) throw insErr;

      const { data, error: qErr } = await supabase
        .from("documents")
        .select("*")
        .eq("dossier_id", dossier.id)
        .order("created_at", { ascending: false });
      if (qErr) throw qErr;
      setDocuments((data as DocumentRow[]) ?? []);
      toast.success("Document uploadé.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'uploader le document.");
    } finally {
      setUploadingDoc(false);
    }
  }

  async function downloadDocument(doc: DocumentRow) {
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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({ dossier_id: id, auteur: "client", contenu: text })
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

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <main className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            Retour
          </button>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Retour à l'espace client
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : !dossier || !header ? (
          <div className="rounded-xl border border-border bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <FolderOpen className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-sm font-medium text-foreground">Dossier introuvable</p>
          </div>
        ) : (
          <>
            {/* 1) Header */}
            <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dossier</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{dossier.type_sinistre}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${header.meta.toneClass}`}>
                      {header.meta.label}
                    </span>
                    <span className="text-sm text-muted-foreground">Ouvert le {header.opened}</span>
                    <span className="text-sm font-semibold text-foreground">{header.amount}</span>
                  </div>
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

            {/* 2) Documents */}
            <section className="rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-primary" aria-hidden />
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Mes documents</h2>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={(e) => void handleDocumentSelected(e)}
                  />
                  <button
                    type="button"
                    disabled={uploadingDoc}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    {uploadingDoc ? "Ajout…" : "Ajouter un document"}
                  </button>
                </div>
              </div>

              {documents.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">Aucun document uploadé.</p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {documents.map((doc) => {
                    const st = formatDocumentStatusDb(doc.statut);
                    return (
                      <li key={doc.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{doc.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${st.className}`}>{st.label}</span>
                          <button
                            type="button"
                            onClick={() => void downloadDocument(doc)}
                            disabled={!doc.storage_path || downloadingPath === doc.storage_path}
                            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-transparent px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                          >
                            <Download className="h-4 w-4" />
                            Télécharger
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* 3) Messagerie */}
            <section className="overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2.5 border-b border-border px-6 py-4 sm:px-8">
                <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
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
                            mine ? "bg-primary text-primary-foreground" : "border border-border bg-secondary text-foreground"
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
                  placeholder="Écrire un message…"
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
          </>
        )}
      </main>
    </div>
  );
}

