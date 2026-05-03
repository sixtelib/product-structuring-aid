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

/** Affichage dossier : valeur manquante → tiret cadratin */
export function dossierTexteOuDash(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s.length ? s : "—";
}

export function dossierAdresseUneLigne(
  adresse?: string | null,
  codePostal?: string | null,
  ville?: string | null,
): string {
  const parts = [adresse, codePostal, ville]
    .map((x) => (x == null ? "" : String(x).trim()))
    .filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export function dossierDateOuDash(d: string | null | undefined): string {
  if (!d || !String(d).trim()) return "—";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function dossierExpertiseMontantPropose(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("fr-FR")} €`;
}

export function dossierContactNomPrenom(nom?: string | null, prenom?: string | null): string {
  const line = `${String(prenom ?? "").trim()} ${String(nom ?? "").trim()}`.trim();
  return line.length ? line : "—";
}

export function formaterStatut(statut: string): { label: string; bg: string; color: string } {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    en_analyse: { label: "En analyse", bg: "#FFF3CD", color: "#856404" },
    en_cours: { label: "En cours", bg: "#D1ECF1", color: "#0C5460" },
    negociation: { label: "Négociation", bg: "#EEE9FF", color: "#5B50F0" },
    négociation: { label: "Négociation", bg: "#EEE9FF", color: "#5B50F0" },
    gagne: { label: "Gagné", bg: "#D4EDDA", color: "#155724" },
    gagné: { label: "Gagné", bg: "#D4EDDA", color: "#155724" },
    perdu: { label: "Perdu", bg: "#F8D7DA", color: "#721C24" },
    cloture: { label: "Clôturé", bg: "#E2E3E5", color: "#383D41" },
    clôturé: { label: "Clôturé", bg: "#E2E3E5", color: "#383D41" },
  };
  return map[statut] ?? { label: statut, bg: "#E2E3E5", color: "#383D41" };
}
