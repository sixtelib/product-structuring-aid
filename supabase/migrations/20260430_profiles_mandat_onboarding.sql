-- Mandat global à l'inscription (profil assuré)
alter table public.profiles
  add column if not exists mandat_signe boolean not null default false;

alter table public.profiles
  add column if not exists mandat_signe_le timestamptz null;

alter table public.profiles
  add column if not exists mandat_signature text null;

alter table public.profiles
  add column if not exists mandat_email text null;
