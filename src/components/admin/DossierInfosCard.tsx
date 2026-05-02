import { FileText } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import type { Dossier } from "@/types";
import { formaterDate, formaterMontant, formaterStatut } from "@/utils/calculs";

function cardClass() {
  return "rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]";
}

export function DossierInfosCard({ dossier }: { dossier: Dossier }) {
  const commission = useMemo(() => {
    if (dossier.montant_estime == null) return null;
    const n = Number(dossier.montant_estime);
    if (!Number.isFinite(n)) return null;
    return n * 0.1;
  }, [dossier.montant_estime]);

  const assureurLabel = dossier.assureur_nom ?? dossier.assureur ?? "Non renseigné";
  const statutFmt = formaterStatut(dossier.statut);

  async function copyId() {
    if (!dossier.id) return;
    try {
      await navigator.clipboard.writeText(dossier.id);
      toast.success("ID copié.");
    } catch {
      toast.error("Impossible de copier.");
    }
  }

  return (
    <section className={cardClass()}>
      <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
        <FileText className="h-5 w-5 text-[#5B50F0]" aria-hidden />
        <h2 className="text-lg font-semibold text-[#111827]">Détails du dossier</h2>
      </div>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">ID</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2">
            <code className="break-all text-sm text-[#111827]">{dossier.id}</code>
            <button
              type="button"
              onClick={() => void copyId()}
              className="rounded-lg bg-[#F3F4F6] px-2 py-1 text-xs font-semibold text-[#111827] hover:bg-[#E5E7EB]"
            >
              Copier
            </button>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Date d'ouverture</dt>
          <dd className="mt-1 text-sm font-medium text-[#111827]">{formaterDate(dossier.date_ouverture)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Type de sinistre</dt>
          <dd className="mt-1 text-sm font-medium text-[#111827]">{dossier.type_sinistre}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Statut</dt>
          <dd className="mt-1">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: statutFmt.bg, color: statutFmt.color }}
            >
              {statutFmt.label}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Montant estimé</dt>
          <dd className="mt-1 text-sm font-medium text-[#111827]">{formaterMontant(dossier.montant_estime)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Commission Vertual</dt>
          <dd className="mt-1 text-sm font-semibold text-[#5B50F0]">
            {commission == null ? "Non renseigné" : formaterMontant(commission)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Assureur</dt>
          <dd className="mt-1 text-sm font-medium text-[#111827]">{assureurLabel}</dd>
        </div>
        {dossier.description ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{dossier.description}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
