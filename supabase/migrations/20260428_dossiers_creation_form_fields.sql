-- Add fields needed by /dashboard/nouveau creation form

alter table public.dossiers
  add column if not exists titre text,
  add column if not exists description text,
  add column if not exists assureur_nom text,
  add column if not exists numero_contrat text,
  add column if not exists date_sinistre date,
  add column if not exists offre_assureur numeric(14, 2);

