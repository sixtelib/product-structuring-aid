-- Extend allowed values for public.dossiers.statut to support admin workflow

alter table public.dossiers
  drop constraint if exists dossiers_statut_chk;

alter table public.dossiers
  add constraint dossiers_statut_chk check (
    statut in (
      -- legacy client statuses
      'en_analyse',
      'attente_documents',
      'negociation',
      'gagne',
      'perdu',
      -- admin statuses
      'qualification',
      'en_cours',
      'en_attente'
    )
  );

