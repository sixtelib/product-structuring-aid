/**
 * Dérive nom_expert / prenom_expert depuis profiles.full_name :
 * prenom_expert = dernier mot, nom_expert = tout ce qui précède.
 * Ex. "Martine Lib" → nom_expert "Martine", prenom_expert "Lib".
 */
export function nomPrenomExpertFromFullName(fullName: string | null | undefined): {
  nom_expert: string;
  prenom_expert: string;
} {
  const parts = String(fullName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { nom_expert: "", prenom_expert: "" };
  if (parts.length === 1) return { nom_expert: "", prenom_expert: parts[0] ?? "" };
  const prenom_expert = parts[parts.length - 1] ?? "";
  const nom_expert = parts.slice(0, -1).join(" ");
  return { nom_expert, prenom_expert };
}

/** Libellé d’option (select) : "Nom Prénom" issu du split, + (spécialité) si présente. */
export function assignExpertSelectOptionLabel(ex: { full_name: string | null; specialite: string | null }): string {
  const full = (ex.full_name ?? "").trim();
  const sp = (ex.specialite ?? "").trim();
  const { nom_expert, prenom_expert } = nomPrenomExpertFromFullName(full);
  const ordered = `${nom_expert} ${prenom_expert}`.trim() || full || "Sans nom";
  if (!sp) return ordered;
  return `${ordered} (${sp})`;
}
