-- Mandats hors dossier : colonnes, statut, RLS et chemins storage mandats/{user_id}/...

alter table public.documents alter column dossier_id drop not null;

alter table public.documents
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.documents
  add column if not exists type text;

alter table public.documents
  add column if not exists chemin text;

alter table public.documents drop constraint if exists documents_statut_chk;

alter table public.documents
  add constraint documents_statut_chk
  check (statut in ('recu', 'valide', 'en_examen', 'en_attente', 'signé'));

-- Assuré : lire / insérer son mandat (document sans dossier)
drop policy if exists "documents_select_own_mandat" on public.documents;
create policy "documents_select_own_mandat"
  on public.documents for select
  to authenticated
  using (
    documents.user_id is not null
    and documents.user_id = auth.uid()
    and documents.dossier_id is null
    and coalesce(documents.type, '') = 'mandat'
  );

drop policy if exists "documents_insert_own_mandat" on public.documents;
create policy "documents_insert_own_mandat"
  on public.documents for insert
  to authenticated
  with check (
    documents.user_id = auth.uid()
    and documents.dossier_id is null
    and coalesce(documents.type, '') = 'mandat'
  );

-- Expert (ou admin) : lire le mandat d’un assuré dont il a au moins un dossier assigné
drop policy if exists "documents_select_mandat_assigned_expert" on public.documents;
create policy "documents_select_mandat_assigned_expert"
  on public.documents for select
  to authenticated
  using (
    documents.type = 'mandat'
    and documents.user_id is not null
    and documents.dossier_id is null
    and exists (
      select 1
      from public.dossiers d
      where d.user_id = documents.user_id
        and d.expert_id = auth.uid()
    )
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- Storage : mandats/{user_id}/...
drop policy if exists "assure_read_own_mandats" on storage.objects;
create policy "assure_read_own_mandats"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'mandats'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "assure_upload_own_mandats" on storage.objects;
create policy "assure_upload_own_mandats"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'mandats'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "expert_read_client_mandats" on storage.objects;
create policy "expert_read_client_mandats"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'mandats'
    and exists (
      select 1
      from public.dossiers d
      where d.user_id::text = (storage.foldername(name))[2]
        and d.expert_id = auth.uid()
    )
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

drop policy if exists "admin_read_all_mandats" on storage.objects;
create policy "admin_read_all_mandats"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'mandats'
    and public.has_role(auth.uid(), 'admin'::public.app_role)
  );
