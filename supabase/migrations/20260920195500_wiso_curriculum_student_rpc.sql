CREATE OR REPLACE FUNCTION public.student_available_subjects()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(to_jsonb(x) ORDER BY x.sort_order),
    '[]'::jsonb
  )
  FROM (
    SELECT
      s.id,
      s.slug,
      s.name_ar,
      s.sort_order
    FROM public.subjects s
    JOIN public.profiles p
      ON p.id = auth.uid()
    WHERE
      s.visibility_scope = 'all'
      OR (
        s.visibility_scope = 'stage'
        AND s.academic_stage_id = p.academic_stage_id
      )
      OR (
        s.visibility_scope = 'track'
        AND s.academic_track_id = p.academic_track_id
      )
  ) x;
$$;

REVOKE ALL ON FUNCTION public.student_available_subjects() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_available_subjects() TO authenticated;


CREATE OR REPLACE FUNCTION public.student_available_lessons(_subject_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(to_jsonb(x) ORDER BY x.sort_order),
    '[]'::jsonb
  )
  FROM (
    SELECT
      l.id,
      l.title,
      l.sort_order,
      u.id AS unit_id,
      u.title AS unit_title,
      l.page_start,
      l.page_end
    FROM public.curriculum_lessons l
    JOIN public.curriculum_versions v
      ON v.id = l.curriculum_version_id
      AND v.is_published
    JOIN public.subjects s
      ON s.id = v.subject_id
      AND s.id = _subject_id
    LEFT JOIN public.curriculum_units u
      ON u.id = l.unit_id
    JOIN public.profiles p
      ON p.id = auth.uid()
    WHERE
      l.archived_at IS NULL
      AND (
        s.visibility_scope = 'all'
        OR (
          s.visibility_scope = 'stage'
          AND s.academic_stage_id = p.academic_stage_id
        )
        OR (
          s.visibility_scope = 'track'
          AND s.academic_track_id = p.academic_track_id
        )
      )
  ) x;
$$;

REVOKE ALL ON FUNCTION public.student_available_lessons(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_available_lessons(UUID) TO authenticated;


CREATE OR REPLACE FUNCTION public.generation_curriculum_context(
  _user_id UUID,
  _subject_slug TEXT,
  _lesson_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT jsonb_build_object(
    'subject',
    jsonb_build_object(
      'id', s.id,
      'slug', s.slug,
      'name_ar', s.name_ar
    ),
    'lessons',
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', l.id,
            'title', l.title,
            'unit', u.title,
            'page_start', l.page_start,
            'page_end', l.page_end,
            'concepts',
            COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'title', c.title,
                    'description', c.description,
                    'source_page', c.source_page
                  )
                )
                FROM public.curriculum_concepts c
                WHERE c.lesson_id = l.id
              ),
              '[]'::jsonb
            ),
            'pages',
            COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'page_number', cp.page_number,
                    'text', cp.extracted_text
                  )
                  ORDER BY cp.page_number
                )
                FROM public.curriculum_pages cp
                WHERE cp.curriculum_version_id = l.curriculum_version_id
                  AND (
                    l.page_start IS NULL
                    OR cp.page_number >= l.page_start
                  )
                  AND (
                    l.page_end IS NULL
                    OR cp.page_number <= l.page_end
                  )
              ),
              '[]'::jsonb
            )
          )
          ORDER BY l.sort_order
        )
        FROM public.curriculum_lessons l
        JOIN public.curriculum_versions v
          ON v.id = l.curriculum_version_id
          AND v.is_published
        LEFT JOIN public.curriculum_units u
          ON u.id = l.unit_id
        WHERE
          l.id = ANY(_lesson_ids)
          AND l.archived_at IS NULL
      ),
      '[]'::jsonb
    )
  )
  INTO result
  FROM public.subjects s
  JOIN public.profiles p
    ON p.id = _user_id
  WHERE
    s.slug = _subject_slug
    AND (
      s.visibility_scope = 'all'
      OR (
        s.visibility_scope = 'stage'
        AND s.academic_stage_id = p.academic_stage_id
      )
      OR (
        s.visibility_scope = 'track'
        AND s.academic_track_id = p.academic_track_id
      )
    );

  IF result IS NULL THEN
    RAISE EXCEPTION 'curriculum_context_not_found';
  END IF;

  RETURN result;
END;
$$;

REVOKE ALL
ON FUNCTION public.generation_curriculum_context(UUID, TEXT, UUID[])
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.generation_curriculum_context(UUID, TEXT, UUID[])
TO authenticated;