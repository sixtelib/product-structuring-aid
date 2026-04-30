import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/experts")({
  component: AdminExpertsPage,
});

type DossierRow = Tables<"dossiers">;

type ExpertRow = {
  expertId: string;
  inProgress: number;
  total: number;
  closed: number;
  won: number;
  successRate?: number; // 0..1
  revenueWon: number;
  revenueLost: number;
};

function AdminExpertsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<
    Array<
      Pick<
        DossierRow,
        | "id"
        | "user_id"
        | "statut"
        | "type_sinistre"
        | "date_ouverture"
        | "montant_estime"
        | "expert_id"
        | "nom_expert"
        | "prenom_expert"
      >
    >
  >([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await supabase
          .from("dossiers")
          .select(
            "id, user_id, expert_id, statut, type_sinistre, date_ouverture, montant_estime, nom_assure, prenom_assure, nom_expert, prenom_expert, assureur",
          )
          .not("expert_id", "is", null);

        if (!isMounted) return;
        if (err) throw err;
        if (!isMounted) return;
        setDossiers((data ?? []) as any);
      } catch (e) {
        if (!isMounted) return;
        console.error(e);
        setError(e instanceof Error ? e.message : "Erreur de chargement.");
        setDossiers([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  function shortId(id: string) {
    return `${id.slice(0, 8)}...`;
  }

  function normalizeStatut(s: string | null | undefined) {
    return (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function amount(n: unknown) {
    const v = typeof n === "number" ? n : Number(n ?? 0);
    return Number.isFinite(v) ? v : 0;
  }

  function eur(amountNumber: number) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
      Number.isFinite(amountNumber) ? amountNumber : 0,
    );
  }

  const stats = useMemo(() => {
    const expertIds = new Set<string>();
    let inProgress = 0;
    let revenue = 0;

    dossiers.forEach((d) => {
      if (d.expert_id) expertIds.add(String(d.expert_id));
      const st = normalizeStatut(d.statut);
      if (st === "en_cours" || st === "en cours" || st.includes("en_cours")) inProgress += 1;

      const isClosedOrWon = st.includes("clotur") || st.includes("gagn");
      if (isClosedOrWon) revenue += amount(d.montant_estime) * 0.1;
    });

    return {
      activeExperts: expertIds.size,
      inProgress,
      revenue,
    };
  }, [dossiers]);

  const expertsTable = useMemo(() => {
    const byExpert = new Map<string, ExpertRow>();

    dossiers.forEach((d) => {
      const expertId = d.expert_id ? String(d.expert_id) : "";
      if (!expertId) return;

      const st = normalizeStatut(d.statut);
      const isInProgress = st === "en_cours" || st === "en cours" || st.includes("en_cours");
      const isWon = st.includes("gagn");
      const isLost = st.includes("perdu") || st.includes("refus") || st.includes("echec");
      const isClosed = st.includes("clotur") || isWon || isLost;
      const fee = amount(d.montant_estime) * 0.1;

      const row =
        byExpert.get(expertId) ??
        ({
          expertId,
          inProgress: 0,
          total: 0,
          closed: 0,
          won: 0,
          revenueWon: 0,
          revenueLost: 0,
        } satisfies ExpertRow);

      row.total += 1;
      if (isInProgress) row.inProgress += 1;
      if (isClosed) row.closed += 1;
      if (isWon) {
        row.won += 1;
        row.revenueWon += fee;
      }
      if (isLost) row.revenueLost += fee;

      byExpert.set(expertId, row);
    });

    const rows = Array.from(byExpert.values()).map((r) => ({
      ...r,
      successRate: r.closed > 0 ? r.won / r.closed : undefined,
    }));

    rows.sort((a, b) => (b.revenueWon + b.revenueLost) - (a.revenueWon + a.revenueLost));
    return rows;
  }, [dossiers]);

  const expertNameById = useMemo(() => {
    const map = new Map<string, string>();
    dossiers.forEach((d) => {
      if (!d.expert_id) return;
      const id = String(d.expert_id);
      if (map.has(id)) return;
      const label = `${String(d.nom_expert ?? "").trim()} ${String(d.prenom_expert ?? "").trim()}`.trim();
      if (label) map.set(id, label);
    });
    return map;
  }, [dossiers]);

  function expertLabel(expertId: string) {
    return expertNameById.get(expertId) ?? "Non assigné";
  }

  const pipelineByExpert = useMemo(() => {
    const byExpert = new Map<
      string,
      Array<Pick<DossierRow, "id" | "statut" | "type_sinistre" | "date_ouverture" | "montant_estime" | "expert_id">>
    >();

    dossiers.forEach((d) => {
      const expertId = d.expert_id ? String(d.expert_id) : "";
      if (!expertId) return;
      const st = normalizeStatut(d.statut);
      const isActive = st === "en_cours" || st === "en cours" || st.includes("en_cours");
      if (!isActive) return;

      const arr = byExpert.get(expertId) ?? [];
      arr.push(d);
      byExpert.set(expertId, arr);
    });

    for (const [expertId, list] of byExpert.entries()) {
      list.sort((a, b) => new Date(b.date_ouverture).getTime() - new Date(a.date_ouverture).getTime());
      byExpert.set(expertId, list);
    }

    return byExpert;
  }, [dossiers]);

  function StatCard({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">{label}</p>
        <p className="mt-2 text-[2rem] font-bold leading-none text-[#111827]">{value}</p>
      </div>
    );
  }

  function successTone(rate: number) {
    const pct = rate * 100;
    if (pct > 60) return "text-green-700 bg-green-50";
    if (pct >= 40) return "text-orange-700 bg-orange-50";
    return "text-red-700 bg-red-50";
  }

  return (
    <div className="min-h-[60vh] bg-[#F8F9FF]">
      <div>
        <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">Experts</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Suivi de performance et gestion des experts partenaires</p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Experts actifs" value={String(stats.activeExperts)} />
        <StatCard label="Dossiers en cours" value={String(stats.inProgress)} />
        <StatCard label="Revenus générés" value={eur(stats.revenue)} />
      </section>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">Erreur de chargement : {error}</div>
        ) : dossiers.length === 0 ? (
          <div className="p-6 text-sm text-[#6B7280]">Aucun expert assigné pour le moment</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#F9FAFB]">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">Expert</th>
                  <th className="px-5 py-4">Dossiers en cours</th>
                  <th className="px-5 py-4">Dossiers traités</th>
                  <th className="px-5 py-4">Taux de succès</th>
                  <th className="px-5 py-4">Revenu généré</th>
                  <th className="px-5 py-4">Revenu perdu</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {expertsTable.map((ex) => {
                  const rateLabel =
                    ex.successRate == null ? "Non renseigné" : `${Math.round(ex.successRate * 100)}%`;

                  return (
                    <tr key={ex.expertId} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF]">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#111827]">{expertLabel(ex.expertId)}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{ex.inProgress}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{ex.total}</td>
                      <td className="px-5 py-4">
                        {ex.successRate == null ? (
                          <span className="text-sm text-[#6B7280]">Non renseigné</span>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${successTone(ex.successRate)}`}>
                            {rateLabel}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{eur(ex.revenueWon)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-red-700">{eur(ex.revenueLost)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => window.alert(`Détail expert : ${expertLabel(ex.expertId)}`)}
                            className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#E5E7EB]"
                          >
                            Voir détail
                          </button>
                          <button
                            type="button"
                            onClick={() => window.alert("Fonctionnalité bientôt disponible")}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            Suspendre
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && dossiers.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-[#111827]">Pipeline en cours</h2>

          {pipelineByExpert.size === 0 ? (
            <p className="mt-3 text-sm text-[#6B7280]">Aucun dossier en cours.</p>
          ) : (
            <div className="mt-4 space-y-6">
              {Array.from(pipelineByExpert.entries()).map(([expertId, list]) => (
                <div key={expertId}>
                  <p className="text-sm font-semibold text-[#111827]">{expertLabel(expertId)}</p>
                  <div className="mt-3 space-y-3">
                    {list.map((d) => {
                      const st = d.statut ?? "Non renseigné";
                      const opened = d.date_ouverture
                        ? new Date(d.date_ouverture).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Non renseigné";
                      const feeBase = amount(d.montant_estime);

                      return (
                        <div
                          key={d.id}
                          className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#111827]">{d.type_sinistre}</p>
                              <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-semibold text-[#6B7280]">
                                {st}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[#6B7280]">Ouvert le {opened}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                            <span className="text-sm font-semibold text-[#111827]">{eur(feeBase)}</span>
                            <span className="text-xs text-[#6B7280]">Expert {expertLabel(expertId)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminExpertsPage;

