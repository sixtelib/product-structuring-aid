-- Étendre messages.auteur : admin + UUID (assuré = auth.uid() en texte)
alter table public.messages drop constraint if exists messages_auteur_chk;

alter table public.messages
  add constraint messages_auteur_chk check (
    auteur in ('client', 'expert', 'admin')
    or auteur ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  );

-- Insert côté assuré : auteur = 'client' (historique) ou = id utilisateur
drop policy if exists "messages_insert_client_own_dossier" on public.messages;

create policy "messages_insert_client_own_dossier"
  on public.messages for insert
  to authenticated
  with check (
    (
      auteur = 'client'
      or auteur = (select auth.uid())::text
    )
    and exists (
      select 1 from public.dossiers d
      where d.id = messages.dossier_id
        and d.user_id = (select auth.uid())
    )
  );

-- Realtime : nouveaux messages visibles sans rechargement
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
