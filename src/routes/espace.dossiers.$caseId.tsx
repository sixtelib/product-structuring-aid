import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Upload,
  Send,
  FileText,
  Trash2,
  Download,
  MessageSquare,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { StatusBadge } from "@/components/app/StatusBadge";
import { claimTypeLabel } from "@/lib/claim-types";

export const Route = createFileRoute("/espace/dossiers/$caseId")({
  component: EspaceDossierRedirect,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">Erreur : {error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Réessayer
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="rounded-lg border border-border bg-background p-6 text-center">
      <p className="text-muted-foreground">Dossier introuvable.</p>
      <Link
        to="/dashboard"
        className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
      >
        Retour au dashboard
      </Link>
    </div>
  ),
});

function EspaceDossierRedirect() {
  const { caseId } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/dashboard/dossiers/$id", params: { id: caseId }, replace: true });
  }, [caseId, navigate]);
  return null;
}

interface CaseFull {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  claim_type: string;
  status: string;
  insurer_name: string | null;
  policy_number: string | null;
  incident_date: string | null;
  estimated_amount: number | null;
  insurer_offer: number | null;
  obtained_amount: number | null;
  created_at: string;
}

interface DocRow {
  id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  created_at: string;
}

interface EventRow {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface MessageRow {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

type Tab = "timeline" | "documents" | "messages";

function CaseDetailPage() {
  const { caseId } = Route.useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("timeline");
  const [c, setC] = useState<CaseFull | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCaseRows() {
    return Promise.all([
      supabase.from("cases").select("*").eq("id", caseId).maybeSingle(),
      supabase
        .from("case_documents")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("case_events")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("case_messages")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true }),
    ]);
  }

  function applyCaseRows(rows: Awaited<ReturnType<typeof fetchCaseRows>>) {
    const [{ data: caseData }, { data: docData }, { data: eventData }, { data: msgData }] = rows;
    setC(caseData as CaseFull | null);
    setDocs((docData as DocRow[]) ?? []);
    setEvents((eventData as EventRow[]) ?? []);
    setMessages((msgData as MessageRow[]) ?? []);
  }

