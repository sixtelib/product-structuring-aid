-- Renommer / fusionner l’ancienne colonne assureur_nom vers assureur_compagnie_nom

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'dossiers' AND column_name = 'assureur_nom'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'dossiers' AND column_name = 'assureur_compagnie_nom'
    ) THEN
      UPDATE public.dossiers
      SET assureur_compagnie_nom = assureur_nom
      WHERE assureur_nom IS NOT NULL
        AND TRIM(assureur_nom) <> ''
        AND (assureur_compagnie_nom IS NULL OR TRIM(assureur_compagnie_nom) = '');
      ALTER TABLE public.dossiers DROP COLUMN assureur_nom;
    ELSE
      ALTER TABLE public.dossiers RENAME COLUMN assureur_nom TO assureur_compagnie_nom;
    END IF;
  END IF;
END $$;
