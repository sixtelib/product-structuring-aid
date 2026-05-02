import { Copy, Eye, UserPlus } from "lucide-react";
import type { Dossier } from "@/types";

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "incendie", label: "Incendie" },
  { value: "degat_des_eaux", label: "Dégât des eaux" },
  { value: "tempete", label: "Tempête" },
  { value: "accident_auto", label: "Accident auto" },
  { value: "multirisque", label: "Multirisque" },
  { value: "autre", label: "Autre" },
];

const STATUT_ROW_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "en_analyse", label: "En analyse" },
  { value: "en_cours", label: "En cours" },
  { value: "négociation", label: "Négociation" },
  { value: "gagné", label: "Gagné" },
  { value: "perdu", label: "Perdu" },
  { value: "clôturé", label: "Clôturé" },
];

type TypeFilter =
  | "all"
  | "incendie"
  | "degat_des_eaux"
  | "tempete"
  | "accident_auto"
  | "multirisque"
  | "autre";

function normalize(s: string | null | undefined) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function typeKey(raw: string | null | undefined): TypeFilter {
  const s = normalize(raw);
  if (s.includes("incend")) return "incendie";
  if (s.includes("degat") || s.includes("eaux")) return "degat_des_eaux";
  if (s.includes("tempet")) return "tempete";
  if (s.includes("accident") || s.includes("auto") || s.includes("vehic")) return "accident_auto";
  if (s.includes("multirisque")) return "multirisque";
  if (!s) return "autre";
  if (s.includes("autre")) return "autre";
  return "autre";
}

function typeBadgeClass(t: TypeFilter) {
  if (t === "incendie") return "bg-orange-50 text-orange-700";
  if (t === "degat_des_eaux") return "bg-blue-50 text-blue-700";
  if (t === "tempete") return "bg-[#F3F4F6] text-[#6B7280]";
  if (t === "accident_auto") return "bg-red-50 text-red-700";
  return "bg-[#EDE9FE] text-[#5B50F0]";
}

function formatStatut(statut: string | null | undefined): { label: string; badgeClass: string } {
  const s = normalize(statut);
  if (!s) {
    return { label: "Non renseigné", badgeClass: "bg-[#F3F4F6] text-[#6B7280]" };
  }
  if (s.includes("qualif")) {
    return { label: "Qualification", badgeClass: "bg-yellow-50 text-yellow-800" };
  }
  if (s.includes("analyse")) {
    return { label: "En analyse", badgeClass: "bg-orange-50 text-orange-700" };
  }
  if (s === "en_cours" || s === "en cours" || s.includes("en_cours")) {
    return { label: "En cours", badgeClass: "bg-blue-50 text-blue-700" };
  }
  if (s.includes("gagn")) {
    return { label: "Gagné", badgeClass: "bg-green-50 text-green-700" };
  }
  if (s.includes("perdu") || s.includes("refus") || s.includes("echec")) {
    return { label: "Perdu", badgeClass: "bg-red-50 text-red-700" };
  }
  if (s.includes("clotur") || s.includes("clos")) {
    return { label: "Clôturé", badgeClass: "bg-[#F3F4F6] text-[#6B7280]" };
  }
  const raw = String(statut).trim();
  return { label: raw || "Non renseigné", badgeClass: "bg-[#F3F4F6] text-[#6B7280]" };
}

