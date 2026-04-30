import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileText, Shield, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/utilisateurs/$userId")({
  component: AdminUtilisateurDetailPage,
});

type DossierRow = Tables<"dossiers">;
type DocumentRow = Tables<"documents">;
type ProfileRow = Tables<"profiles">;

type UiRole = "assure" | "expert" | "admin";

function AdminUtilisateurDetailPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Pick<ProfileRow, "id" | "email" | "role"> | null>(null);
  const [dossiers, setDossiers] = useState<
    Array<Pick<DossierRow, "id" | "statut" | "type_sinistre" | "date_ouverture" | "montant_estime" | "expert_id">>
  >([]);
  const [documents, setDocuments] = useState<
    Array<Pick<DocumentRow, "id" | "nom" | "statut" | "dossier_id" | "storage_path">>
  >([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Optional profile fetch (may be blocked by RLS in some setups)
        try {
          const { data: p, error: pErr } = await supabase.from("profiles").select("id, email, role").eq("id", userId).maybeSingle();
          if (!pErr && p) {
            if (!cancelled) setProfile(p as any);
          }
        } catch {
          // ignore
        }

        const { data: dossierRows, error: dErr } = await supabase
          .from("dossiers")
          .select("id, statut, type_sinistre, date_ouverture, montant_estime, expert_id")
          .eq("user_id", userId)
          .order("date_ouverture", { ascending: false });
        if (dErr) throw dErr;

        const list =
          (dossierRows as Array<
            Pick<DossierRow, "id" | "statut" | "type_sinistre" | "date_ouverture" | "montant_estime" | "expert_id">
          >) ?? [];
        if (cancelled) return;
        setDossiers(list);

        const dossierIds = list.map((d) => d.id).filter(Boolean);
        if (dossierIds.length === 0) {
          setDocuments([]);
          return;
        }

        const { data: docRows, error: docErr } = await supabase
          .from("documents")
          .select("id, nom, statut, dossier_id, storage_path")
          .in("dossier_id", dossierIds);
        if (docErr) throw docErr;

        if (!cancelled) {
          setDocuments(
            ((docRows as Array<Pick<DocumentRow, "id" | "nom" | "statut" | "dossier_id" | "storage_path">>) ?? []).sort((a, b) =>
              String(a.nom ?? "").localeCompare(String(b.nom ?? "")),
            ),
          );
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur de chargement.");
          setDossiers([]);
          setDocuments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function roleLabel(role: UiRole) {
    if (role === "admin") return "Admin";
    if (role === "expert") return "Expert";
    return "Assuré";
  }

  function roleBadgeClass(role: UiRole) {
    if (role === "admin") return "bg-[#111827] text-white";
    if (role === "expert") return "bg-[#EDE9FE] text-[#5B50F0]";
    return "bg-[#DBEAFE] text-[#1D4ED8]";
  }

  function normalize(s: string | null | undefined) {
    return (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function statusKind(raw: string | null | undefined): "won" | "lost" | "in_progress" | "other" {
    const st = normalize(raw);
    if (st.includes("gagn") || st.includes("clotur")) return "won";
    if (st.includes("perdu") || st.includes("refus") || st.includes("echec")) return "lost";
    if (st === "en_cours" || st === "en cours" || st.includes("en_cours")) return "in_progress";
    return "other";
  }

  function statusBadge(kind: ReturnType<typeof statusKind>) {
    if (kind === "won") return "bg-green-50 text-green-700";
    if (kind === "in_progress") return "bg-blue-50 text-blue-700";
    if (kind === "lost") return "bg-red-50 text-red-700";
    return "bg-[#F3F4F6] text-[#6B7280]";
  }

  function shortId(id: string | null | undefined) {
    if (!id) return "—";
    const s = String(id);
    return s.length <= 10 ? s : `${s.slice(0, 8)}...`;
  }

  function eur(amount: unknown) {
    const n = typeof amount === "number" ? amount : Number(amount ?? 0);
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
      Number.isFinite(n) ? n : 0,
    );
  }

  const computed = useMemo(() => {
    const totalAmount = dossiers.reduce((acc, d) => acc + (typeof d.montant_estime === "number" ? d.montant_estime : Number(d.montant_estime ?? 0)), 0);
    const allDates = dossiers
      .map((d) => (d.date_ouverture ? new Date(d.date_ouverture).getTime() : null))
      .filter((t): t is number => t != null && Number.isFinite(t));
    const firstOpened = allDates.length === 0 ? null : new Date(Math.min(...allDates));
    return { totalAmount, firstOpened };
  }, [dossiers]);

  const role: UiRole = useMemo(() => {
    const raw = profile?.role;
    if (raw === "admin" || raw === "expert" || raw === "assure") return raw;
    return "assure";
  }, [profile?.role]);

  const dossierById = useMemo(() => new Map(dossiers.map((d) => [d.id, d])), [dossiers]);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      window.alert("Impossible de copier l'ID.");
    }
  }

  function docEmoji(name: string | null | undefined) {
    const n = (name ?? "").toLowerCase();
    if (n.endsWith(".pdf")) return "📄";
    if (/\.(png|jpg|jpeg|webp|gif)$/.test(n)) return "🖼️";
    return "📎";
  }

  async function downloadDocument(doc: { id: string; nom: string | null; storage_path: string | null }) {
    const path = doc.storage_path || doc.nom;
    if (!path) {
      window.alert("Téléchargement non disponible");
      return;
    }

    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw error ?? new Error("Lien indisponible");
      window.open(data.signedUrl, "_blank");
    } catch {
      window.alert("Téléchargement non disponible");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <main className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8 sm:py-14">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate({ to: "/admin/utilisateurs" })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B50F0] hover:opacity-90"
              style={{ fontSize: "0.875rem" }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Utilisateurs
            </button>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">Profil utilisateur</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(role)}`}>
                <Shield className="h-3.5 w-3.5" aria-hidden />
                {roleLabel(role)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.alert("Suspendre le compte — bientôt disponible")}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Suspendre le compte
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-white p-6 text-sm text-destructive shadow-[0_1px_4px_rgba(0,0,0,0.08)]">{error}</div>
        ) : (
          <>
            {/* Card informations */}
            <section className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] sm:p-8">
              <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] pb-4">
                <User className="h-5 w-5 text-[#5B50F0]" aria-hidden />
                <h2 className="text-base font-semibold text-[#111827]">Informations</h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">ID</p>
                  <button
                    type="button"
                    onClick={() => void copyId()}
                    className="mt-2 inline-flex max-w-full items-center gap-2 rounded-lg bg-[#F9FAFB] px-3 py-2 text-left text-sm font-medium text-[#111827] hover:bg-[#F3F4F6]"
                    title="Cliquer pour copier"
                  >
                    <span className="truncate">{userId}</span>
                    {copied && <span className="text-xs font-semibold text-[#5B50F0]">Copié</span>}
                  </button>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Email</p>
                  <p className="mt-2 text-sm font-medium text-[#111827]">{profile?.email ?? "—"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Rôle</p>
                  <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(role)}`}>
                    {roleLabel(role)}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Membre depuis</p>
                  <p className="mt-2 text-sm font-medium text-[#111827]">
                    {computed.firstOpened
                      ? computed.firstOpened.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Nb de dossiers</p>
                  <p className="mt-2 text-sm font-semibold text-[#111827]">{dossiers.length}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Montant total estimé</p>
                  <p className="mt-2 text-sm font-semibold text-[#5B50F0]">{eur(computed.totalAmount)}</p>
                </div>
              </div>
            </section>

            {/* Section dossiers */}
            <section className="overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-6 py-5 sm:px-8">
                <h2 className="text-base font-semibold text-[#111827]">Dossiers associés ({dossiers.length})</h2>
              </div>

              {dossiers.length === 0 ? (
                <div className="p-6 text-sm text-[#6B7280] sm:px-8">Aucun dossier pour cet utilisateur</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[#F9FAFB]">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <th className="px-5 py-4">Type de sinistre</th>
                        <th className="px-5 py-4">Statut</th>
                        <th className="px-5 py-4">Montant estimé</th>
                        <th className="px-5 py-4">Date d'ouverture</th>
                        <th className="px-5 py-4">Expert assigné</th>
                        <th className="px-5 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossiers.map((d) => {
                        const opened = d.date_ouverture
                          ? new Date(d.date_ouverture).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                          : "—";
                        const stLabel = d.statut ?? "—";
                        const kind = statusKind(d.statut);
                        return (
                          <tr key={d.id} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF]">
                            <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{d.type_sinistre ?? "—"}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(kind)}`}>
                                {stLabel}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{eur(d.montant_estime)}</td>
                            <td className="px-5 py-4 text-sm text-[#111827]">{opened}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                              {d.expert_id ? shortId(String(d.expert_id)) : <span className="text-[#6B7280]">Non assigné</span>}
                            </td>
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => window.alert("Voir dossier — bientôt disponible")}
                                className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#E5E7EB]"
                              >
                                Voir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Section documents */}
            <section className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-[#5B50F0]" aria-hidden />
                  <h2 className="text-base font-semibold text-[#111827]">Documents uploadés ({documents.length})</h2>
                </div>
              </div>

              {documents.length === 0 ? (
                <p className="mt-6 text-sm text-[#6B7280]">Aucun document uploadé</p>
              ) : (
                <div className="mt-5 space-y-3">
                  {documents.map((doc) => {
                    const dossier = dossierById.get(doc.dossier_id ?? "");
                    const dossierLabel = dossier?.type_sinistre ?? "—";
                    const kind = statusKind(doc.statut);
                    const stLabel = doc.statut ?? "—";
                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-lg" aria-hidden>
                              {docEmoji(doc.nom)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#111827]">{doc.nom ?? "—"}</p>
                              <p className="mt-1 text-xs text-[#6B7280]">Dossier : {dossierLabel}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(kind)}`}>
                            {stLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => void downloadDocument({ id: doc.id, nom: doc.nom, storage_path: doc.storage_path })}
                            disabled={downloadingId === doc.id}
                            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#5B50F0] bg-white px-3 py-2 text-sm font-semibold text-[#5B50F0] hover:bg-[#EEF2FF] disabled:opacity-60"
                          >
                            <Download className="h-4 w-4" aria-hidden />
                            {downloadingId === doc.id ? "Téléchargement…" : "Télécharger"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

