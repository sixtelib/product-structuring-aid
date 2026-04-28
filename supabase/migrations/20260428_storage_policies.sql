-- Storage policies for bucket "documents"
-- Path convention: dossiers/{dossier_id}/{filename}

-- Ensure bucket exists (id = name)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Read: assuré can read files for own dossiers
drop policy if exists "assure_read_own_documents" on storage.objects;
create policy "assure_read_own_documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = 'dossiers'
  and exists (
    select 1
    from public.dossiers d
    where d.id::text = (storage.foldername(name))[2]
      and d.user_id = auth.uid()
  )
);

-- Upload: assuré can upload into dossiers/{dossier_id}/... if dossier belongs to them
drop policy if exists "assure_upload_own_documents" on storage.objects;
create policy "assure_upload_own_documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = 'dossiers'
  and exists (
    select 1
    from public.dossiers d
    where d.id::text = (storage.foldername(name))[2]
      and d.user_id = auth.uid()
  )
);

-- Read: expert can read files for dossiers assigned to them
drop policy if exists "expert_read_assigned_documents" on storage.objects;
create policy "expert_read_assigned_documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = 'dossiers'
  and exists (
    select 1
    from public.dossiers d
    where d.id::text = (storage.foldername(name))[2]
      and d.expert_id = auth.uid()
  )
  and (
    public.has_role(auth.uid(), 'expert'::public.app_role)
    or public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

