ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS academic_stage_id UUID
    REFERENCES public.academic_stages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS academic_track_id UUID
    REFERENCES public.academic_tracks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility_scope TEXT NOT NULL
    DEFAULT 'all'
    CHECK (visibility_scope IN ('all','stage','track'));

CREATE INDEX IF NOT EXISTS idx_subjects_visibility
  ON public.subjects(academic_stage_id, academic_track_id, visibility_scope);

DROP POLICY IF EXISTS "subjects readable" ON public.subjects;
DROP POLICY IF EXISTS "subjects read" ON public.subjects;

CREATE POLICY "subjects read"
ON public.subjects
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR (
    visibility_scope = 'all'
    OR (
      visibility_scope = 'stage'
      AND academic_stage_id = (
        SELECT academic_stage_id
        FROM public.profiles
        WHERE id = auth.uid()
      )
    )
    OR (
      visibility_scope = 'track'
      AND academic_track_id = (
        SELECT academic_track_id
        FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  )
);