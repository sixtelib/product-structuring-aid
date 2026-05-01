alter table public.dossiers
  add column if not exists analyse_ia text;

alter table public.dossiers
  add column if not exists analyse_ia_date timestamptz;

