-- Notes internes expert sur les dossiers + accès RLS pour experts assignés

alter table public.dossiers
  add column if not exists notes_expert text;

-- Permettre à l'expert assigné (ou admin) de mettre à jour le dossier (ex: notes_expert)
drop policy if exists "dossiers_update_assigned_expert" on public.dossiers;
create policy "dossiers_update_assigned_expert"
  on public.dossiers for update
  to authenticated
  using (
    expert_id = (select auth.uid())
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  )
  with check (
    expert_id = (select auth.uid())
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- Documents : lecture par l'expert assigné
drop policy if exists "documents_select_assigned_expert" on public.documents;
create policy "documents_select_assigned_expert"
  on public.documents for select
  to authenticated
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = documents.dossier_id
        and d.expert_id = (select auth.uid())
    )
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- Messages : lecture par l'expert assigné
drop policy if exists "messages_select_assigned_expert" on public.messages;
create policy "messages_select_assigned_expert"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = messages.dossier_id
        and d.expert_id = (select auth.uid())
    )
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- Messages : insertion par l'expert assigné (auteur = 'expert')
drop policy if exists "messages_insert_expert_assigned_dossier" on public.messages;
create policy "messages_insert_expert_assigned_dossier"
  on public.messages for insert
  to authenticated
  with check (
    auteur = 'expert'
    and exists (
      select 1 from public.dossiers d
      where d.id = messages.dossier_id
        and d.expert_id = (select auth.uid())
    )
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

