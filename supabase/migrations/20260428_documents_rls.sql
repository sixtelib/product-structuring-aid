-- Ensure RLS policies allow documents insert/read for clients and read for assigned experts

alter table public.documents enable row level security;

-- Assuré : SELECT ses documents (via dossier.owner)
drop policy if exists "documents_select_via_dossier" on public.documents;
create policy "documents_select_via_dossier"
  on public.documents for select
  to authenticated
  using (
    exists (
      select 1
      from public.dossiers d
      where d.id = documents.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

-- Assuré : INSERT si le dossier lui appartient
drop policy if exists "documents_insert_via_dossier" on public.documents;
create policy "documents_insert_via_dossier"
  on public.documents for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.dossiers d
      where d.id = documents.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

-- Expert : SELECT documents des dossiers assignés (expert_id = auth.uid())
drop policy if exists "documents_select_assigned_expert" on public.documents;
create policy "documents_select_assigned_expert"
  on public.documents for select
  to authenticated
  using (
    exists (
      select 1
      from public.dossiers d
      where d.id = documents.dossier_id
        and d.expert_id = (select auth.uid())
    )
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

