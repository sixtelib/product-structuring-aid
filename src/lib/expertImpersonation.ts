import { nomPrenomExpertFromFullName } from "./expertFullNameSplit";

/** Session keys for admin → expert preview (same tab). */
export const IMPERSONATED_EXPERT_ID = "impersonated_expert_id";
export const IMPERSONATED_EXPERT_NAME = "impersonated_expert_name";
export const IMPERSONATED_EXPERT_FULLNAME = "impersonated_expert_fullname";

export function getImpersonatedExpertId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(IMPERSONATED_EXPERT_ID);
}

/** Libellé affiché (bandeau, messagerie) — aligné sur full_name du profil. */
export function getImpersonatedExpertDisplayName(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(IMPERSONATED_EXPERT_NAME);
}

/** full_name stocké pour filtrer dossiers.nom_expert / prenom_expert (split). */
export function getImpersonatedExpertFullName(): string {
  if (typeof window === "undefined") return "";
  return (
    window.sessionStorage.getItem(IMPERSONATED_EXPERT_FULLNAME) ??
    window.sessionStorage.getItem(IMPERSONATED_EXPERT_NAME) ??
    ""
  );
}

/** Aligné sur dossiers : prenom_expert = dernier mot du full_name, nom_expert = le reste. */
export function getImpersonatedExpertNomPrenomForDossierFilter(): { prenom: string; nom: string } {
  const full = getImpersonatedExpertFullName().trim();
  const { nom_expert, prenom_expert } = nomPrenomExpertFromFullName(full);
  return { nom: nom_expert, prenom: prenom_expert };
}

export function setImpersonationFromProfile(expert: { id: string; full_name?: string | null }) {
  const display = (expert.full_name ?? "").trim() || expert.id.slice(0, 8);
  window.sessionStorage.setItem(IMPERSONATED_EXPERT_ID, expert.id);
  window.sessionStorage.setItem(IMPERSONATED_EXPERT_NAME, display);
  window.sessionStorage.setItem(IMPERSONATED_EXPERT_FULLNAME, display);
}

export function clearImpersonation() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(IMPERSONATED_EXPERT_ID);
  window.sessionStorage.removeItem(IMPERSONATED_EXPERT_NAME);
  window.sessionStorage.removeItem(IMPERSONATED_EXPERT_FULLNAME);
}