  async function loadAll() {
    const rows = await fetchCaseRows();
    applyCaseRows(rows);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const rows = await fetchCaseRows();
        if (cancelled) return;
        const [cRes, dRes, eRes, mRes] = rows;
        if (cRes.error) throw cRes.error;
        if (dRes.error) throw dRes.error;
        if (eRes.error) throw eRes.error;
        if (mRes.error) throw mRes.error;
        applyCaseRows(rows);
      } catch (_err: unknown) {
        if (cancelled) return;
        setC(null);
        setDocs([]);
        setEvents([]);
        setMessages([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchCaseRows / applyCaseRows : closure sur caseId
  }, [caseId]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-background p-12 text-center text-sm text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!c) {
    return (
      <div className="rounded-lg border border-border bg-background p-6 text-center">
        <p className="text-muted-foreground">Dossier introuvable.</p>
        <Link
          to="/dashboard"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground">Réf. {c.reference}</p>
          <h1 className="mt-1 font-sans tracking-tight text-3xl font-semibold text-foreground">
            {c.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {claimTypeLabel(c.claim_type)}
            {c.insurer_name ? ` · ${c.insurer_name}` : ""}
            {c.incident_date
              ? ` · sinistre du ${new Date(c.incident_date).toLocaleDateString("fr-FR")}`
              : ""}
          </p>
        </div>
        <StatusBadge status={c.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Préjudice estimé</p>
          <p className="mt-1 font-sans tracking-tight text-2xl font-semibold text-foreground">
            {c.estimated_amount != null
              ? `${Number(c.estimated_amount).toLocaleString("fr-FR")} €`
              : ", "}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Offre assureur</p>
          <p className="mt-1 font-sans tracking-tight text-2xl font-semibold text-foreground">
            {c.insurer_offer != null
              ? `${Number(c.insurer_offer).toLocaleString("fr-FR")} €`
              : ", "}
          </p>
        </div>
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs uppercase tracking-wide text-accent-foreground/70">Obtenu</p>
          <p className="mt-1 font-sans tracking-tight text-2xl font-semibold text-foreground">
            {c.obtained_amount != null
              ? `${Number(c.obtained_amount).toLocaleString("fr-FR")} €`
              : "En cours"}
          </p>
        </div>
      </div>

      {c.description && (
        <div className="mt-4 rounded-lg border border-border bg-background p-5">
          <h3 className="text-sm font-semibold text-foreground">Description</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{c.description}</p>
        </div>
      )}

      <div className="mt-8 border-b border-border">
        <nav className="flex gap-1">
          {(
            [
              { id: "timeline", label: "Suivi", icon: Clock },
              { id: "documents", label: `Documents (${docs.length})`, icon: FileText },
              { id: "messages", label: `Messages (${messages.length})`, icon: MessageSquare },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {tab === "timeline" && <TimelineTab events={events} />}
        {tab === "documents" && (
          <DocumentsTab caseId={caseId} userId={user!.id} docs={docs} onChange={loadAll} />
        )}
        {tab === "messages" && (
          <MessagesTab caseId={caseId} userId={user!.id} messages={messages} onChange={loadAll} />
        )}
      </div>
    </div>
  );
}

function TimelineTab({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
        Aucun événement pour le moment.
      </div>
    );
  }
  return (
    <ol className="relative space-y-6 border-l-2 border-border pl-6">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background" />
          <p className="text-xs text-muted-foreground">
            {new Date(e.created_at).toLocaleString("fr-FR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <h4 className="mt-0.5 font-medium text-foreground">{e.title}</h4>
          {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
        </li>
      ))}
    </ol>
  );
}

function DocumentsTab({
  caseId,
  userId,
  docs,
  onChange,
}: {
  caseId: string;
  userId: string;
  docs: DocRow[];
  onChange: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `${userId}/${caseId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("case-files").upload(path, file);
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from("case_documents").insert({
        case_id: caseId,
        uploaded_by: userId,
        storage_path: path,
        file_name: file.name,
        file_type: file.type || null,
        file_size: file.size,
      });
      if (dbErr) throw dbErr;

      await supabase.from("case_events").insert({
        case_id: caseId,
        actor_id: userId,
        event_type: "document_ajoute",
        title: `Document ajouté : ${file.name}`,
        is_visible_to_client: true,
      });

      toast.success("Document ajouté");
      onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function downloadDoc(doc: DocRow) {
    const { data, error } = await supabase.storage
      .from("case-files")
      .createSignedUrl(doc.storage_path, 60);
    if (error || !data) {
      toast.error("Lien indisponible");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function deleteDoc(doc: DocRow) {
    if (!confirm(`Supprimer "${doc.file_name}" ?`)) return;
    await supabase.storage.from("case-files").remove([doc.storage_path]);
    await supabase.from("case_documents").delete().eq("id", doc.id);
    toast.success("Document supprimé");
    onChange();
  }

  return (
    <div>
      <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">Ajouter un document</p>
        <p className="text-xs text-muted-foreground">
          Police, devis, photos, courriers de l'assureur...
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Upload..." : "Sélectionner un fichier"}
        </button>
        <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
      </div>

      <div className="mt-6 space-y-2">
        {docs.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Aucun document pour le moment.
          </p>
        ) : (
          docs.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{d.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.file_size ? `${(d.file_size / 1024).toFixed(0)} Ko` : ""} ·{" "}
                    {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button
                  onClick={() => downloadDoc(d)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
                  aria-label="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteDoc(d)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MessagesTab({
  caseId,
  userId,
  messages,
  onChange,
}: {
  caseId: string;
  userId: string;
  messages: MessageRow[];
  onChange: () => void;
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("case_messages").insert({
        case_id: caseId,
        sender_id: userId,
        content: content.trim(),
      });
      if (error) throw error;
      setContent("");
      onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="max-h-[500px] space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucun message. Notre équipe vous répondra ici dès la prise en charge.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                    mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{m.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {new Date(m.created_at).toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un message à l'expert..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          Envoyer
        </button>
      </form>
    </div>
  );
}