function amountValue(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function eur(n: unknown) {
  const v = amountValue(n);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

function dateLabel(d: string | null | undefined) {
  if (!d) return "Non renseigné";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "Non renseigné";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function shortId(id: string | null | undefined) {
  if (!id) return "Non renseigné";
  const s = String(id);
  return s.length <= 8 ? s : s.slice(0, 8);
}

function statutSelectOptions(current: string | null | undefined) {
  const base = STATUT_ROW_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
  const cur = (current ?? "").trim();
  if (cur && !base.some((o) => o.value === cur)) {
    return [{ value: cur, label: cur }, ...base];
  }
  return base;
}

export type DossierTableauProps = {
  dossiers: Dossier[];
  page: number;
  pageCount: number;
  onVoir: (id: string) => void;
  onAssigner: (dossier: Dossier) => void;
  onChangerStatut: (id: string, statut: string) => void;
  onPagePrev: () => void;
  onPageNext: () => void;
};

export function DossierTableau({
  dossiers,
  page,
  pageCount,
  onVoir,
  onAssigner,
  onChangerStatut,
  onPagePrev,
  onPageNext,
}: DossierTableauProps) {
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.alert("Impossible de copier.");
    }
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#F9FAFB]">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Assureur</th>
              <th className="px-5 py-4">Statut</th>
              <th className="px-5 py-4">Montant</th>
              <th className="px-5 py-4">Commission</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Assuré</th>
              <th className="px-5 py-4">Expert</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dossiers.map((d) => {
              const t = typeKey(d.type_sinistre);
              const typeLabel = TYPE_OPTIONS.find((o) => o.value === t)?.label ?? (d.type_sinistre ?? "Non renseigné");
              const amt = d.montant_estime == null ? null : amountValue(d.montant_estime);
              const commission = amt == null ? null : amt * 0.1;
              const statutBadge = formatStatut(d.statut);
              return (
                <tr
                  key={d.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer border-b border-[#F3F4F6] hover:bg-[#F8F9FF]"
                  onClick={() => onVoir(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onVoir(d.id);
                    }
                  }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#111827]">{shortId(d.id)}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void copy(String(d.id));
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]"
                        aria-label="Copier l'ID"
                        title="Copier"
                      >
                        <Copy className="h-4 w-4 text-[#6B7280]" aria-hidden />
                      </button>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${typeBadgeClass(t)}`}>
                      {typeLabel}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#111827]">
                    {d.assureur_nom?.trim() ? (
                      <span className="font-semibold">{d.assureur_nom}</span>
                    ) : (
                      <span className="italic text-[#9CA3AF]">Non renseigné</span>
                    )}
                  </td>

                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <span
                        className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statutBadge.badgeClass}`}
                      >
                        {statutBadge.label}
                      </span>
                      <select
                        aria-label="Modifier le statut"
                        value={d.statut ?? ""}
                        onChange={(e) => {
                          e.stopPropagation();
                          onChangerStatut(d.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-9 max-w-[200px] rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs font-semibold text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                      >
                        {statutSelectOptions(d.statut).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{amt == null ? "Non renseigné" : eur(amt)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#5B50F0]">{commission == null ? "Non renseigné" : eur(commission)}</td>
                  <td className="px-5 py-4 text-sm text-[#111827]">{dateLabel(d.date_ouverture)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                    {d.nom_assure || d.prenom_assure ? `${d.nom_assure ?? ""} ${d.prenom_assure ?? ""}`.trim() : "Assuré inconnu"}
                  </td>

                  <td className="px-5 py-4">
                    {d.nom_expert || d.prenom_expert ? (
                      <span className="text-sm font-semibold text-[#111827]">{`${d.nom_expert ?? ""} ${d.prenom_expert ?? ""}`.trim()}</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                        Non assigné
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      {!d.expert_id ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssigner(d);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
                        >
                          <UserPlus className="h-4 w-4" aria-hidden />
                          Assigner
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVoir(d.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB]"
                      >
                        <Eye className="h-4 w-4 text-[#6B7280]" aria-hidden />
                        Voir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            type="button"
            onClick={onPagePrev}
            disabled={page <= 1}
            className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB] disabled:opacity-50"
          >
            ← Précédent
          </button>

          <p className="text-sm font-medium text-[#6B7280]">
            Page <span className="font-semibold text-[#111827]">{page}</span> sur{" "}
            <span className="font-semibold text-[#111827]">{pageCount}</span>
          </p>

          <button
            type="button"
            onClick={onPageNext}
            disabled={page >= pageCount}
            className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB] disabled:opacity-50"
          >
            Suivant →
          </button>
        </div>
      ) : null}
    </>
  );
}
