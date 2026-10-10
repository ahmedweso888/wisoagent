-- ============ plan / subscription extensions ============
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS original_price_egp NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS monthly_question_limit INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge TEXT,
  ADD COLUMN IF NOT EXISTS promo_text TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS competition_eligible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.subscription_plans(id);

-- ============ generic admin content tables ============
CREATE TABLE IF NOT EXISTS public.site_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  cta_label TEXT,
  cta_href TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_sections TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_sections TO authenticated;
GRANT ALL ON public.site_sections TO service_role;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sections public read" ON public.site_sections FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "sections admin write" ON public.site_sections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.site_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  specialization TEXT,
  description TEXT,
  verification_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_teachers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_teachers TO authenticated;
GRANT ALL ON public.site_teachers TO service_role;
ALTER TABLE public.site_teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers public read" ON public.site_teachers FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "teachers admin write" ON public.site_teachers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.site_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_faq TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_faq TO authenticated;
GRANT ALL ON public.site_faq TO service_role;
ALTER TABLE public.site_faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faq public read" ON public.site_faq FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "faq admin write" ON public.site_faq FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.site_footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_title TEXT NOT NULL,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  group_order INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_footer_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_footer_links TO authenticated;
GRANT ALL ON public.site_footer_links TO service_role;
ALTER TABLE public.site_footer_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "footer public read" ON public.site_footer_links FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "footer admin write" ON public.site_footer_links FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.site_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_social_links TO authenticated;
GRANT ALL ON public.site_social_links TO service_role;
ALTER TABLE public.site_social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social public read" ON public.site_social_links FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "social admin write" ON public.site_social_links FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  audience TEXT NOT NULL DEFAULT 'students',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements read" ON public.announcements FOR SELECT TO authenticated
  USING (public.is_admin() OR (is_active
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())));
CREATE POLICY "announcements admin write" ON public.announcements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  account_identifier TEXT,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment methods read" ON public.payment_methods FOR SELECT TO authenticated USING (is_active OR public.is_admin());
CREATE POLICY "payment methods admin write" ON public.payment_methods FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
INSERT INTO public.payment_methods (method_key, display_name, sort_order)
VALUES ('vodafone_cash', 'فودافون كاش', 1), ('instapay', 'إنستاباي', 2)
ON CONFLICT (method_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.academic_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academic_stages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_stages TO authenticated;
GRANT ALL ON public.academic_stages TO service_role;
ALTER TABLE public.academic_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stages public read" ON public.academic_stages FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "stages admin write" ON public.academic_stages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.academic_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.academic_stages(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (stage_id, slug)
);
GRANT SELECT ON public.academic_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_tracks TO authenticated;
GRANT ALL ON public.academic_tracks TO service_role;
ALTER TABLE public.academic_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tracks public read" ON public.academic_tracks FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "tracks admin write" ON public.academic_tracks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.feature_flags (
  flag_key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags public read" ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "flags admin write" ON public.feature_flags FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
INSERT INTO public.feature_flags (flag_key, label) VALUES
  ('ai_question_generation','توليد الأسئلة بالذكاء الاصطناعي'),
  ('competition','المسابقة'),
  ('verified_teachers','المدرسون الموثوقون'),
  ('special_requests','الطلبات الخاصة'),
  ('pdf_features','ملفات PDF'),
  ('image_features','تحليل الصور'),
  ('public_registration','التسجيل العام'),
  ('announcements','الإعلانات'),
  ('payments','المدفوعات')
ON CONFLICT (flag_key) DO NOTHING;

-- ============ competition configuration ============
ALTER TABLE public.contest_settings
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EGP',
  ADD COLUMN IF NOT EXISTS activation_mode TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS activation_target INTEGER NOT NULL DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS min_eligible_plan_id UUID REFERENCES public.subscription_plans(id),
  ADD COLUMN IF NOT EXISTS rules TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS promo_text TEXT,
  ADD COLUMN IF NOT EXISTS visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

ALTER TABLE public.contest_settings
  DROP CONSTRAINT IF EXISTS contest_settings_activation_mode_check;
ALTER TABLE public.contest_settings
  ADD CONSTRAINT contest_settings_activation_mode_check CHECK (activation_mode IN ('manual','auto'));

-- how many students currently hold an eligible active subscription
CREATE OR REPLACE FUNCTION public.eligible_subscriber_count()
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(DISTINCT s.user_id)::INTEGER
    FROM public.subscriptions s
    JOIN public.subscription_plans p ON p.id = s.plan_id
   WHERE s.status = 'active'
     AND (s.expires_at IS NULL OR s.expires_at > now())
     AND p.competition_eligible;
