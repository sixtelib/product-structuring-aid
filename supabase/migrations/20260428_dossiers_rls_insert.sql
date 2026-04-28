-- Ensure RLS policies allow clients to read/insert their own dossiers

alter table public.dossiers enable row level security;

-- Recreate the two critical client policies (idempotent)
drop policy if exists "dossiers_select_own" on public.dossiers;
create policy "dossiers_select_own"
  on public.dossiers for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "dossiers_insert_own" on public.dossiers;
create policy "dossiers_insert_own"
  on public.dossiers for insert
  to authenticated
  with check (user_id = (select auth.uid()));

