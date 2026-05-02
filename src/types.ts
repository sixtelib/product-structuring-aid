import type { Tables } from "@/integrations/supabase/types";

export type Dossier = Tables<"dossiers"> & {
  nom_assure?: string | null;
  prenom_assure?: string | null;
  nom_expert?: string | null;
  prenom_expert?: string | null;
  assureur?: string | null;
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
