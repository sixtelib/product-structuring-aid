import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Target, TrendingDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/facturation")({
  component: AdminFacturationPage,
});

type DossierRow = Tables<"dossiers">;
type FilterMode = "all" | "in_progress" | "won" | "lost";

function AdminFacturationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [dossiers, setDossiers] = useState<
    Array<
      Pick<
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
          .order("date_ouverture", { ascending: false });
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

  function amount(n: unknown) {
    const v = typeof n === "number" ? n : Number(n ?? 0);
    return Number.isFinite(v) ? v : 0;
  }

  function eur(n: number) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
      Number.isFinite(n) ? n : 0,
    );
  }

  function shortId(id: string | null | undefined) {
    if (!id) return "Non renseigné";
    return `${String(id).slice(0, 8)}...`;
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

  function sinistreLabel(type: string | null | undefined) {
    if (!type) return "Non renseigné";
    const map: Record<string, string> = {
      degat_des_eaux: "Dégât des eaux",
      incendie: "Incendie",
      vol_cambriolage: "Vol / cambriolage",
      catastrophe_naturelle: "Catastrophe naturelle",
      bris_de_glace: "Bris de glace",
      dommage_vehicule: "Dommage véhicule",
      responsabilite_civile: "Responsabilité civile",
      autre: "Autre",
    };
    return map[type] ?? type;
  }

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pending = 0;
    let lost = 0;
    let wonCount = 0;
    let closedCount = 0;

    dossiers.forEach((d) => {
      const fee = amount(d.montant_estime) * 0.1;
      const kind = statusKind(d.statut);

      if (kind === "won") {
        totalRevenue += fee;
        closedCount += 1;
        wonCount += 1;
      } else if (kind === "in_progress") {
        pending += fee;
      } else if (kind === "lost") {
        lost += fee;
        closedCount += 1;
      }
    });

    const conversion = closedCount === 0 ? null : (wonCount / closedCount) * 100;
    return { totalRevenue, pending, lost, conversion };
  }, [dossiers]);

  const filtered = useMemo(() => {
    if (filter === "all") return dossiers;
    if (filter === "won") return dossiers.filter((d) => statusKind(d.statut) === "won");
    if (filter === "lost") return dossiers.filter((d) => statusKind(d.statut) === "lost");
    return dossiers.filter((d) => statusKind(d.statut) === "in_progress");
  }, [dossiers, filter]);

  function downloadCsv() {
    const headers = ["id_dossier", "type", "montant_sinistre", "commission_10pct", "date_ouverture", "statut", "expert"];

    const rows = dossiers.map((d) => {
      const a = amount(d.montant_estime);
      const commission = a * 0.1;
      const date = d.date_ouverture ? new Date(d.date_ouverture).toISOString() : "";
      return [
        d.id,
        sinistreLabel(d.type_sinistre),
        a,
        commission,
        date,
        d.statut ?? "",
        d.expert_id ?? "",
      ];
    });

    const escape = (v: unknown) => {
      const s = String(v ?? "");
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const csv = [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `facturation-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function StatCard({
    label,
    value,
    valueClassName,
    icon: Icon,
    iconBg,
    iconColor,
  }: {
    label: string;
    value: string;
    valueClassName?: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
  }) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">{label}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <p className={`text-[2rem] font-bold leading-none text-[#111827] ${valueClassName ?? ""}`}>{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-[#F8F9FF]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">Facturation</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Suivi des commissions et revenus de la plateforme</p>
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard
          label="Revenus totaux"
          value={eur(stats.totalRevenue)}
          valueClassName="text-[#5B50F0]"
          icon={TrendingUp}
          iconBg="bg-[#EEF2FF]"
          iconColor="text-[#5B50F0]"
        />
        <StatCard
          label="En attente"
          value={eur(stats.pending)}
          valueClassName="text-[#F59E0B]"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-[#F59E0B]"
        />
        <StatCard
          label="Revenus perdus"
          value={eur(stats.lost)}
          valueClassName="text-[#EF4444]"
          icon={TrendingDown}
          iconBg="bg-red-50"
          iconColor="text-[#EF4444]"
        />
        <StatCard
          label="Taux de conversion"
          value={stats.conversion == null ? "Non renseigné" : `${Math.round(stats.conversion)}%`}
          valueClassName="text-[#10B981]"
          icon={Target}
          iconBg="bg-green-50"
          iconColor="text-[#10B981]"
        />
      </section>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Historique des dossiers</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full bg-[#F3F4F6] p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === "all" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setFilter("in_progress")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === "in_progress" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
              }`}
            >
              En cours
            </button>
            <button
              type="button"
              onClick={() => setFilter("won")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === "won" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
              }`}
            >
              Gagnés
            </button>
            <button
              type="button"
              onClick={() => setFilter("lost")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === "lost" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
              }`}
            >
              Perdus
            </button>
          </div>

          <button
            type="button"
            onClick={downloadCsv}
            className="rounded-lg bg-[#5B50F0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-95"
          >
            Exporter CSV →
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">Erreur de chargement : {error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-[#6B7280]">Aucune donnée</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#F9FAFB]">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">ID dossier</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Montant sinistre</th>
                  <th className="px-5 py-4">Commission (10%)</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Statut</th>
                  <th className="px-5 py-4">Expert</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((d) => {
                  const base = amount(d.montant_estime);
                  const commission = base * 0.1;
                  const dateLabel = d.date_ouverture
                    ? new Date(d.date_ouverture).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                    : "Non renseigné";
                  const kind = statusKind(d.statut);
                  const stLabel = d.statut ?? "Non renseigné";

                  return (
                    <tr key={d.id} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF]">
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{String(d.id).slice(0, 8)}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-semibold text-[#6B7280]">
                          {sinistreLabel(d.type_sinistre)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{eur(base)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#5B50F0]">{eur(commission)}</td>
                      <td className="px-5 py-4 text-sm text-[#111827]">{dateLabel}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(kind)}`}>
                          {stLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                        {d.nom_expert || d.prenom_expert
                          ? `${d.nom_expert ?? ""} ${d.prenom_expert ?? ""}`.trim()
                          : "Non assigné"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFacturationPage;

