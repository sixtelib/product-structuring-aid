-- Documents: store storage path and allow 'recu' status for uploads

alter table public.documents
  add column if not exists storage_path text;

alter table public.documents
  drop constraint if exists documents_statut_chk;

alter table public.documents
  add constraint documents_statut_chk
  check (statut in ('recu', 'valide', 'en_examen', 'en_attente'));

create index if not exists documents_storage_path_idx on public.documents (storage_path);

