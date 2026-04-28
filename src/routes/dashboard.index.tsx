import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Download, FileText, FolderOpen, LogOut, MessageSquare, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth";
import { dossierStatusMeta, formatDocumentStatusDb } from "@/lib/client-dashboard-ui";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndexPage,
});

type DossierRow = Tables<"dossiers">;
type DocumentRow = Tables<"documents">;
type MessageRow = Tables<"messages">;

function DashboardIndexPage() {
  return <DashboardContent />;
}

function userDisplayName(user: ReturnType<typeof useAuth>["user"]) {
  const raw = user?.user_metadata && typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "";
  const name = raw.trim();
  if (name) return name;
  return user?.email ?? "Votre compte";
}

function montantToNumber(value: number | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function eur(amount: number | string | null | undefined) {
  const n = amount == null ? 0 : typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function DashboardContent() {
  const { user, isAdmin, isExpert, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (isAdmin) {
      navigate({ to: "/admin", replace: true });
      return;
    }
    if (isExpert) {
      navigate({ to: "/expert", replace: true });
    }
  }, [authLoading, isAdmin, isExpert, user, navigate]);

  const [dossiersList, setDossiersList] = useState<DossierRow[]>([]);
  const [dossier, setDossier] = useState<DossierRow | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      const { data: dossierList, error: dErr } = await supabase
        .from("dossiers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (dErr) {
        setError(dErr.message);
        setDossiersList([]);
        setDossier(null);
        setDocuments([]);
        setMessages([]);
        setLoading(false);
        return;
      }

      const list = (dossierList as DossierRow[]) ?? [];
      setDossiersList(list);
      const row = list[0] ?? null;
      if (!row) {
        setDossier(null);
        setDocuments([]);
        setMessages([]);
        setLoading(false);
        return;
      }

      if (cancelled) return;
      setDossier(row);

      const [docRes, msgRes] = await Promise.all([
        supabase.from("documents").select("*").eq("dossier_id", row.id).order("created_at", { ascending: false }),
        supabase.from("messages").select("*").eq("dossier_id", row.id).order("created_at", { ascending: true }),
      ]);

      if (cancelled) return;

      if (docRes.error) {
        toast.error(docRes.error.message);
        setDocuments([]);
      } else {
        setDocuments(docRes.data ?? []);
      }

      if (msgRes.error) {
        toast.error(msgRes.error.message);
        setMessages([]);
      } else {
        setMessages(msgRes.data ?? []);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const statusMeta = dossier ? dossierStatusMeta(dossier.statut) : null;

  const openedLabel = useMemo(() => {
    if (!dossier?.date_ouverture) return "";
    return new Date(dossier.date_ouverture).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [dossier?.date_ouverture]);

  const indemnityLabel = useMemo(() => {
    if (!dossier) return "";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(montantToNumber(dossier.montant_estime));
  }, [dossier]);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

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
      toast.success("Document uploadé.");
      const { data, error: qErr } = await supabase
        .from("documents")
        .select("*")
        .eq("dossier_id", dossier.id)
        .order("created_at", { ascending: false });
      if (qErr) throw qErr;
      setDocuments(data ?? []);
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

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex h-[4.25rem] max-w-5xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/" className="inline-flex shrink-0 items-center gap-2 opacity-90 hover:opacity-100">
            <Logo />
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-5">
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard/nouveau" })}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Nouveau dossier</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-medium text-foreground">{userDisplayName(user)}</p>
              {user?.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">Mon espace client</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Suivez l'avancement de votre dossier et échangez avec votre expert.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && !dossier && (
          <div className="rounded-xl border border-border bg-white p-12 text-center shadow-[var(--shadow-soft)] sm:p-14">
            <FolderOpen className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden />
            <p className="mt-5 text-sm font-medium text-foreground">Aucun dossier trouvé</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Votre espace sera affiché ici dès qu'un dossier aura été créé pour votre compte.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard/nouveau" })}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Créer un dossier
            </button>
          </div>
        )}

        {!loading && !error && dossiersList.length > 0 && (
          <section className="rounded-xl border border-border bg-white p-7 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Mes dossiers</h2>
              </div>
              <p className="text-sm text-muted-foreground">{dossiersList.length} dossier(s)</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {dossiersList.map((d) => {
                const meta = dossierStatusMeta(d.statut);
                return (
                  <Link
                    key={d.id}
                    to="/dashboard/dossiers/$id"
                    params={{ id: d.id }}
                    className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-[var(--shadow-elegant)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{d.type_sinistre}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ouvert le{" "}
                          {new Date(d.date_ouverture).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${meta.toneClass}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-foreground">{eur(d.montant_estime)}</p>
                    <p className="mt-1 text-xs font-medium text-primary">Voir le dossier</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {!loading && dossier && statusMeta && (
          <>
            <section className="rounded-xl border border-border bg-white p-7 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-2.5">
                  <FolderOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Mon dossier</h2>
                </div>
                <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${statusMeta.toneClass}`}>
                  {statusMeta.label}
                </span>
              </div>
              <dl className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date d'ouverture</dt>
                  <dd className="mt-2 text-sm font-medium text-foreground">{openedLabel}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type de sinistre</dt>
                  <dd className="mt-2 text-sm font-medium text-foreground">{dossier.type_sinistre}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Montant estimé d'indemnisation
                  </dt>
                  <dd className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-foreground">{indemnityLabel}</dd>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Estimation indicative basée sur les éléments connus à ce jour.
                  </p>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-white p-7 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Mes documents</h2>
                </div>
                <div>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => void handleDocumentSelected(e)} />
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
              <ul className="mt-2 divide-y divide-border">
                {documents.length === 0 ? (
                  <li className="py-10 text-center text-sm text-muted-foreground">Aucun document pour le moment.</li>
                ) : (
                  documents.map((doc) => {
                    const st = formatDocumentStatusDb(doc.statut);
                    return (
                      <li key={doc.id} className="flex flex-col gap-3 py-5 first:pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            <FileText className="h-4 w-4 text-primary" aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{doc.nom}</p>
                            <p className="text-xs text-muted-foreground">
                              Ajouté le{" "}
                              {new Date(doc.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
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
                  })
                )}
              </ul>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2.5 border-b border-border px-7 py-5 sm:px-8">
                <MessageSquare className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Messages</h2>
              </div>
              <MessagesPanel dossierId={dossier.id} messages={messages} setMessages={setMessages} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function MessagesPanel({
  dossierId,
  messages,
  setMessages,
}: {
  dossierId: string;
  messages: MessageRow[];
  setMessages: Dispatch<SetStateAction<MessageRow[]>>;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          dossier_id: dossierId,
          auteur: "client",
          contenu: text,
        })
        .select()
        .single();
      if (error) throw error;
      setDraft("");
      if (data) {
        setMessages((prev) => [...prev, data]);
      }
      toast.success("Message envoyé.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="max-h-[480px] space-y-4 overflow-y-auto px-7 py-6 sm:px-8">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm leading-relaxed text-muted-foreground">
            Aucun message. Notre équipe vous répondra ici dès la prise en charge.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.auteur === "client";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 sm:max-w-[72%] ${
                    mine ? "bg-primary text-primary-foreground" : "border border-border bg-secondary text-foreground"
                  }`}
                >
                  {!mine && <p className="mb-1 text-[11px] font-medium text-muted-foreground">Expert</p>}
                  <p className="whitespace-pre-line text-sm leading-relaxed">{m.contenu}</p>
                  <p className={`mt-2 text-[10px] tabular-nums ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-3 border-t border-border bg-white px-5 py-4 sm:flex-row sm:items-center sm:px-8 sm:py-5"
      >
        <label htmlFor="dashboard-message" className="sr-only">
          Nouveau message à l'expert
        </label>
        <input
          id="dashboard-message"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrire un message à l'expert..."
          className="min-h-10 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/25"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-45 sm:shrink-0"
        >
          <Send className="h-4 w-4" aria-hidden />
          Envoyer
        </button>
      </form>
    </>
  );
}

