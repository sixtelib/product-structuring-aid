-- Add expert assignment to B2C dossiers

alter table public.dossiers
  add column if not exists expert_id uuid references auth.users (id) on delete set null;

create index if not exists dossiers_expert_id_idx on public.dossiers (expert_id);

-- RLS: allow experts/admins to read dossiers assigned to them
drop policy if exists "dossiers_select_assigned_expert" on public.dossiers;
create policy "dossiers_select_assigned_expert"
  on public.dossiers for select
  to authenticated
  using (
    expert_id = (select auth.uid())
    and (
      public.has_role(auth.uid(), 'expert'::public.app_role)
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

