-- Espace client B2C : dossiers, documents, messages
-- Exécuter dans Supabase SQL Editor ou via CLI : supabase db push

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  statut text not null default 'en_analyse',
  type_sinistre text not null,
  date_ouverture timestamptz not null default now(),
  montant_estime numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  constraint dossiers_statut_chk check (
    statut in (
      'en_analyse',
      'attente_documents',
      'negociation',
      'gagne',
      'perdu'
    )
  )
);

create index dossiers_user_id_idx on public.dossiers (user_id);
create index dossiers_created_at_idx on public.dossiers (created_at desc);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers (id) on delete cascade,
  nom text not null,
  statut text not null default 'en_attente',
  created_at timestamptz not null default now(),
  constraint documents_statut_chk check (
    statut in ('valide', 'en_examen', 'en_attente')
  )
);

create index documents_dossier_id_idx on public.documents (dossier_id);
create index documents_created_at_idx on public.documents (created_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers (id) on delete cascade,
  auteur text not null,
  contenu text not null,
  created_at timestamptz not null default now(),
  constraint messages_auteur_chk check (auteur in ('client', 'expert'))
);

create index messages_dossier_id_idx on public.messages (dossier_id);
create index messages_created_at_idx on public.messages (created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.dossiers enable row level security;
alter table public.documents enable row level security;
alter table public.messages enable row level security;

-- Dossiers : le propriétaire uniquement
create policy "dossiers_select_own"
  on public.dossiers for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "dossiers_insert_own"
  on public.dossiers for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "dossiers_update_own"
  on public.dossiers for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "dossiers_delete_own"
  on public.dossiers for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Documents : dossier appartenant à l'utilisateur
create policy "documents_select_via_dossier"
  on public.documents for select
  to authenticated
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = documents.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

create policy "documents_insert_via_dossier"
  on public.documents for insert
  to authenticated
  with check (
    exists (
      select 1 from public.dossiers d
      where d.id = documents.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

create policy "documents_update_via_dossier"
  on public.documents for update
  to authenticated
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = documents.dossier_id
        and d.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.dossiers d
      where d.id = documents.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

create policy "documents_delete_via_dossier"
  on public.documents for delete
  to authenticated
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = documents.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

-- Messages : lecture si dossier à soi ; insertion client seulement sur ses dossiers
create policy "messages_select_via_dossier"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = messages.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

create policy "messages_insert_client_own_dossier"
  on public.messages for insert
  to authenticated
  with check (
    auteur = 'client'
    and exists (
      select 1 from public.dossiers d
      where d.id = messages.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

-- Les experts / back-office insèrent des messages avec auteur = 'expert' via service_role (bypass RLS).

-- ---------------------------------------------------------------------------
-- Grants (API Supabase)
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.dossiers to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert on public.messages to authenticated;

grant all on public.dossiers to service_role;
grant all on public.documents to service_role;
grant all on public.messages to service_role;

-- Test manuel (SQL Editor, en tant qu'utilisateur authentifié le client ne peut pas choisir n'importe quel user_id) :
-- Les inserts côté client respectent RLS : user_id doit être auth.uid().
-- Pour une donnée de démo, utilisez le SQL Editor avec un rôle service ou insérez depuis l'app après connexion.
