-- Admin full access policies (RLS)

-- Dossiers
alter table public.dossiers enable row level security;

drop policy if exists "dossiers_admin_select_all" on public.dossiers;
create policy "dossiers_admin_select_all"
  on public.dossiers for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "dossiers_admin_insert_all" on public.dossiers;
create policy "dossiers_admin_insert_all"
  on public.dossiers for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "dossiers_admin_update_all" on public.dossiers;
create policy "dossiers_admin_update_all"
  on public.dossiers for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "dossiers_admin_delete_all" on public.dossiers;
create policy "dossiers_admin_delete_all"
  on public.dossiers for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Documents
alter table public.documents enable row level security;

drop policy if exists "documents_admin_select_all" on public.documents;
create policy "documents_admin_select_all"
  on public.documents for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "documents_admin_insert_all" on public.documents;
create policy "documents_admin_insert_all"
  on public.documents for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "documents_admin_update_all" on public.documents;
create policy "documents_admin_update_all"
  on public.documents for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "documents_admin_delete_all" on public.documents;
create policy "documents_admin_delete_all"
  on public.documents for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Messages
alter table public.messages enable row level security;

drop policy if exists "messages_admin_select_all" on public.messages;
create policy "messages_admin_select_all"
  on public.messages for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "messages_admin_insert_all" on public.messages;
create policy "messages_admin_insert_all"
  on public.messages for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "messages_admin_update_all" on public.messages;
create policy "messages_admin_update_all"
  on public.messages for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "messages_admin_delete_all" on public.messages;
create policy "messages_admin_delete_all"
  on public.messages for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "profiles_admin_insert_all" on public.profiles;
create policy "profiles_admin_insert_all"
  on public.profiles for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all"
  on public.profiles for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "profiles_admin_delete_all" on public.profiles;
create policy "profiles_admin_delete_all"
  on public.profiles for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

