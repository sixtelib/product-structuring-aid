-- Experts : lire les dossiers assignés par expert_id OU par correspondance nom/prénom (profil).
-- Les admins conservent l'accès via la policy existante dossiers_admin_select_all.

drop policy if exists "dossiers_select_assigned_expert" on public.dossiers;

create policy "dossiers_select_assigned_expert"
  on public.dossiers for select
  to authenticated
  using (
    (
      expert_id = (select auth.uid())
      and (
        public.has_role((select auth.uid()), 'expert'::public.app_role)
        or public.has_role((select auth.uid()), 'admin'::public.app_role)
      )
    )
    or (
      public.has_role((select auth.uid()), 'expert'::public.app_role)
      and exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and coalesce(p.role, '') = 'expert'
          and trim(coalesce(dossiers.nom_expert, '')) = trim(coalesce(p.nom, ''))
          and trim(coalesce(dossiers.prenom_expert, '')) = trim(coalesce(p.prenom, ''))
      )
    )
  );
