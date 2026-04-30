-- Consentement mandat de représentation (création dossier côté assuré)
alter table public.dossiers
  add column if not exists mandat_signe boolean not null default false;

alter table public.dossiers
  add column if not exists mandat_signe_le timestamptz null;

alter table public.dossiers
  add column if not exists mandat_signature text null;