$$;
REVOKE ALL ON FUNCTION public.eligible_subscriber_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eligible_subscriber_count() TO authenticated;

-- server-side competition state; auto-activates and auto-ends
CREATE OR REPLACE FUNCTION public.contest_state()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c public.contest_settings; _count INTEGER; _uid UUID := auth.uid(); _registered BOOLEAN := false; _eligible BOOLEAN := false;
BEGIN
  SELECT * INTO _c FROM public.contest_settings WHERE id = true FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('enabled', false); END IF;

  SELECT public.eligible_subscriber_count() INTO _count;

  IF _c.enabled AND _c.status = 'draft' AND _c.activation_mode = 'auto'
     AND _count >= _c.activation_target THEN
    UPDATE public.contest_settings
       SET status = 'active', activated_at = now(),
           ends_at = now() + make_interval(days => GREATEST(_c.duration_days, 1)), updated_at = now()
     WHERE id = true RETURNING * INTO _c;
  END IF;

  IF _c.status = 'active' AND _c.ends_at IS NOT NULL AND _c.ends_at <= now() THEN
    UPDATE public.contest_settings SET status = 'ended', updated_at = now()
     WHERE id = true RETURNING * INTO _c;
  END IF;

  IF _uid IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM public.contest_entries WHERE user_id = _uid) INTO _registered;
    SELECT EXISTS (
      SELECT 1 FROM public.subscriptions s
      JOIN public.subscription_plans p ON p.id = s.plan_id
      WHERE s.user_id = _uid AND s.status = 'active'
        AND (s.expires_at IS NULL OR s.expires_at > now())
        AND p.competition_eligible
    ) INTO _eligible;
  END IF;

  RETURN jsonb_build_object(
    'enabled', _c.enabled, 'visible', _c.visible, 'status', _c.status,
    'prize', _c.prize_egp, 'currency', _c.currency,
    'activation_mode', _c.activation_mode, 'activation_target', _c.activation_target,
    'eligible_subscribers', _count,
    'activated_at', _c.activated_at, 'ends_at', _c.ends_at, 'duration_days', _c.duration_days,
    'rules', _c.rules, 'description', _c.description, 'promo_text', _c.promo_text,
    'min_eligible_plan_id', _c.min_eligible_plan_id,
    'student_eligible', _eligible, 'student_registered', _registered,
    'can_register', (_c.enabled AND _c.status = 'active' AND _eligible AND NOT _registered)
  );
END; $$;
REVOKE ALL ON FUNCTION public.contest_state() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contest_state() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.register_for_contest(_phone TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _state JSONB;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  _state := public.contest_state();
  IF NOT COALESCE((_state->>'enabled')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'disabled'); END IF;
  IF _state->>'status' <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'reason', _state->>'status'); END IF;
  IF NOT COALESCE((_state->>'student_eligible')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_eligible'); END IF;
  IF COALESCE((_state->>'student_registered')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_registered'); END IF;
  IF _phone IS NULL OR regexp_replace(_phone,'[^0-9]','','g') !~ '^01[0-9]{9}$' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_phone'); END IF;

  INSERT INTO public.contest_entries (user_id, phone)
  VALUES (_uid, regexp_replace(_phone,'[^0-9]','','g'))
  ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('ok', true);
END; $$;
REVOKE ALL ON FUNCTION public.register_for_contest(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_for_contest(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_contest_status(_status TEXT)
RETURNS public.contest_settings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.contest_settings;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status NOT IN ('draft','active','ended') THEN RAISE EXCEPTION 'invalid status'; END IF;
  SELECT * INTO _row FROM public.contest_settings WHERE id = true FOR UPDATE;
  IF _status = 'active' THEN
    UPDATE public.contest_settings
       SET status = 'active', activated_at = COALESCE(activated_at, now()),
           ends_at = COALESCE(activated_at, now()) + make_interval(days => GREATEST(duration_days,1)),
           updated_at = now()
     WHERE id = true RETURNING * INTO _row;
  ELSIF _status = 'draft' THEN
    UPDATE public.contest_settings SET status='draft', activated_at=NULL, ends_at=NULL, updated_at=now()
     WHERE id = true RETURNING * INTO _row;
  ELSE
    UPDATE public.contest_settings SET status='ended', ends_at=COALESCE(ends_at, now()), updated_at=now()
     WHERE id = true RETURNING * INTO _row;
  END IF;
  PERFORM public.admin_log(NULL, 'set_contest_status', jsonb_build_object('status', _status));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_set_contest_status(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_contest_status(TEXT) TO authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS contest_entries_user_key ON public.contest_entries (user_id);