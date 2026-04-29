/** Clés localStorage pour le parcours qualification (chatbot → inscription / nouveau dossier). */
export const QUALIFICATION_STORAGE_KEYS = {
  evaluation: "vertual_evaluation",
  collectedData: "vertual_collected_data",
  pendingFiles: "vertual_pending_files",
} as const;

/** Anciennes clés encore présentes chez certains utilisateurs (ne pas renommer : identifiants localStorage réels). */
const LEGACY_KEYS = {
  evaluation: "claimeur_evaluation",
  collectedData: "claimeur_collected_data",
  pendingFiles: "claimeur_pending_files",
} as const;

let legacyMigrated = false;

/** Copie les anciennes clés `claimeur_*` vers `vertual_*` puis supprime les anciennes (une fois par session). */
export function migrateLegacyQualificationLocalStorage(): void {
  if (typeof window === "undefined" || legacyMigrated) return;
  legacyMigrated = true;

  const pairs: [string, string][] = [
    [LEGACY_KEYS.evaluation, QUALIFICATION_STORAGE_KEYS.evaluation],
    [LEGACY_KEYS.collectedData, QUALIFICATION_STORAGE_KEYS.collectedData],
    [LEGACY_KEYS.pendingFiles, QUALIFICATION_STORAGE_KEYS.pendingFiles],
  ];

  for (const [oldKey, newKey] of pairs) {
    const oldVal = window.localStorage.getItem(oldKey);
    if (oldVal === null) continue;
    if (window.localStorage.getItem(newKey) === null) {
      window.localStorage.setItem(newKey, oldVal);
    }
    window.localStorage.removeItem(oldKey);
  }
}
