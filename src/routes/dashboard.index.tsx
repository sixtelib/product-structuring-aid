import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, FileText, LogOut, MessageSquare, Plus } from "lucide-react";
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

function greetingNameFromEmail(email?: string | null) {
  const local = (email ?? "").split("@")[0]?.trim();
  return local || "là";
}

function formatRelativeDate(date: Date, now = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });
  if (absSec < 60) return rtf.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
  const diffYear = Math.round(diffMonth / 12);
  return rtf.format(diffYear, "year");
}

const PROCESS_STEPS = ["Qualification", "Analyse", "Négociation", "Indemnisation"] as const;

function statusToActiveStepIndex(statut?: string | null): number {
  switch (statut) {
    case "qualification":
      return 0;
    case "en_analyse":
    case "attente_documents":
    case "en_attente":
      return 1;
    case "negociation":
    case "en_cours":
      return 2;
    case "gagne":
    case "perdu":
      return 3;
    default:
      return 0;
  }
}

function DossierProgressTimeline({ activeIndex }: { activeIndex: number }) {
  return (
    <section className="rounded-[12px] bg-white px-6 py-6 shadow-[var(--shadow-soft)] sm:px-8">
      <div className="flex items-center">
        {PROCESS_STEPS.map((label, idx) => {
          const isActive = idx === activeIndex;
          const isPast = idx < activeIndex;
          const isFuture = idx > activeIndex;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    isPast ? "bg-emerald-500 text-white" : "",
                    isActive ? "bg-[#5B50F0] text-white" : "",
                    isFuture ? "border border-[#E5E7EB] bg-white text-transparent" : "",
                  ].join(" ")}
                  aria-hidden
                >
                  {isPast ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                </div>
                <p
                  className={[
                    "text-[0.85rem] leading-tight",
                    isPast ? "font-medium text-emerald-700" : "",
                    isActive ? "font-semibold text-[#5B50F0]" : "",
                    isFuture ? "font-medium text-[#9CA3AF]" : "",
                  ].join(" ")}
                >
                  {label}
                </p>
              </div>
              {idx !== PROCESS_STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-[#E5E7EB]" aria-hidden />}
            </div>
          );
        })}
      </div>
    </section>
  );
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

  const activeStepIndex = useMemo(() => statusToActiveStepIndex(dossier?.statut ?? null), [dossier?.statut]);
  const latestDocs = useMemo(() => documents.slice(0, 3), [documents]);
  const latestMessages = useMemo(() => (messages.length <= 2 ? messages : messages.slice(-2)), [messages]);

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
            <Logo variant="dark" className="h-8 w-auto" />
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

      <main className="mx-auto max-w-[900px] space-y-6 px-5 py-5 sm:px-10 sm:py-10">
        <div className="space-y-2">
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight text-foreground">
            Bonjour, {greetingNameFromEmail(user?.email)} 👋
          </h1>
          <p className="text-sm leading-relaxed text-[#6B7280]">Voici l'avancement de votre dossier.</p>
        </div>

        <DossierProgressTimeline activeIndex={activeStepIndex} />

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
          <section className="space-y-6">
            <div className="rounded-[16px] bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                <div>
                  <h2 className="text-[1.5rem] font-bold tracking-tight text-foreground">Votre dossier en quelques minutes</h2>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[#6B7280]">
                    Décrivez votre sinistre, uploadez vos documents. Notre IA analyse votre dossier sous 48h.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "Analyse IA de votre contrat",
                      "Identification de la marge de négociation",
                      "Expert dédié assigné sous 48h",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EEE9FF] text-[#5B50F0]">
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="text-sm text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/dashboard/nouveau" })}
                    className="mt-8 inline-flex items-center justify-center rounded-[10px] bg-[#5B50F0] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
                  >
                    Démarrer mon dossier →
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { value: "+27%", label: "Indemnisation moyenne récupérée" },
                    { value: "48h", label: "Pour analyser votre dossier" },
                    { value: "0€", label: "Si nous n'obtenons rien" },
                  ].map((s) => (
                    <div key={s.value} className="rounded-[12px] bg-[#F8F7FF] px-5 py-4">
                      <p className="text-[1.5rem] font-bold leading-none text-[#5B50F0]">{s.value}</p>
                      <p className="mt-1 text-sm text-[#6B7280]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { n: "01", title: "Décrivez votre sinistre", text: "Via notre chatbot en 2 minutes" },
                { n: "02", title: "On analyse tout", text: "IA + expert humain sous 48h" },
                { n: "03", title: "Vous récupérez plus", text: "On négocie, vous encaissez la différence" },
              ].map((c) => (
                <div
                  key={c.n}
                  className="flex items-center gap-5 rounded-[12px] border border-[#F3F4F6] bg-white px-6 py-5"
                >
                  <div className="text-[2.5rem] font-black leading-none text-[#EEE9FF]">{c.n}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{c.title}</p>
                    <p className="mt-1 text-sm text-[#6B7280]">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && dossier && statusMeta && (
          <section className="space-y-6">
            <div className="rounded-[16px] bg-white p-7 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">Mon dossier</p>
                  <h2 className="mt-2 truncate text-[1.5rem] font-bold tracking-tight text-foreground">
                    {dossier.type_sinistre}
                  </h2>
                </div>
                <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${statusMeta.toneClass}`}>
                  {statusMeta.label}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[12px] border border-[#F3F4F6] bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Assureur</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{dossier.assureur_compagnie_nom || "Non renseigné"}</p>
                </div>
                <div className="rounded-[12px] border border-[#F3F4F6] bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Montant estimé</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{indemnityLabel || "Non renseigné"}</p>
                </div>
                <div className="rounded-[12px] border border-[#F3F4F6] bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Date d'ouverture</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{openedLabel || "Non renseigné"}</p>
                </div>
                <div className="rounded-[12px] border border-[#F3F4F6] bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Expert assigné</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{(dossier as any).expert_nom || "Non renseigné"}</p>
                </div>
              </div>

              <div className="mt-6">
                <DossierProgressTimeline activeIndex={activeStepIndex} />
              </div>

              <div className="mt-6">
                <Link
                  to="/dashboard/dossiers/$id"
                  params={{ id: dossier.id }}
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#5B50F0] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
                >
                  Voir mon dossier →
                </Link>
              </div>
            </div>

            <div className="rounded-[16px] bg-white p-7 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">Mes documents</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">{documents.length} document(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => void handleDocumentSelected(e)} />
                  <button
                    type="button"
                    disabled={uploadingDoc}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-[#5B50F0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5] disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    {uploadingDoc ? "Ajout…" : "Ajouter"}
                  </button>
                </div>
              </div>

              <div className="mt-5">
                {latestDocs.length === 0 ? (
                  <p className="rounded-[12px] border border-[#F3F4F6] bg-white px-5 py-5 text-sm text-[#6B7280]">
                    Aucun document pour le moment.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#F3F4F6] rounded-[12px] border border-[#F3F4F6]">
                    {latestDocs.map((doc) => {
                      const st = formatDocumentStatusDb(doc.statut);
                      return (
                        <li key={doc.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F7FF] text-[#5B50F0]">
                              <FileText className="h-4 w-4" aria-hidden />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{doc.nom}</p>
                              <p className="text-xs text-[#6B7280]">
                                {new Date(doc.created_at).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
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
                              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-[#F8F9FF] disabled:opacity-50"
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
              </div>

              <div className="mt-5">
                <Link
                  to="/dashboard/dossiers/$id"
                  params={{ id: dossier.id }}
                  className="text-sm font-semibold text-[#5B50F0] hover:underline"
                >
                  Voir tous mes documents →
                </Link>
              </div>
            </div>

            <div className="rounded-[16px] bg-white p-7 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">Derniers messages</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">{messages.length} message(s)</p>
                </div>
                <Link
                  to="/dashboard/dossiers/$id"
                  params={{ id: dossier.id }}
                  className="text-sm font-semibold text-[#5B50F0] hover:underline"
                >
                  Voir tous les messages →
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {latestMessages.length === 0 ? (
                  <p className="rounded-[12px] border border-[#F3F4F6] bg-white px-5 py-5 text-sm text-[#6B7280]">
                    Aucun message pour le moment.
                  </p>
                ) : (
                  latestMessages.map((m) => {
                    const author = m.auteur === "client" ? "Vous" : "Vertual";
                    const initials =
                      m.auteur === "client"
                        ? (greetingNameFromEmail(user?.email).slice(0, 2) || "VO").toUpperCase()
                        : "V";
                    const created = new Date(m.created_at);
                    return (
                      <div key={m.id} className="flex items-start gap-3 rounded-[12px] border border-[#F3F4F6] bg-white px-5 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F7FF] text-sm font-bold text-[#5B50F0]">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground">{author}</p>
                            <p className="text-xs text-[#9CA3AF]">{formatRelativeDate(created)}</p>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-[#6B7280]">{m.contenu}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
