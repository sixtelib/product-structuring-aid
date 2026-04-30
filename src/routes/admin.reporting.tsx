import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { BarChart2, Clock, Euro, FolderOpen, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/reporting")({
  component: AdminReportingPage,
});

type DossierRow = Tables<"dossiers">;

type PeriodKey = "7d" | "30d" | "90d" | "all";

type DossierListRow = Pick<
  DossierRow,
  | "id"
  | "user_id"
  | "expert_id"
  | "statut"
  | "type_sinistre"
  | "date_ouverture"
  | "montant_estime"
  | "nom_assure"
  | "prenom_assure"
  | "nom_expert"
  | "prenom_expert"
  | "assureur"
>;

function AdminReportingPage() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<DossierListRow[]>([]);

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
          .order("date_ouverture", { ascending: false });

        if (!isMounted) return;
        if (err) throw err;
        if (!isMounted) return;
        setDossiers(((data ?? []) as unknown as DossierListRow[]) ?? []);
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

  function normalizeStatut(s: string | null | undefined) {
    return (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function shortId(id: string) {
    return `${id.slice(0, 8)}...`;
  }

  function expertLabel(d: { nom_expert: string | null; prenom_expert: string | null; expert_id: string | null }) {
    const label = `${String(d.nom_expert ?? "").trim()} ${String(d.prenom_expert ?? "").trim()}`.trim();
    if (label) return label;
    return "Non assigné";
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

  function periodDays(p: PeriodKey) {
    if (p === "7d") return 7;
    if (p === "30d") return 30;
    if (p === "90d") return 90;
    return null;
  }

  function isWon(statut: string | null | undefined) {
    const st = normalizeStatut(statut);
    return st.includes("cloture_succes") || st.includes("succes") || st.includes("gagn");
  }

  function isClosed(statut: string | null | undefined) {
    const st = normalizeStatut(statut);
    return (
      st.includes("cloture") ||
      st.includes("clos") ||
      st.includes("abandon") ||
      st.includes("echec") ||
      st.includes("perdu") ||
      st.includes("refus") ||
      isWon(statut)
    );
  }

  function statutBadgeClass(statut: string | null | undefined) {
    const st = normalizeStatut(statut);
    if (st.includes("cloture_succes") || st.includes("succes") || st.includes("gagn")) return "bg-green-50 text-green-700";
    if (st.includes("cloture_echec") || st.includes("echec") || st.includes("perdu") || st.includes("refus"))
      return "bg-red-50 text-red-700";
    if (st.includes("abandon")) return "bg-gray-100 text-gray-700";
    return "bg-[#EEE9FF] text-[#5B50F0]";
  }

  function relativeDaysLabel(dateIso: string) {
    const t = new Date(dateIso).getTime();
    if (!Number.isFinite(t)) return "Non renseigné";
    const now = Date.now();
    const diffDays = Math.max(0, Math.floor((now - t) / (1000 * 60 * 60 * 24)));
    if (diffDays === 0) return "aujourd'hui";
    if (diffDays === 1) return "il y a 1 jour";
    return `il y a ${diffDays} jours`;
  }

  const computed = useMemo(() => {
    const days = periodDays(period);
    const now = Date.now();
    const startMs = days == null ? null : now - days * 24 * 60 * 60 * 1000;
    const prevStartMs = days == null ? null : now - 2 * days * 24 * 60 * 60 * 1000;

    const inCurrent = dossiers.filter((d) => {
      if (startMs == null) return true;
      const t = new Date(d.date_ouverture).getTime();
      return Number.isFinite(t) && t >= startMs;
    });

    const currentNew = inCurrent.length;
    const prevNew =
      days == null
        ? null
        : dossiers.filter((d) => {
            const t = new Date(d.date_ouverture).getTime();
            if (!Number.isFinite(t) || prevStartMs == null || startMs == null) return false;
            return t >= prevStartMs && t < startMs;
          }).length;

    const trendPct =
      prevNew == null || prevNew === 0 ? null : Math.round(((currentNew - prevNew) / prevNew) * 100);

    let revenueWon = 0;
    let closedCount = 0;
    let wonCount = 0;
    let totalAmount = 0;

    inCurrent.forEach((d) => {
      const a = amount(d.montant_estime);
      totalAmount += a;
      if (isClosed(d.statut)) closedCount += 1;
      if (isWon(d.statut)) {
        wonCount += 1;
        revenueWon += a * 0.1;
      }
    });

    const avgAmount = inCurrent.length > 0 ? totalAmount / inCurrent.length : 0;
    const successRateLabel = closedCount === 0 ? "Non renseigné" : `${Math.round((wonCount / closedCount) * 100)}%`;

    const byType = new Map<
      string,
      { type: string; count: number; total: number; byStatut: Map<string, number> }
    >();
    inCurrent.forEach((d) => {
      const type = (d.type_sinistre ?? "Non renseigné").toString();
      const row = byType.get(type) ?? { type, count: 0, total: 0, byStatut: new Map<string, number>() };
      row.count += 1;
      row.total += amount(d.montant_estime);
      const st = (d.statut ?? "Non renseigné").toString();
      row.byStatut.set(st, (row.byStatut.get(st) ?? 0) + 1);
      byType.set(type, row);
    });

    const typeRows = Array.from(byType.values())
      .map((r) => {
        let dominantStatut = "Non renseigné";
        let max = 0;
        for (const [k, v] of r.byStatut.entries()) {
          if (v > max) {
            max = v;
            dominantStatut = k;
          }
        }
        return { ...r, dominantStatut };
      })
      .sort((a, b) => b.count - a.count);

    const totalInPeriod = inCurrent.length;

    const statusMap = new Map<string, { statut: string; count: number }>();
    inCurrent.forEach((d) => {
      const st = (d.statut ?? "Non renseigné").toString();
      statusMap.set(st, { statut: st, count: (statusMap.get(st)?.count ?? 0) + 1 });
    });
    const statusRows = Array.from(statusMap.values()).sort((a, b) => b.count - a.count);

    const recent = [...inCurrent]
      .sort((a, b) => new Date(b.date_ouverture).getTime() - new Date(a.date_ouverture).getTime())
      .slice(0, 5);

    const byExpert = new Map<
      string,
      { expertId: string; total: number; inProgress: number; won: number; revenue: number }
    >();
    inCurrent.forEach((d) => {
      const expertId = d.expert_id ? String(d.expert_id) : "";
      if (!expertId) return;
      const row = byExpert.get(expertId) ?? { expertId, total: 0, inProgress: 0, won: 0, revenue: 0 };
      row.total += 1;
      const closed = isClosed(d.statut);
      if (!closed) row.inProgress += 1;
      if (isWon(d.statut)) {
        row.won += 1;
        row.revenue += amount(d.montant_estime) * 0.1;
      }
      byExpert.set(expertId, row);
    });

    const expertRows = Array.from(byExpert.values())
      .map((r) => ({
        ...r,
        successPct: r.total === 0 ? null : Math.round((r.won / r.total) * 100),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      currentNew,
      trendPct,
      revenueWon,
      successRateLabel,
      avgAmount,
      typeRows,
      totalInPeriod,
      statusRows,
      recent,
      expertRows,
    };
  }, [dossiers, period]);

  function KpiCard({
    label,
    value,
    icon,
    helper,
    valueTone,
  }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    helper?: string;
    valueTone?: string;
  }) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">{label}</p>
            <p className={`mt-2 text-[2rem] font-bold leading-none ${valueTone ?? "text-[#111827]"}`}>{value}</p>
            {helper ? <p className="mt-2 text-sm text-[#6B7280]">{helper}</p> : null}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#111827]">
            {icon}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-[#F8F9FF]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">Reporting</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Vue d&apos;ensemble de l&apos;activité de la plateforme</p>
        </div>

        <div className="inline-flex rounded-full bg-[#F3F4F6] p-1">
          <button
            type="button"
            onClick={() => setPeriod("7d")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              period === "7d" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
            }`}
          >
            7 jours
          </button>
          <button
            type="button"
            onClick={() => setPeriod("30d")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              period === "30d" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
            }`}
          >
            30 jours
          </button>
          <button
            type="button"
            onClick={() => setPeriod("90d")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              period === "90d" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
            }`}
          >
            90 jours
          </button>
          <button
            type="button"
            onClick={() => setPeriod("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              period === "all" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
            }`}
          >
            Tout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-white p-6 text-sm text-destructive shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          Erreur de chargement : {error}
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <KpiCard
              label="Nouveaux dossiers"
              value={String(computed.currentNew)}
              icon={<FolderOpen className="h-5 w-5" />}
              helper={
                computed.trendPct == null
                  ? "Non renseigné"
                  : `${computed.trendPct > 0 ? "+" : ""}${computed.trendPct}% vs période précédente`
              }
            />
            <KpiCard label="Revenu généré" value={eur(computed.revenueWon)} icon={<Euro className="h-5 w-5" />} />
            <KpiCard
              label="Taux de succès"
              value={computed.successRateLabel}
              icon={<TrendingUp className="h-5 w-5 text-green-700" />}
              valueTone={computed.successRateLabel === "Non renseigné" ? "text-[#111827]" : "text-green-700"}
            />
            <KpiCard
              label="Montant moyen"
              value={eur(computed.avgAmount)}
              icon={<BarChart2 className="h-5 w-5" />}
            />
          </section>

          <section className="mt-6 rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
            <h2 className="text-base font-semibold text-[#111827]">Répartition par type de sinistre</h2>

            {computed.typeRows.length === 0 ? (
              <p className="mt-3 text-sm text-[#6B7280]">Aucune donnée sur la période sélectionnée.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {computed.typeRows.map((r) => {
                  const pct = computed.totalInPeriod === 0 ? 0 : Math.round((r.count / computed.totalInPeriod) * 100);
                  return (
                    <div key={r.type} className="rounded-lg border border-[#F3F4F6] bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[#111827]">{r.type}</p>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statutBadgeClass(r.dominantStatut)}`}>
                              {r.dominantStatut}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#6B7280]">{r.count} dossiers</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                          <span className="text-sm font-semibold text-[#111827]">{eur(r.total)}</span>
                          <span className="text-xs font-semibold text-[#6B7280]">{pct}%</span>
                        </div>
                      </div>

                      <div className="mt-3 h-2 w-full overflow-hidden rounded-[4px] bg-[#EEE9FF]">
                        <div className="h-full rounded-[4px] bg-[#5B50F0]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              <h2 className="text-base font-semibold text-[#111827]">Activité récente</h2>

              {computed.recent.length === 0 ? (
                <p className="mt-3 text-sm text-[#6B7280]">Aucun dossier sur la période sélectionnée.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {computed.recent.map((d) => {
                    const amt = amount(d.montant_estime);
                    return (
                      <div
                        key={d.id}
                        className="rounded-lg border border-[#F3F4F6] bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#111827]">{d.type_sinistre}</p>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statutBadgeClass(d.statut)}`}>
                                {d.statut ?? "Non renseigné"}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {relativeDaysLabel(d.date_ouverture)}
                              </span>
                              <span className="text-[#D1D5DB]">•</span>
                              <span>Expert {expertLabel(d as any)}</span>
                            </div>
                          </div>

                          <div className="text-sm font-semibold text-[#111827]">{eur(amt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              <h2 className="text-base font-semibold text-[#111827]">Répartition des statuts</h2>

              {computed.statusRows.length === 0 ? (
                <p className="mt-3 text-sm text-[#6B7280]">Aucune donnée sur la période sélectionnée.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {computed.statusRows.map((r) => {
                    const pct = computed.totalInPeriod === 0 ? 0 : Math.round((r.count / computed.totalInPeriod) * 100);
                    return (
                      <div key={r.statut}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statutBadgeClass(r.statut)}`}>
                              {r.statut}
                            </span>
                            <span className="text-sm font-semibold text-[#111827]">{r.count}</span>
                          </div>
                          <span className="text-xs font-semibold text-[#6B7280]">{pct}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-[4px] bg-[#EEE9FF]">
                          <div className="h-full rounded-[4px] bg-[#5B50F0]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
            <h2 className="text-base font-semibold text-[#111827]">Performance des experts</h2>

            {computed.expertRows.length === 0 ? (
              <p className="mt-3 text-sm text-[#6B7280]">Aucun expert assigné sur la période sélectionnée.</p>
            ) : (
              <div className="mt-4 w-full overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-4">Expert</th>
                      <th className="px-5 py-4">Nb dossiers totaux</th>
                      <th className="px-5 py-4">Nb en cours</th>
                      <th className="px-5 py-4">Nb gagnés</th>
                      <th className="px-5 py-4">Taux succès</th>
                      <th className="px-5 py-4">Revenu généré</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computed.expertRows.map((r) => (
                      <tr key={r.expertId} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF]">
                        <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                          {(() => {
                            const row = computed.recent.find((d) => String(d.expert_id ?? "") === String(r.expertId));
                            if (row) return expertLabel(row as any);
                            const anyRow = dossiers.find((d) => String(d.expert_id ?? "") === String(r.expertId));
                            if (anyRow) return expertLabel(anyRow as any);
                            return "Non assigné";
                          })()}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{r.total}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{r.inProgress}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{r.won}</td>
                        <td className="px-5 py-4">
                          {r.successPct == null ? (
                            <span className="text-sm text-[#6B7280]">Non renseigné</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                              {r.successPct}%
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{eur(r.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminReportingPage;

