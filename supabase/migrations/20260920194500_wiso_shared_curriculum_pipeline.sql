-- Shared, admin-owned curriculum source of truth.
CREATE TABLE IF NOT EXISTS public.curriculum_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  page_count INTEGER,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending','processing','completed','failed','needs_review')),
  processing_error TEXT,
  analysis_version TEXT NOT NULL DEFAULT 'wiso-curriculum-v1',
  is_published BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE(subject_id, version),
  UNIQUE(storage_path),
  UNIQUE(subject_id, checksum_sha256)
);

CREATE TABLE IF NOT EXISTS public.curriculum_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  page_start INTEGER,
  page_end INTEGER,
  confidence NUMERIC(5,4),
  needs_review BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.curriculum_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.curriculum_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  page_start INTEGER,
  page_end INTEGER,
  confidence NUMERIC(5,4),
  needs_review BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.curriculum_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source_page INTEGER,
  confidence NUMERIC(5,4),
  needs_review BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.curriculum_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  extracted_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(curriculum_version_id, page_number)
);
CREATE TABLE IF NOT EXISTS public.curriculum_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','needs_review')),
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(curriculum_version_id)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_versions_subject ON public.curriculum_versions(subject_id, is_published);
CREATE INDEX IF NOT EXISTS idx_curriculum_units_version ON public.curriculum_units(curriculum_version_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_unit ON public.curriculum_lessons(unit_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_curriculum_pages_version ON public.curriculum_pages(curriculum_version_id, page_number);
CREATE INDEX IF NOT EXISTS idx_curriculum_jobs_status ON public.curriculum_processing_jobs(status, updated_at);

ALTER TABLE public.curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_processing_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS curriculum_versions_admin ON public.curriculum_versions;
CREATE POLICY curriculum_versions_admin ON public.curriculum_versions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS curriculum_versions_student_read ON public.curriculum_versions;
CREATE POLICY curriculum_versions_student_read ON public.curriculum_versions
FOR SELECT TO authenticated
USING (is_published);

DROP POLICY IF EXISTS curriculum_units_admin ON public.curriculum_units;
CREATE POLICY curriculum_units_admin ON public.curriculum_units FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS curriculum_units_student_read ON public.curriculum_units;
CREATE POLICY curriculum_units_student_read ON public.curriculum_units FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.curriculum_versions v WHERE v.id = curriculum_version_id AND v.is_published));

DROP POLICY IF EXISTS curriculum_lessons_admin ON public.curriculum_lessons;
CREATE POLICY curriculum_lessons_admin ON public.curriculum_lessons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS curriculum_lessons_student_read ON public.curriculum_lessons;
CREATE POLICY curriculum_lessons_student_read ON public.curriculum_lessons FOR SELECT TO authenticated
USING (archived_at IS NULL AND EXISTS (SELECT 1 FROM public.curriculum_versions v WHERE v.id = curriculum_version_id AND v.is_published));

DROP POLICY IF EXISTS curriculum_concepts_admin ON public.curriculum_concepts;
CREATE POLICY curriculum_concepts_admin ON public.curriculum_concepts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS curriculum_concepts_student_read ON public.curriculum_concepts;
CREATE POLICY curriculum_concepts_student_read ON public.curriculum_concepts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.curriculum_lessons l JOIN public.curriculum_versions v ON v.id = l.curriculum_version_id WHERE l.id = lesson_id AND v.is_published));

DROP POLICY IF EXISTS curriculum_pages_admin ON public.curriculum_pages;
CREATE POLICY curriculum_pages_admin ON public.curriculum_pages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS curriculum_pages_student_read ON public.curriculum_pages;
CREATE POLICY curriculum_pages_student_read ON public.curriculum_pages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.curriculum_versions v WHERE v.id = curriculum_version_id AND v.is_published));

DROP POLICY IF EXISTS curriculum_jobs_admin ON public.curriculum_processing_jobs;
CREATE POLICY curriculum_jobs_admin ON public.curriculum_processing_jobs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.curriculum_versions, public.curriculum_units, public.curriculum_lessons, public.curriculum_concepts, public.curriculum_pages TO authenticated;
GRANT ALL ON public.curriculum_versions, public.curriculum_units, public.curriculum_lessons, public.curriculum_concepts, public.curriculum_pages, public.curriculum_processing_jobs TO service_role;

INSERT INTO storage.buckets (id, name, public)
VALUES ('curriculum-books', 'curriculum-books', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS curriculum_books_admin_read ON storage.objects;
CREATE POLICY curriculum_books_admin_read ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'curriculum-books' AND public.is_admin());
DROP POLICY IF EXISTS curriculum_books_admin_insert ON storage.objects;
CREATE POLICY curriculum_books_admin_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'curriculum-books' AND public.is_admin());
DROP POLICY IF EXISTS curriculum_books_admin_update ON storage.objects;
CREATE POLICY curriculum_books_admin_update ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'curriculum-books' AND public.is_admin()) WITH CHECK (bucket_id = 'curriculum-books' AND public.is_admin());
DROP POLICY IF EXISTS curriculum_books_admin_delete ON storage.objects;
CREATE POLICY curriculum_books_admin_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'curriculum-books' AND public.is_admin());

CREATE OR REPLACE FUNCTION public.publish_curriculum_version(_version_id UUID)
RETURNS public.curriculum_versions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.curriculum_versions;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF EXISTS (SELECT 1 FROM public.curriculum_units u WHERE u.curriculum_version_id = _version_id AND u.needs_review) OR
     EXISTS (SELECT 1 FROM public.curriculum_lessons l WHERE l.curriculum_version_id = _version_id AND l.needs_review) THEN
    RAISE EXCEPTION 'curriculum_needs_review';
  END IF;
  UPDATE public.curriculum_versions SET is_published = false WHERE subject_id = (SELECT subject_id FROM public.curriculum_versions WHERE id = _version_id);
  UPDATE public.curriculum_versions SET is_published = true, processing_status = 'completed', processed_at = COALESCE(processed_at, now()) WHERE id = _version_id RETURNING * INTO r;
  IF NOT FOUND THEN RAISE EXCEPTION 'version_not_found'; END IF;
  RETURN r;
END; $$;
REVOKE ALL ON FUNCTION public.publish_curriculum_version(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_curriculum_version(UUID) TO authenticated;
