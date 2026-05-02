import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { assignExpertSelectOptionLabel } from "@/lib/expertFullNameSplit";
import type { Dossier, Expert } from "@/types";

function shortId(id: string | null | undefined) {
  if (!id) return "Non renseigné";
  const s = String(id);
  return s.length <= 8 ? s : s.slice(0, 8);
}

function expertRowId(ex: Expert): string {
  return String(ex.id ?? ex.expert_id ?? "");
}

export type AssignModalProps = {
  dossier: Dossier | null;
  experts: Expert[];
  onConfirmer: (expertId: string) => Promise<void>;
  onFermer: () => void;
};

export function AssignModal({ dossier, experts, onConfirmer, onFermer }: AssignModalProps) {
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [savingAssign, setSavingAssign] = useState(false);

  useEffect(() => {
    setSelectedExpertId("");
  }, [dossier?.id]);

  if (!dossier) return null;

  const rows = experts.filter((e) => expertRowId(e));

  async function confirm() {
    const expertId = selectedExpertId.trim();
    if (!expertId) return;
    setSavingAssign(true);
    try {
      await onConfirmer(expertId);
      setSelectedExpertId("");
      onFermer();
    } catch (e) {
      console.error(e);
      window.alert(e instanceof Error ? e.message : "Impossible d'assigner l'expert.");
    } finally {
      setSavingAssign(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-[#111827]">Assigner un expert</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Dossier {shortId(dossier.id)} · {dossier.type_sinistre ?? "Non renseigné"} · Assuré{" "}
              {dossier.nom_assure || dossier.prenom_assure
                ? `${dossier.nom_assure ?? ""} ${dossier.prenom_assure ?? ""}`.trim()
                : "Assuré inconnu"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => {
              setSelectedExpertId("");
              onFermer();
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB]"
          >
            <X className="h-5 w-5 text-[#6B7280]" aria-hidden />
          </button>
        </div>

        <div className="mt-6" onMouseDown={(e) => e.stopPropagation()}>
          <label htmlFor="assign-expert-select" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
            Expert
          </label>
          <div className="relative mt-2">
            <select
              id="assign-expert-select"
              value={selectedExpertId}
              onChange={(e) => setSelectedExpertId(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 pr-9 text-[0.875rem] font-medium text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
            >
              <option value="">Sélectionner un expert…</option>
              {rows.map((ex) => {
                const id = expertRowId(ex);
                return (
                  <option key={id} value={id}>
                    {assignExpertSelectOptionLabel({ id, full_name: ex.full_name ?? null })}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" aria-hidden />
          </div>
          {rows.length === 0 ? (
            <p className="mt-2 text-xs text-[#6B7280]">Aucun expert dans la base. Vérifiez les profils (rôle expert).</p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedExpertId("");
              onFermer();
            }}
            className="rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB]"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!selectedExpertId.trim() || savingAssign}
            onClick={() => void confirm()}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
          >
            {savingAssign ? "Assignation…" : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
