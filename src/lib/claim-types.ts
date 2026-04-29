export const CLAIM_TYPES = [
  { value: "degat_des_eaux", label: "Dégât des eaux" },
  { value: "incendie", label: "Incendie" },
  { value: "vol_cambriolage", label: "Vol / cambriolage" },
  { value: "catastrophe_naturelle", label: "Catastrophe naturelle" },
  { value: "bris_de_glace", label: "Bris de glace" },
  { value: "dommage_vehicule", label: "Dommage véhicule" },
  { value: "responsabilite_civile", label: "Responsabilité civile" },
  { value: "autre", label: "Autre" },
] as const;

export const CASE_STATUS_LABELS: Record<string, { label: string; tone: "info" | "warning" | "success" | "danger" | "muted" }> = {
  nouveau: { label: "Nouveau", tone: "info" },
  qualification: { label: "Qualification", tone: "info" },
  en_analyse: { label: "En analyse", tone: "warning" },
  en_negociation: { label: "En négociation", tone: "warning" },
  expertise: { label: "Expertise", tone: "warning" },
  cloture_succes: { label: "Clôturé ,  succès", tone: "success" },
  cloture_echec: { label: "Clôturé ,  échec", tone: "danger" },
  abandonne: { label: "Abandonné", tone: "muted" },
};

export function claimTypeLabel(value: string): string {
  return CLAIM_TYPES.find((t) => t.value === value)?.label ?? value;
}
