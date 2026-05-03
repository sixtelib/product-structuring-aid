import type { Tables } from "@/integrations/supabase/types";

export type Dossier = Tables<"dossiers"> & {
  nom_assure?: string | null;
  prenom_assure?: string | null;
  nom_expert?: string | null;
  prenom_expert?: string | null;
  assureur?: string | null;
  sinistre_numero_dossier?: string | null;
  sinistre_adresse?: string | null;
  sinistre_code_postal?: string | null;
  sinistre_ville?: string | null;
  expertise_date_edition?: string | null;
  expertise_montant_propose?: number | string | null;
  assureur_compagnie_nom?: string | null;
  assureur_contact_nom?: string | null;
  assureur_contact_prenom?: string | null;
  assureur_contact_email?: string | null;
  assureur_contact_telephone?: string | null;
  assureur_adresse?: string | null;
  assureur_code_postal?: string | null;
  assureur_ville?: string | null;
  expert_email?: string | null;
  expert_telephone?: string | null;
  expert_adresse?: string | null;
  expert_code_postal?: string | null;
  expert_ville?: string | null;
  email_assure?: string | null;
  telephone_assure?: string | null;
  adresse_assure?: string | null;
  code_postal_assure?: string | null;
  ville_assure?: string | null;
};

export type Document = Tables<"documents"> & { chemin?: string | null };

export type Message = Tables<"messages">;

export type Expert = {
  id?: string;
  expert_id?: string;
  full_name?: string | null;
  nom_expert?: string | null;
  prenom_expert?: string | null;
  role?: string | null;
  specialite?: string | null;
};

export type ProfileShort = Pick<Tables<"profiles">, "full_name" | "email">;
