/** Libellés et styles pour l'espace client B2C (alignés sur les valeurs en base). */

export type DossierStatutDb =
  | "en_analyse"
  | "attente_documents"
  | "negociation"
  | "gagne"
  | "perdu"
  | "qualification"
  | "en_cours"
  | "en_attente";

export const DOSSIER_STATUS_META: Record<
  DossierStatutDb,
  { label: string; toneClass: string }
> = {
  qualification: {
    label: "Qualification",
    toneClass: "bg-accent/10 text-accent",
  },
  en_cours: {
    label: "En cours",
    toneClass: "bg-primary/10 text-primary",
  },
  en_attente: {
    label: "En attente",
    toneClass: "bg-accent/10 text-accent",
  },
  en_analyse: {
    label: "En cours d'analyse",
    toneClass: "bg-primary/10 text-primary",
  },
  attente_documents: {
    label: "En attente de documents",
    toneClass: "bg-accent/10 text-accent",
  },
  negociation: {
    label: "Négociation en cours",
    toneClass: "bg-primary/15 text-primary",
  },
  gagne: {
    label: "Dossier gagné",
    toneClass: "bg-emerald-500/12 text-emerald-700",
  },
  perdu: {
    label: "Dossier perdu",
    toneClass: "bg-destructive/10 text-destructive",
  },
};

export type DocumentStatutDb = "valide" | "en_examen" | "en_attente";

const DOC_STATUS_LABEL: Record<DocumentStatutDb, string> = {
  valide: "Validé",
  en_examen: "En examen",
  en_attente: "En attente",
};

const DOC_STATUS_CLASS: Record<DocumentStatutDb, string> = {
  valide: "bg-emerald-500/12 text-emerald-700",
  en_examen: "bg-primary/10 text-primary",
  en_attente: "bg-accent/10 text-accent",
};

export function dossierStatusMeta(statut: string) {
  const key = statut as DossierStatutDb;
  return DOSSIER_STATUS_META[key] ?? {
    label: statut,
    toneClass: "bg-muted text-muted-foreground",
  };
}

export function formatDocumentStatusDb(statut: string): { label: string; className: string } {
  if (statut === "recu") {
    return { label: "Reçu", className: "bg-primary/10 text-primary" };
  }
  const key = statut as DocumentStatutDb;
  if (key in DOC_STATUS_LABEL) {
    return {
      label: DOC_STATUS_LABEL[key as DocumentStatutDb],
      className: DOC_STATUS_CLASS[key as DocumentStatutDb],
    };
  }
  return {
    label: statut,
    className: "bg-muted text-muted-foreground",
  };
}
