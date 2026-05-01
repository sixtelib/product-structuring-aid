import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Copy, Eye, Search, UserPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/dossiers/")({
  component: AdminDossiersIndexPage,
});

type DossierRow = Tables<"dossiers">;

type StatusFilter = "all" | "en_cours" | "en_analyse" | "cloture" | "gagne" | "perdu";

type TypeFilter =
  | "all"
  | "incendie"
  | "degat_des_eaux"
  | "tempete"
  | "accident_auto"
  | "multirisque"
  | "autre";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tous" },
  { value: "en_cours", label: "En cours" },
  { value: "en_analyse", label: "En analyse" },
  { value: "cloture", label: "Clôturé" },
  { value: "gagne", label: "Gagné" },
  { value: "perdu", label: "Perdu" },
];

const TYPE_OPTIONS: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "Tous types" },
  { value: "incendie", label: "Incendie" },
  { value: "degat_des_eaux", label: "Dégât des eaux" },
  { value: "tempete", label: "Tempête" },
  { value: "accident_auto", label: "Accident auto" },
  { value: "multirisque", label: "Multirisque" },
  { value: "autre", label: "Autre" },
];

type AppliedFilters = {
  client: string;
  expert: string;
  assureur: string;
  type: TypeFilter;
  statut: StatusFilter;
  dateFrom: string;
  dateTo: string;
};

function normalize(s: string | null | undefined) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

function statusBadgeClass(statut: string | null | undefined) {
  const s = normalize(statut);
  if (s.includes("gagn")) return "bg-green-50 text-green-700";
  if (s.includes("perdu") || s.includes("refus") || s.includes("echec")) return "bg-red-50 text-red-700";
  if (s.includes("analyse")) return "bg-orange-50 text-orange-700";
  if (s.includes("clotur") || s.includes("clos")) return "bg-[#F3F4F6] text-[#6B7280]";
  if (s === "en_cours" || s === "en cours" || s.includes("en_cours")) return "bg-blue-50 text-blue-700";
  return "bg-[#F3F4F6] text-[#6B7280]";
}

function statusMatchesFilter(statut: string | null | undefined, filter: StatusFilter) {
  if (filter === "all") return true;
  const s = normalize(statut);
  if (filter === "en_cours") return s === "en_cours" || s === "en cours" || s.includes("en_cours");
  if (filter === "en_analyse") return s.includes("analyse");
  if (filter === "cloture") return s.includes("clotur") || s.includes("clos");
  if (filter === "gagne") return s.includes("gagn");
  if (filter === "perdu") return s.includes("perdu") || s.includes("refus") || s.includes("echec");
  return true;
}

function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  ariaLabel: string;
}) {
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="h-11 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 pr-9 text-sm font-medium text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" aria-hidden />
    </div>
  );
}

function AdminDossiersIndexPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const [clientQuery, setClientQuery] = useState("");
  const [expertQuery, setExpertQuery] = useState("");
  const [assureurQuery, setAssureurQuery] = useState("");
  const [typeDraft, setTypeDraft] = useState<TypeFilter>("all");
  const [statusDraft, setStatusDraft] = useState<StatusFilter>("all");
  const [dateFromDraft, setDateFromDraft] = useState("");
  const [dateToDraft, setDateToDraft] = useState("");

  const [applied, setApplied] = useState<AppliedFilters>({
    client: "",
    expert: "",
    assureur: "",
    type: "all",
    statut: "all",
    dateFrom: "",
    dateTo: "",
  });

  const [page, setPage] = useState(1);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState<Pick<DossierRow, "id" | "type_sinistre" | "user_id" | "expert_id"> | null>(null);
  const [experts, setExperts] = useState<Array<any>>([]);
  const [expertSearch, setExpertSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [savingAssign, setSavingAssign] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = () => setShowDropdown(false);
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
      if (err) throw err;
      setDossiers((data ?? []) as any);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
      setDossiers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!assignOpen) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("id, full_name, prenom, nom, specialite")
        .eq("role", "expert");
      if (cancelled) return;
      if (err) {
        console.error(err);
        setExperts([]);
        return;
      }
      setExperts(data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [assignOpen]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(applied.client.trim()) ||
      Boolean(applied.expert.trim()) ||
      Boolean(applied.assureur.trim()) ||
      applied.type !== "all" ||
      applied.statut !== "all" ||
      Boolean(applied.dateFrom) ||
      Boolean(applied.dateTo)
    );
  }, [applied]);

  const filtered = useMemo(() => {
    const out = dossiers.filter((d) => {
      const clientQ = normalize(applied.client);
      const expertQ = normalize(applied.expert);
      const assureurQ = normalize(applied.assureur);

      if (clientQ) {
        const id8 = String(d.id ?? "").slice(0, 8);
        const hay = `${normalize(d.nom_assure)} ${normalize(d.prenom_assure)} ${normalize(id8)}`;
        if (!hay.includes(clientQ)) return false;
      }

      if (expertQ) {
        const hay = `${normalize(d.nom_expert)} ${normalize(d.prenom_expert)} ${normalize(d.expert_id)}`;
        if (!hay.includes(expertQ)) return false;
      }

      if (assureurQ) {
        if (!normalize(d.assureur).includes(assureurQ)) return false;
      }

      if (applied.type !== "all" && typeKey(d.type_sinistre) !== applied.type) return false;
      if (!statusMatchesFilter(d.statut, applied.statut)) return false;

      if (applied.dateFrom || applied.dateTo) {
        const t = d.date_ouverture ? new Date(d.date_ouverture).getTime() : NaN;
        if (!Number.isFinite(t)) return false;
        if (applied.dateFrom) {
          const fromT = new Date(`${applied.dateFrom}T00:00:00`).getTime();
          if (Number.isFinite(fromT) && t < fromT) return false;
        }
        if (applied.dateTo) {
          const toT = new Date(`${applied.dateTo}T23:59:59`).getTime();
          if (Number.isFinite(toT) && t > toT) return false;
        }
      }

      return true;
    });
    return out;
  }, [applied, dossiers]);

  const stats = useMemo(() => {
    const displayed = filtered.length;
    const totalAmount = filtered.reduce((acc, d) => acc + amountValue(d.montant_estime), 0);
    const withoutExpert = filtered.filter((d) => !d.expert_id).length;
    return { displayed, totalAmount, withoutExpert };
  }, [filtered]);

  const pagination = useMemo(() => {
    const pageSize = 20;
    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const start = (safePage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return { pageSize, total, pageCount, page: safePage, items };
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [applied]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.alert("Impossible de copier.");
    }
  }

  async function updateStatus(dossierId: string, newStatut: string) {
    setUpdatingStatusId(dossierId);
    try {
      const { error: uErr } = await supabase.from("dossiers").update({ statut: newStatut }).eq("id", dossierId);
      if (uErr) throw uErr;
      setDossiers((prev) => prev.map((d) => (d.id === dossierId ? ({ ...d, statut: newStatut } as any) : d)));
    } catch (e) {
      console.error(e);
      window.alert(e instanceof Error ? e.message : "Impossible de changer le statut.");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  function openAssign(
    d: Pick<
      DossierRow,
      "id" | "type_sinistre" | "user_id" | "expert_id" | "nom_assure" | "prenom_assure" | "nom_expert" | "prenom_expert"
    >,
  ) {
    setAssigning(d);
    setExpertSearch("");
    setShowDropdown(false);
    setSelectedExpertId("");
    setAssignOpen(true);
  }

  async function confirmAssign() {
    if (!assigning?.id) return;
    const expertId = selectedExpertId.trim();
    if (!expertId) return;

    setSavingAssign(true);
    try {
      const { error: uErr } = await supabase.from("dossiers").update({ expert_id: expertId }).eq("id", assigning.id);
      if (uErr) throw uErr;
      setAssignOpen(false);
      setAssigning(null);
      setExpertSearch("");
      setShowDropdown(false);
      setSelectedExpertId("");
      await load();
    } catch (e) {
      console.error(e);
      window.alert(e instanceof Error ? e.message : "Impossible d'assigner l'expert.");
    } finally {
      setSavingAssign(false);
    }
  }

  function goToDossier(dossierId: string) {
    void navigate({ to: "/admin/dossiers/$dossierId", params: { dossierId } });
  }

  return (
    <div className="min-h-[60vh] bg-[#F8F9FF]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">Dossiers</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Tous les dossiers de la plateforme</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-[#EDE9FE] px-3 py-1.5 text-sm font-semibold text-[#5B50F0]">
          {dossiers.length} total
        </span>
      </div>

      <section className="mt-5 rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] pb-4">
          <Search className="h-5 w-5 text-[#5B50F0]" aria-hidden />
          <h2 className="text-base font-semibold text-[#111827]">Recherche</h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Client</label>
            <input
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              placeholder="Nom, prénom ou numéro de dossier"
              className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Expert</label>
            <input
              value={expertQuery}
              onChange={(e) => setExpertQuery(e.target.value)}
              placeholder="Nom ou prénom de l'expert"
              className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Assureur</label>
            <input
              value={assureurQuery}
              onChange={(e) => setAssureurQuery(e.target.value)}
              placeholder="AXA, MAAF, Allianz..."
              className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Type de sinistre</label>
            <div className="mt-2">
              <Select
                ariaLabel="Type de sinistre"
                value={typeDraft}
                onChange={(v) => setTypeDraft(v as TypeFilter)}
                options={[{ value: "all", label: "Tous" }, ...TYPE_OPTIONS.filter((o) => o.value !== "all")]}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Statut</label>
            <div className="mt-2">
              <Select
                ariaLabel="Statut"
                value={statusDraft}
                onChange={(v) => setStatusDraft(v as StatusFilter)}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Période de dépôt</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input
                type="date"
                value={dateFromDraft}
                onChange={(e) => setDateFromDraft(e.target.value)}
                className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                aria-label="Du"
              />
              <input
                type="date"
                value={dateToDraft}
                onChange={(e) => setDateToDraft(e.target.value)}
                className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                aria-label="Au"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setClientQuery("");
              setExpertQuery("");
              setAssureurQuery("");
              setTypeDraft("all");
              setStatusDraft("all");
              setDateFromDraft("");
              setDateToDraft("");
              setApplied({
                client: "",
                expert: "",
                assureur: "",
                type: "all",
                statut: "all",
                dateFrom: "",
                dateTo: "",
              });
            }}
            className="rounded-lg bg-[#F3F4F6] px-6 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB]"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={() =>
              setApplied({
                client: clientQuery,
                expert: expertQuery,
                assureur: assureurQuery,
                type: typeDraft,
                statut: statusDraft,
                dateFrom: dateFromDraft,
                dateTo: dateToDraft,
              })
            }
            className="rounded-lg bg-[#5B50F0] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Rechercher
          </button>
        </div>
      </section>

      {hasActiveFilters && (
        <p className="mt-3 text-sm text-[#6B7280]">{filtered.length} dossier(s) trouvé(s)</p>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-3">
          <p className="text-sm font-semibold text-[#111827]">Dossiers affichés</p>
          <p className="text-sm font-bold text-[#111827]">{stats.displayed}</p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-3">
          <p className="text-sm font-semibold text-[#111827]">Montant total</p>
          <p className="text-sm font-bold text-[#5B50F0]">{eur(stats.totalAmount)}</p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-3">
          <p className="text-sm font-semibold text-[#111827]">Sans expert</p>
          <p className="text-sm font-bold text-[#111827]">{stats.withoutExpert}</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">Erreur de chargement : {error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-[#6B7280]">Aucun dossier ne correspond à vos filtres</div>
        ) : (
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
                  {pagination.items.map((d) => {
                    const t = typeKey(d.type_sinistre);
                    const typeLabel = TYPE_OPTIONS.find((o) => o.value === t)?.label ?? (d.type_sinistre ?? "Non renseigné");
                    const amt = d.montant_estime == null ? null : amountValue(d.montant_estime);
                    const commission = amt == null ? null : amt * 0.1;
                    return (
                      <tr
                        key={d.id}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer border-b border-[#F3F4F6] hover:bg-[#F8F9FF]"
                        onClick={() => goToDossier(d.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goToDossier(d.id);
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

                        <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{d.assureur ? d.assureur : "Non renseigné"}</td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(d.statut)}`}>
                            {d.statut ?? "Non renseigné"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{amt == null ? "Non renseigné" : eur(amt)}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#5B50F0]">{commission == null ? "Non renseigné" : eur(commission)}</td>
                        <td className="px-5 py-4 text-sm text-[#111827]">{dateLabel(d.date_ouverture)}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                          {d.nom_assure || d.prenom_assure
                            ? `${d.nom_assure ?? ""} ${d.prenom_assure ?? ""}`.trim()
                            : "Assuré inconnu"}
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

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {!d.expert_id && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAssign({
                                    id: d.id,
                                    type_sinistre: d.type_sinistre,
                                    user_id: d.user_id,
                                    expert_id: d.expert_id,
                                    nom_assure: d.nom_assure,
                                    prenom_assure: d.prenom_assure,
                                    nom_expert: d.nom_expert,
                                    prenom_expert: d.prenom_expert,
                                  });
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
                              >
                                <UserPlus className="h-4 w-4" aria-hidden />
                                Assigner
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                goToDossier(d.id);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB]"
                            >
                              <Eye className="h-4 w-4 text-[#6B7280]" aria-hidden />
                              Voir
                            </button>

                            <div className="min-w-[160px]">
                              <Select
                                ariaLabel="Changer le statut"
                                value={String(d.statut ?? "")}
                                onChange={(v) => void updateStatus(d.id, v)}
                                options={[
                                  { value: "", label: "Sélectionner…" },
                                  { value: "en_cours", label: "En cours" },
                                  { value: "en_analyse", label: "En analyse" },
                                  { value: "cloture", label: "Clôturé" },
                                  { value: "gagne", label: "Gagné" },
                                  { value: "perdu", label: "Perdu" },
                                ]}
                              />
                              {updatingStatusId === d.id && <p className="mt-1 text-xs font-medium text-[#6B7280]">Mise à jour…</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.pageCount > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] px-6 py-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB] disabled:opacity-50"
                >
                  ← Précédent
                </button>

                <p className="text-sm font-medium text-[#6B7280]">
                  Page <span className="font-semibold text-[#111827]">{pagination.page}</span> sur{" "}
                  <span className="font-semibold text-[#111827]">{pagination.pageCount}</span>
                </p>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.pageCount, p + 1))}
                  disabled={pagination.page >= pagination.pageCount}
                  className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB] disabled:opacity-50"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {assignOpen && assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[#111827]">Assigner un expert</p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Dossier {shortId(assigning.id)} · {assigning.type_sinistre ?? "Non renseigné"} · Assuré{" "}
                  {assigning.nom_assure || assigning.prenom_assure
                    ? `${assigning.nom_assure ?? ""} ${assigning.prenom_assure ?? ""}`.trim()
                    : "Assuré inconnu"}
                </p>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => {
                  setAssignOpen(false);
                  setAssigning(null);
                  setExpertSearch("");
                  setShowDropdown(false);
                  setSelectedExpertId("");
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB]"
              >
                <X className="h-5 w-5 text-[#6B7280]" aria-hidden />
              </button>
            </div>

            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">UUID de l'expert</label>
              <div style={{ position: "relative" }} onMouseDown={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder="Rechercher un expert par nom..."
                  value={expertSearch}
                  onChange={(e) => {
                    setExpertSearch(e.target.value);
                    setShowDropdown(true);
                    setSelectedExpertId("");
                  }}
                  onFocus={() => setShowDropdown(true)}
                  style={{
                    width: "100%",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />

                {showDropdown && experts && experts.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      zIndex: 100,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {experts
                      .filter((e: any) => {
                        const name = e.full_name || `${e.prenom || ""} ${e.nom || ""}`.trim();
                        return name.toLowerCase().includes(expertSearch.toLowerCase());
                      })
                      .map((expert: any) => {
                        const name =
                          expert.full_name ||
                          `${expert.prenom || ""} ${expert.nom || ""}`.trim() ||
                          "Expert sans nom";
                        return (
                          <div
                            key={expert.id}
                            onClick={() => {
                              setSelectedExpertId(expert.id);
                              setExpertSearch(name);
                              setShowDropdown(false);
                            }}
                            style={{
                              padding: "12px 16px",
                              cursor: "pointer",
                              borderBottom: "1px solid #F3F4F6",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              background: selectedExpertId === expert.id ? "#F8F7FF" : "white",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#F8F7FF")}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = selectedExpertId === expert.id ? "#F8F7FF" : "white";
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{name}</span>
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
                      })}
                    {experts.filter((e: any) => {
                      const name = e.full_name || `${e.prenom || ""} ${e.nom || ""}`.trim();
                      return name.toLowerCase().includes(expertSearch.toLowerCase());
                    }).length === 0 && (
                      <div style={{ padding: "16px", color: "#9CA3AF", textAlign: "center" }}>Aucun expert trouvé</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAssignOpen(false);
                  setAssigning(null);
                  setExpertSearch("");
                  setShowDropdown(false);
                  setSelectedExpertId("");
                }}
                className="rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!selectedExpertId.trim() || savingAssign}
                onClick={() => void confirmAssign()}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
              >
                {savingAssign ? "Assignation…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
