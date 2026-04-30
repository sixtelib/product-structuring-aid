-- Champs profil enrichis depuis l'extraction IA (qualification)

alter table public.profiles add column if not exists prenom text;
alter table public.profiles add column if not exists nom text;
alter table public.profiles add column if not exists adresse text;
alter table public.profiles add column if not exists telephone text;
alter table public.profiles add column if not exists email_contact text;
alter table public.profiles add column if not exists numero_contrat text;
alter table public.profiles add column if not exists assureur_principal text;
