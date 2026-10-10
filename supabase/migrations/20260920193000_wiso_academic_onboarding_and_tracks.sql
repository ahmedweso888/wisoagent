-- WISO academic identity: database is the source of truth.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS academic_stage_id UUID REFERENCES public.academic_stages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS academic_track_id UUID REFERENCES public.academic_tracks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_academic_stage ON public.profiles(academic_stage_id);
CREATE INDEX IF NOT EXISTS idx_profiles_academic_track ON public.profiles(academic_track_id);

INSERT INTO public.academic_stages (name_ar, slug, sort_order)
VALUES
  ('البكالوريا', 'baccalaureate', 30),
  ('الثانوية العامة - الصف الثالث', 'third-secondary', 40)
ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, sort_order = EXCLUDED.sort_order;

WITH stages AS (
  SELECT id, slug FROM public.academic_stages WHERE slug IN ('baccalaureate','third-secondary')
)
INSERT INTO public.academic_tracks (stage_id, name_ar, slug, sort_order)
SELECT s.id, v.name_ar, v.slug, v.sort_order
FROM stages s
JOIN (VALUES
  ('baccalaureate','طب وعلوم الحياه (رياضيات)','medicine-life-math',1),
  ('baccalaureate','طب وعلوم الحياه (فيزياء)','medicine-life-physics',2),
  ('baccalaureate','هندسه وعلوم الحاسب (برمجه)','engineering-cs-programming',3),
  ('baccalaureate','هندسه وعلوم الحاسب (كيمياء)','engineering-cs-chemistry',4),
  ('baccalaureate','الاعمال (محاسبه)','business-accounting',5),
  ('baccalaureate','الاعمال (اداره اعمال)','business-management',6),
  ('baccalaureate','الاداب والفنون (علم النفس)','arts-psychology',7),
  ('baccalaureate','الاداب والفنون (لغه اجنبيه ثانيه)','arts-second-language',8),
  ('third-secondary','علمي علوم','science',1),
  ('third-secondary','علمي رياضه','math',2),
  ('third-secondary','الادبي','literary',3)
) AS v(stage_slug,name_ar,slug,sort_order) ON v.stage_slug = s.slug
ON CONFLICT (stage_id, slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, sort_order = EXCLUDED.sort_order;

CREATE OR REPLACE FUNCTION public.complete_academic_onboarding(
  _stage_id UUID,
  _track_id UUID DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _profile public.profiles;
  _stage_slug TEXT;
  _track_stage UUID;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT slug INTO _stage_slug FROM public.academic_stages WHERE id = _stage_id AND is_active;
  IF _stage_slug IS NULL THEN RAISE EXCEPTION 'invalid_academic_stage'; END IF;

  IF _track_id IS NOT NULL THEN
    SELECT stage_id INTO _track_stage
    FROM public.academic_tracks
    WHERE id = _track_id AND is_active;
    IF _track_stage IS DISTINCT FROM _stage_id THEN RAISE EXCEPTION 'invalid_academic_track'; END IF;
  END IF;

  IF _stage_slug = 'baccalaureate' AND _track_id IS NULL THEN
    RAISE EXCEPTION 'track_required';
  END IF;

  UPDATE public.profiles
  SET academic_stage_id = _stage_id,
      academic_track_id = _track_id,
      school_year = (SELECT name_ar FROM public.academic_stages WHERE id = _stage_id),
      track = (SELECT name_ar FROM public.academic_tracks WHERE id = _track_id),
      onboarded_at = now(),
      updated_at = now()
  WHERE id = _uid
  RETURNING * INTO _profile;

  IF NOT FOUND THEN RAISE EXCEPTION 'profile_not_found'; END IF;
  RETURN _profile;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_academic_onboarding(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_academic_onboarding(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.complete_academic_onboarding(UUID, UUID) IS
  'Validates and stores the authenticated student academic identity using database-managed stages/tracks.';
