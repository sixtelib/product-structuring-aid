import { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Expert } from "@/types";

export type StatusFilter = "all" | "en_cours" | "en_analyse" | "cloture" | "gagne" | "perdu";

export type TypeFilter =
  | "all"
  | "incendie"
  | "degat_des_eaux"
  | "tempete"
  | "accident_auto"
  | "multirisque"
  | "autre";

export interface FiltresDossiers {
  client: string;
  expertIds: string[];
  assureurs: string[];
  type: TypeFilter;
  statut: StatusFilter;
  dateFrom: string;
  dateTo: string;
}

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

function shortId(id: string | null | undefined) {
  if (!id) return "Non renseigné";
  const s = String(id);
  return s.length <= 8 ? s : s.slice(0, 8);
}

function filterExpertDisplayName(p: { id: string; full_name: string | null }) {
  const fn = (p.full_name ?? "").trim();
  return fn || shortId(p.id);
}

function expertKey(ex: Expert): string {
  return String(ex.id ?? ex.expert_id ?? "");
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
        className="h-10 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-[12px] py-[8px] pr-9 text-[0.875rem] font-medium text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
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

export const FILTRES_VIDES: FiltresDossiers = {
  client: "",
  expertIds: [],
  assureurs: [],
  type: "all",
  statut: "all",
  dateFrom: "",
  dateTo: "",
};

export type DossierRechercheBarProps = {
  experts: Expert[];
  assureurs: string[];
  onFiltrer: (filtres: FiltresDossiers) => void;
  onReinitialiser: () => void;
};

export function DossierRechercheBar({ experts, assureurs, onFiltrer, onReinitialiser }: DossierRechercheBarProps) {
  const [clientQuery, setClientQuery] = useState("");
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [selectedAssureurs, setSelectedAssureurs] = useState<string[]>([]);
  const [showExpertDropdown, setShowExpertDropdown] = useState(false);
  const [showAssureurDropdown, setShowAssureurDropdown] = useState(false);
  const [typeDraft, setTypeDraft] = useState<TypeFilter>("all");
  const [statusDraft, setStatusDraft] = useState<StatusFilter>("all");
  const [dateFromDraft, setDateFromDraft] = useState("");
  const [dateToDraft, setDateToDraft] = useState("");

  const expertRows = experts.filter((e) => expertKey(e));

  useEffect(() => {
    const handleClick = () => {
      setShowExpertDropdown(false);
      setShowAssureurDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function reinitialiser() {
    setClientQuery("");
    setSelectedExperts([]);
    setSelectedAssureurs([]);
    setShowExpertDropdown(false);
    setShowAssureurDropdown(false);
    setTypeDraft("all");
    setStatusDraft("all");
    setDateFromDraft("");
    setDateToDraft("");
    onReinitialiser();
  }

  function filtrer() {
    onFiltrer({
      client: clientQuery,
      expertIds: [...selectedExperts],
      assureurs: [...selectedAssureurs],
      type: typeDraft,
      statut: statusDraft,
      dateFrom: dateFromDraft,
      dateTo: dateToDraft,
    });
  }

  return (
    <section className="mt-5 rounded-xl bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div className="border-b border-[#E5E7EB] pb-3">
        <div className="mb-3 flex items-center gap-2.5">
          <Search className="h-5 w-5 shrink-0 text-[#5B50F0]" aria-hidden />
          <h2 className="text-[0.95rem] font-semibold text-[#111827]">Recherche</h2>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Client</label>
          <input
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
            placeholder="Nom, prénom ou numéro de dossier"
            className="mt-2 h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-[12px] py-[8px] text-[0.875rem] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Expert</label>
          <div className="relative mt-2">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                setShowExpertDropdown((v) => !v);
                setShowAssureurDropdown(false);
              }}
              className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] bg-white px-[12px] py-[8px] text-left text-[0.875rem] font-medium text-[#111827] outline-none hover:bg-[#FAFAFA] focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
              aria-expanded={showExpertDropdown}
              aria-haspopup="listbox"
            >
              <span>
                Expert :{" "}
                {selectedExperts.length === 0
                  ? "Tous"
                  : `${selectedExperts.length} sélectionné${selectedExperts.length > 1 ? "s" : ""}`}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#6B7280]" aria-hidden />
            </button>
            {showExpertDropdown ? (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {expertRows.length === 0 ? (
                  <p className="px-4 py-3 text-[0.875rem] text-[#6B7280]">Aucun expert</p>
                ) : (
                  expertRows.map((ex) => {
                    const id = expertKey(ex);
                    const checked = selectedExperts.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex cursor-pointer items-center gap-3 text-[0.875rem] text-[#111827] hover:bg-[#F9FAFB]"
                        style={{ padding: "10px 16px" }}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 rounded border-[#E5E7EB] text-[#5B50F0] focus:ring-[#5B50F0]"
                          checked={checked}
                          onChange={() =>
                            setSelectedExperts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
                          }
                        />
                        <span className="min-w-0 flex-1">{filterExpertDisplayName({ id, full_name: ex.full_name ?? null })}</span>
                      </label>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Assureur</label>
          <div className="relative mt-2">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                setShowAssureurDropdown((v) => !v);
                setShowExpertDropdown(false);
              }}
              className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] bg-white px-[12px] py-[8px] text-left text-[0.875rem] font-medium text-[#111827] outline-none hover:bg-[#FAFAFA] focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
              aria-expanded={showAssureurDropdown}
              aria-haspopup="listbox"
            >
              <span>
                Assureur :{" "}
                {selectedAssureurs.length === 0
                  ? "Tous"
                  : `${selectedAssureurs.length} sélectionné${selectedAssureurs.length > 1 ? "s" : ""}`}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#6B7280]" aria-hidden />
            </button>
            {showAssureurDropdown ? (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {assureurs.length === 0 ? (
                  <p className="px-4 py-3 text-[0.875rem] text-[#6B7280]">Aucun assureur</p>
                ) : (
                  assureurs.map((nom) => {
                    const checked = selectedAssureurs.includes(nom);
                    return (
                      <label
                        key={nom}
                        className="flex cursor-pointer items-center gap-3 text-[0.875rem] text-[#111827] hover:bg-[#F9FAFB]"
                        style={{ padding: "10px 16px" }}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 rounded border-[#E5E7EB] text-[#5B50F0] focus:ring-[#5B50F0]"
                          checked={checked}
                          onChange={() =>
                            setSelectedAssureurs((prev) => (prev.includes(nom) ? prev.filter((x) => x !== nom) : [...prev, nom]))
                          }
                        />
                        <span className="min-w-0 flex-1">{nom}</span>
                      </label>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
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
            <Select ariaLabel="Statut" value={statusDraft} onChange={(v) => setStatusDraft(v as StatusFilter)} options={STATUS_OPTIONS} />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">Période de dépôt</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <input
              type="date"
              value={dateFromDraft}
              onChange={(e) => setDateFromDraft(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-[12px] py-[8px] text-[0.875rem] text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
              aria-label="Du"
            />
            <input
              type="date"
              value={dateToDraft}
              onChange={(e) => setDateToDraft(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-[12px] py-[8px] text-[0.875rem] text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
              aria-label="Au"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            reinitialiser();
          }}
          className="rounded-lg bg-[#F3F4F6] px-6 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB]"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={() => {
            filtrer();
          }}
          className="rounded-lg bg-[#5B50F0] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-95"
        >
          Rechercher
        </button>
      </div>
    </section>
  );
}
