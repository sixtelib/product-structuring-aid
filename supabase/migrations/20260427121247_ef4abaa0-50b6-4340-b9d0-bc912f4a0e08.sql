-- 1. Enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('assure', 'expert', 'admin');

-- 2. Enum pour les types de sinistre
CREATE TYPE public.claim_type AS ENUM (
  'degat_des_eaux',
  'incendie',
  'vol_cambriolage',
  'catastrophe_naturelle',
  'bris_de_glace',
  'dommage_vehicule',
  'responsabilite_civile',
  'autre'
);

-- 3. Enum pour le statut de dossier
CREATE TYPE public.case_status AS ENUM (
  'nouveau',
  'qualification',
  'en_analyse',
  'en_negociation',
  'expertise',
  'cloture_succes',
  'cloture_echec',
  'abandonne'
);

-- 4. Enum pour le type d'événement
CREATE TYPE public.event_type AS ENUM (
  'creation',
  'document_ajoute',
  'message',
  'changement_statut',
  'analyse_ia',
  'expert_assigne',
  'note_interne'
);

-- 5. Table profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Table user_roles (sécurité critique : séparée des profiles)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Fonction has_role (security definer pour éviter récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 8. Table cases
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reference TEXT NOT NULL UNIQUE DEFAULT ('SIN-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6)),
  title TEXT NOT NULL,
  description TEXT,
  claim_type claim_type NOT NULL,
  status case_status NOT NULL DEFAULT 'nouveau',
  insurer_name TEXT,
  policy_number TEXT,
  incident_date DATE,
  estimated_amount NUMERIC(12,2),
  insurer_offer NUMERIC(12,2),
  obtained_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- 9. Table case_documents
CREATE TABLE public.case_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- 10. Table case_events
CREATE TABLE public.case_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type event_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_visible_to_client BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;

-- 11. Table case_messages
CREATE TABLE public.case_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;

-- 12. Table case_analyses
CREATE TABLE public.case_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  model TEXT,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.case_analyses ENABLE ROW LEVEL SECURITY;

-- 13. Table invoices
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  fee_rate NUMERIC(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ===============================
-- RLS Policies
-- ===============================

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Experts can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- cases
CREATE POLICY "Owners can view their cases" ON public.cases
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can create cases" ON public.cases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their cases (limited)" ON public.cases
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Experts can view all cases" ON public.cases
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Experts can update all cases" ON public.cases
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));

-- case_documents
CREATE POLICY "Owners can view their docs" ON public.case_documents
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.owner_id = auth.uid()));
CREATE POLICY "Owners can upload docs" ON public.case_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.owner_id = auth.uid())
  );
CREATE POLICY "Owners can delete their docs" ON public.case_documents
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.owner_id = auth.uid()));
CREATE POLICY "Experts can view all docs" ON public.case_documents
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Experts can upload docs" ON public.case_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by AND
    (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'))
  );

-- case_events
CREATE POLICY "Owners can view client-visible events" ON public.case_events
  FOR SELECT TO authenticated
  USING (
    is_visible_to_client = true AND
    EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.owner_id = auth.uid())
  );
CREATE POLICY "Experts can view all events" ON public.case_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Experts can create events" ON public.case_events
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create events for owner" ON public.case_events
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.owner_id = auth.uid())
  );

-- case_messages
CREATE POLICY "Owners can view their messages" ON public.case_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.owner_id = auth.uid()));
CREATE POLICY "Owners can send messages" ON public.case_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.owner_id = auth.uid())
  );
CREATE POLICY "Experts can view all messages" ON public.case_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Experts can send messages" ON public.case_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'))
  );

-- case_analyses
CREATE POLICY "Owners can view analyses summary" ON public.case_analyses
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.owner_id = auth.uid()));
CREATE POLICY "Experts can manage analyses" ON public.case_analyses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));

-- invoices
CREATE POLICY "Owners can view their invoices" ON public.invoices
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===============================
-- Triggers
-- ===============================

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- handle_new_user : crée profile + rôle assuré à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'assure');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket privé pour documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-files', 'case-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Owners can read their files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'case-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners can upload their files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'case-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners can delete their files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'case-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Experts can read all case files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'case-files' AND
  (public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'))
);
