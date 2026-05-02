export function formaterMontant(n: number | null | undefined): string {
  const v = n == null ? 0 : Number(n);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v) ? v : 0);
}

export function formaterDate(d: string | null | undefined): string {
  if (!d) return "Non renseigné";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "Non renseigné";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formaterStatut(statut: string): { label: string; bg: string; color: string } {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    en_analyse: { label: "En analyse", bg: "#FFF3CD", color: "#856404" },
    en_cours: { label: "En cours", bg: "#D1ECF1", color: "#0C5460" },
    negociation: { label: "Négociation", bg: "#EEE9FF", color: "#5B50F0" },
    "négociation": { label: "Négociation", bg: "#EEE9FF", color: "#5B50F0" },
    gagne: { label: "Gagné", bg: "#D4EDDA", color: "#155724" },
    gagné: { label: "Gagné", bg: "#D4EDDA", color: "#155724" },
    perdu: { label: "Perdu", bg: "#F8D7DA", color: "#721C24" },
    cloture: { label: "Clôturé", bg: "#E2E3E5", color: "#383D41" },
    clôturé: { label: "Clôturé", bg: "#E2E3E5", color: "#383D41" },
  };
  return map[statut] ?? { label: statut, bg: "#E2E3E5", color: "#383D41" };
}
