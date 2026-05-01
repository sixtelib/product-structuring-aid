import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { dossierStatusMeta } from "@/lib/client-dashboard-ui";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexPage,
});

type DossierRow = Tables<"dossiers">;
type ProfileRow = Tables<"profiles">;

type DossierForList = DossierRow & {
  assured?: ProfileRow | null;
  expert?: ProfileRow | null;
};

type AdminStatus = "qualification" | "en_cours" | "en_attente" | "gagne" | "perdu";

const ADMIN_STATUS_OPTIONS: Array<{ value: AdminStatus; label: string }> = [
  { value: "qualification", label: "Qualification" },
  { value: "en_cours", label: "En cours" },
  { value: "en_attente", label: "En attente" },
  { value: "gagne", label: "Gagné" },
  { value: "perdu", label: "Perdu" },
];

function eur(amount: number | string | null | undefined) {
  const n = amount == null ? 0 : typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function AdminIndexPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<DossierForList[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigningDossier, setAssigningDossier] = useState<DossierForList | null>(null);
  const [expertSearch, setExpertSearch] = useState("");
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [savingAssign, setSavingAssign] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const { data: dossierRows, error: dErr } = await supabase
        .from("dossiers")
        .select(
          "id, user_id, expert_id, statut, type_sinistre, date_ouverture, montant_estime, nom_assure, prenom_assure, nom_expert, prenom_expert",
        )
        .order("date_ouverture", { ascending: false });
      if (dErr) throw dErr;
      const base = (dossierRows as DossierRow[]) ?? [];

      const assuredIds = Array.from(new Set(base.map((d) => d.user_id).filter(Boolean)));
      const expertIds = Array.from(new Set(base.map((d) => d.expert_id).filter(Boolean))) as string[];
      const allProfileIds = Array.from(new Set([...assuredIds, ...expertIds]));

      const { data: profRows, error: pErr } =
        allProfileIds.length === 0
          ? { data: [], error: null }
          : await supabase.from("profiles").select("*").in("id", allProfileIds);
      if (pErr) throw pErr;
      const profiles = (profRows as ProfileRow[]) ?? [];
      const byId = new Map(profiles.map((p) => [p.id, p]));

      const enriched: DossierForList[] = base.map((d) => ({
        ...d,
        assured: byId.get(d.user_id) ?? null,
        expert: d.expert_id ? byId.get(d.expert_id) ?? null : null,
      }));
      setDossiers(enriched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
      setDossiers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, prenom, nom, specialite")
      .eq("role", "expert")
      .then(({ data }) => setExperts(data ?? []));
  }, []);

  const filteredAssignExperts = useMemo(() => {
    const q = expertSearch.trim().toLowerCase();
    if (!q) return experts;
    return experts.filter((expert: any) => {
      const name = expert.full_name || `${expert.prenom || ""} ${expert.nom || ""}`.trim() || "";
      return name.toLowerCase().includes(q);
    });
  }, [experts, expertSearch]);

  const stats = useMemo(() => {
    const total = dossiers.length;
    const unassigned = dossiers.filter((d) => !d.expert_id).length;
    const totalAmount = dossiers.reduce((acc, d) => acc + (typeof d.montant_estime === "number" ? d.montant_estime : Number(d.montant_estime ?? 0)), 0);
    return { total, unassigned, totalAmount };
  }, [dossiers]);

  function openAssign(d: DossierForList) {
    setAssigningDossier(d);
    setExpertSearch("");
    setSelectedExpertId("");
    setAssignOpen(true);
  }

  async function confirmAssign() {
    if (!assigningDossier?.id || !selectedExpertId) return;
    setSavingAssign(true);
    try {
      const { error: uErr } = await supabase.from("dossiers").update({ expert_id: selectedExpertId }).eq("id", assigningDossier.id);
      if (uErr) throw uErr;
      toast.success("Expert assigné.");
      setAssignOpen(false);
      setAssigningDossier(null);
      setExpertSearch("");
      setSelectedExpertId("");
      await refreshAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'assigner.");
    } finally {
      setSavingAssign(false);
    }
  }

  async function updateStatus(dossierId: string, statut: AdminStatus) {
    setUpdatingStatusId(dossierId);
    try {
      const { error: uErr } = await supabase.from("dossiers").update({ statut }).eq("id", dossierId);
      if (uErr) throw uErr;
      setDossiers((prev) => prev.map((d) => (d.id === dossierId ? ({ ...d, statut } as DossierForList) : d)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de changer le statut.");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
            <Shield className="h-4 w-4 text-[#5B50F0]" aria-hidden />
            <p className="text-sm font-semibold text-[#111827]">Espace admin</p>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl">Pilotage des dossiers</h1>
          <p className="mt-2 text-sm text-[#6B7280]">Assignez des experts et mettez à jour les statuts.</p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total dossiers" value={String(stats.total)} />
        <StatCard label="Sans expert assigné" value={String(stats.unassigned)} />
        <StatCard label="Montant total estimé" value={eur(stats.totalAmount)} />
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-white p-6 text-sm text-destructive shadow-[0_1px_4px_rgba(0,0,0,0.08)]">{error}</div>
      ) : (
        <section className="rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5 sm:px-8">
            <p className="text-sm font-semibold text-[#111827]">{dossiers.length} dossier(s)</p>
            <p className="text-xs text-[#6B7280]">Cliquez sur “Assigner” pour sélectionner un expert.</p>
          </div>

          <ul className="divide-y divide-[#E5E7EB]">
            {dossiers.map((d) => {
              const meta = dossierStatusMeta(d.statut);
              const assuredName = `${String(d.prenom_assure ?? "").trim()} ${String(d.nom_assure ?? "").trim()}`.trim();
              const assuredLabel =
                assuredName || (d.assured?.full_name && d.assured.full_name.trim()) || d.assured?.email || "Inconnu";
              const expertName = `${String(d.prenom_expert ?? "").trim()} ${String(d.nom_expert ?? "").trim()}`.trim();
              const expertLabel =
                expertName || (d.expert?.full_name && d.expert.full_name.trim()) || d.expert?.email || "Inconnu";

              return (
                <li
                  key={d.id}
                  onClick={() => navigate({ to: "/admin/dossiers/$dossierId", params: { dossierId: d.id } })}
                  className="cursor-pointer px-6 py-5 transition-colors hover:bg-[#F8F9FF] sm:px-8"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          <span style={{ cursor: "pointer", color: "#5B50F0" }}>
                            {d.type_sinistre ?? d.titre ?? "Dossier"}
                          </span>
                        </p>
                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${meta.toneClass}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {d.type_sinistre} · Ouvert le{" "}
                        {new Date(d.date_ouverture).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        {" · "}
                        <span className="font-medium text-[#111827]">{eur(d.montant_estime)}</span>
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-lg bg-[#F3F4F6] px-2 py-1 text-[#6B7280]">
                          Assuré : <span className="font-medium text-[#111827]">{assuredLabel}</span>
                        </span>
                        {d.expert_id ? (
                          <span className="rounded-lg bg-[#F3F4F6] px-2 py-1 text-[#6B7280]">
                            Expert : <span className="font-medium text-[#111827]">{expertLabel}</span>
                          </span>
                        ) : (
                          <span className="rounded-lg bg-accent/10 px-2 py-1 font-medium text-accent">Non assigné</span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex flex-wrap items-center gap-2 lg:justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StatusSelect
                        value={toAdminStatus(d.statut)}
                        disabled={updatingStatusId === d.id}
                        onChange={(v) => void updateStatus(d.id, v)}
                      />

                      {!d.expert_id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAssign(d);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
                        >
                          <UserPlus className="h-4 w-4" aria-hidden />
                          Assigner
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {assignOpen && assigningDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-white shadow-[var(--shadow-elegant)]">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-foreground">Assigner un expert</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dossier : <span className="font-medium text-foreground">{assigningDossier.titre || assigningDossier.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssignOpen(false);
                  setAssigningDossier(null);
                  setExpertSearch("");
                  setSelectedExpertId("");
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                Fermer
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto px-6 py-5">
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  SÉLECTIONNER UN EXPERT
                </label>

                <div
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {experts.length === 0 ? (
                    <div style={{ padding: "16px", color: "#9CA3AF", textAlign: "center" }}>Aucun expert disponible</div>
                  ) : filteredAssignExperts.length === 0 ? (
                    <div style={{ padding: "16px", color: "#9CA3AF", textAlign: "center" }}>Aucun expert trouvé</div>
                  ) : (
                    filteredAssignExperts.map((expert: any) => {
                      const name =
                        expert.full_name ||
                        `${expert.prenom || ""} ${expert.nom || ""}`.trim() ||
                        "Expert sans nom";
                      return (
                        <div
                          key={expert.id}
                          onClick={() => setSelectedExpertId(expert.id)}
                          style={{
                            padding: "12px 16px",
                            cursor: "pointer",
                            borderBottom: "1px solid #F3F4F6",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: selectedExpertId === expert.id ? "#EEE9FF" : "white",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: selectedExpertId === expert.id ? "#5B50F0" : "#E5E7EB",
                              }}
                            />
                            <span style={{ fontWeight: selectedExpertId === expert.id ? 600 : 400 }}>{name}</span>
                          </div>
                          {expert.specialite && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                background: "#EEE9FF",
                                color: "#5B50F0",
                                padding: "2px 8px",
                                borderRadius: "999px",
                              }}
                            >
                              {expert.specialite}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Filtrer par nom..."
                  value={expertSearch}
                  onChange={(e) => setExpertSearch(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
              <button
                type="button"
                onClick={() => {
                  setAssignOpen(false);
                  setAssigningDossier(null);
                  setExpertSearch("");
                  setSelectedExpertId("");
                }}
                className="inline-flex items-center rounded-lg border-2 border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!selectedExpertId || savingAssign}
                onClick={() => void confirmAssign()}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
              >
                {savingAssign ? "Assignation..." : "Assigner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-[2rem] font-bold leading-none text-[#111827]">{value}</p>
    </div>
  );
}

function toAdminStatus(statut: string): AdminStatus {
  // If DB already uses admin status set, keep it. Otherwise best-effort mapping.
  if (ADMIN_STATUS_OPTIONS.some((s) => s.value === statut)) return statut as AdminStatus;
  if (statut === "attente_documents") return "en_attente";
  if (statut === "negociation") return "en_cours";
  if (statut === "en_analyse") return "en_cours";
  return "qualification";
}

function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: AdminStatus;
  disabled?: boolean;
  onChange: (v: AdminStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  const current = ADMIN_STATUS_OPTIONS.find((o) => o.value === value) ?? ADMIN_STATUS_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
      >
        <span>{current.label}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-elegant)]">
          <ul className="py-1">
            {ADMIN_STATUS_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onChange(opt.value);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                  <span className="font-medium text-foreground">{opt.label}</span>
                  {opt.value === value && <Check className="h-4 w-4 text-primary" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

