ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS track TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price_egp NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  question_credits INTEGER NOT NULL DEFAULT 0,
  image_credits INTEGER NOT NULL DEFAULT 0,
  pdf_credits INTEGER NOT NULL DEFAULT 0,
  daily_question_limit INTEGER NOT NULL DEFAULT 500,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plans readable" ON public.subscription_plans;
CREATE POLICY "plans readable" ON public.subscription_plans FOR SELECT TO authenticated USING (is_active OR public.is_admin());
DROP POLICY IF EXISTS "admins manage plans" ON public.subscription_plans;
CREATE POLICY "admins manage plans" ON public.subscription_plans FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.subscription_plans (name_ar, name_en, price_egp, question_credits, image_credits, pdf_credits, sort_order)
SELECT * FROM (VALUES
  ('باقة البداية','Starter', 100.00, 300, 15, 30, 1),
  ('باقة الطالب','Student', 250.00, 1000, 45, 90, 2),
  ('باقة التفوق','Excellence', 450.00, 2500, 100, 200, 3)
) v WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans);

CREATE TABLE IF NOT EXISTS public.student_wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  question_credits INTEGER NOT NULL DEFAULT 0 CHECK (question_credits >= 0),
  image_credits INTEGER NOT NULL DEFAULT 0 CHECK (image_credits >= 0),
  pdf_credits INTEGER NOT NULL DEFAULT 0 CHECK (pdf_credits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.student_wallets TO authenticated;
GRANT ALL ON public.student_wallets TO service_role;
ALTER TABLE public.student_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read own wallet" ON public.student_wallets;
CREATE POLICY "read own wallet" ON public.student_wallets FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON public.student_wallets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('questions','images','pdfs')),
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  request_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallet_ledger TO authenticated;
GRANT ALL ON public.wallet_ledger TO service_role;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read own ledger" ON public.wallet_ledger;
CREATE POLICY "read own ledger" ON public.wallet_ledger FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
CREATE INDEX IF NOT EXISTS idx_ledger_user ON public.wallet_ledger (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ai_credit_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  request_id TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('questions','images','pdfs','documents')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','committed','released')),
  committed_amount INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  committed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ
);
GRANT SELECT ON public.ai_credit_reservations TO authenticated;
GRANT ALL ON public.ai_credit_reservations TO service_role;
ALTER TABLE public.ai_credit_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "credit_res_read_own" ON public.ai_credit_reservations;
CREATE POLICY "credit_res_read_own" ON public.ai_credit_reservations FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_res_request_unique
  ON public.ai_credit_reservations (request_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_credit_res_user_status ON public.ai_credit_reservations (user_id, status);

ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS questions_approved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS questions_rejected INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS retries INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS escalations INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS input_tokens INTEGER;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS output_tokens INTEGER;
CREATE INDEX IF NOT EXISTS idx_ai_usage_request ON public.ai_usage_logs (request_id);

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans ON DELETE SET NULL,
  method TEXT NOT NULL CHECK (method IN ('vodafone_cash','instapay')),
  amount_egp NUMERIC(10,2) NOT NULL CHECK (amount_egp >= 0),
  transaction_number TEXT,
  sender_number TEXT,
  screenshot_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected')),
  reject_reason TEXT,
  reviewed_by UUID REFERENCES auth.users ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payment_requests TO authenticated;
GRANT ALL ON public.payment_requests TO service_role;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read own payments" ON public.payment_requests;
CREATE POLICY "read own payments" ON public.payment_requests FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "create own payments" ON public.payment_requests;
CREATE POLICY "create own payments" ON public.payment_requests FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payment_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payment_requests (status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('payment_request','special_request','center_code')),
  reference_id UUID,
  amount_egp NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.revenue_entries TO authenticated;
GRANT ALL ON public.revenue_entries TO service_role;
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read revenue" ON public.revenue_entries;
CREATE POLICY "admins read revenue" ON public.revenue_entries FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.centers TO authenticated;
GRANT ALL ON public.centers TO service_role;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins manage centers" ON public.centers;
CREATE POLICY "admins manage centers" ON public.centers FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.center_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.centers ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans ON DELETE RESTRICT,
  code TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES auth.users ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.center_codes TO authenticated;
GRANT ALL ON public.center_codes TO service_role;
ALTER TABLE public.center_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read codes" ON public.center_codes;
CREATE POLICY "admins read codes" ON public.center_codes FOR SELECT TO authenticated
USING (public.is_admin() OR used_by = auth.uid());
DROP POLICY IF EXISTS "admins manage codes" ON public.center_codes;
CREATE POLICY "admins manage codes" ON public.center_codes FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_center_codes_center ON public.center_codes (center_id, used_at);

CREATE TABLE IF NOT EXISTS public.special_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed')),
  price_egp NUMERIC(10,2),
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.special_requests TO authenticated;
GRANT ALL ON public.special_requests TO service_role;
ALTER TABLE public.special_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read own special" ON public.special_requests;
CREATE POLICY "read own special" ON public.special_requests FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "create own special" ON public.special_requests;
CREATE POLICY "create own special" ON public.special_requests FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE TRIGGER trg_special_updated_at BEFORE UPDATE ON public.special_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects ON DELETE SET NULL,
  lesson_key TEXT,
  school_year TEXT,
  track TEXT,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  difficulty_score NUMERIC NOT NULL DEFAULT 50,
  question_type public.question_type NOT NULL DEFAULT 'mcq',
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT,
  explanation TEXT,
  common_trap TEXT,
  concepts TEXT[] NOT NULL DEFAULT '{}',
  source_label TEXT,
  source_page_from INTEGER,
  source_page_to INTEGER,
  quality_status public.validation_status NOT NULL DEFAULT 'approved',
  usage_count INTEGER NOT NULL DEFAULT 0,
  ai_tier TEXT,
  fingerprint TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar',
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_qbank_fingerprint ON public.question_bank (fingerprint);
CREATE INDEX IF NOT EXISTS idx_qbank_lookup ON public.question_bank (subject_id, lesson_key, difficulty, quality_status);
GRANT SELECT ON public.question_bank TO authenticated;
GRANT ALL ON public.question_bank TO service_role;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bank readable" ON public.question_bank;
CREATE POLICY "bank readable" ON public.question_bank FOR SELECT TO authenticated
USING (quality_status = 'approved' OR public.is_admin());

CREATE TABLE IF NOT EXISTS public.student_question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bank_question_id UUID REFERENCES public.question_bank ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, fingerprint)
);
GRANT SELECT, INSERT ON public.student_question_history TO authenticated;
GRANT ALL ON public.student_question_history TO service_role;
ALTER TABLE public.student_question_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own question history" ON public.student_question_history;
CREATE POLICY "own question history" ON public.student_question_history FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "insert own question history" ON public.student_question_history;
CREATE POLICY "insert own question history" ON public.student_question_history FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.ai_jobs (
  request_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects ON DELETE SET NULL,
  lesson_key TEXT,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  requested_count INTEGER NOT NULL DEFAULT 0,
  reused_count INTEGER NOT NULL DEFAULT 0,
  generated_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  remaining_count INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  replacement_count INTEGER NOT NULL DEFAULT 0,
  tier TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','partial','failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_jobs TO authenticated;
GRANT ALL ON public.ai_jobs TO service_role;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read own jobs" ON public.ai_jobs;
CREATE POLICY "read own jobs" ON public.ai_jobs FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON public.ai_jobs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.contest_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  enabled BOOLEAN NOT NULL DEFAULT false,
  verified_students_threshold INTEGER NOT NULL DEFAULT 30000,
  prize_egp NUMERIC(12,2) NOT NULL DEFAULT 100000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contest_settings TO authenticated;
GRANT ALL ON public.contest_settings TO service_role;
ALTER TABLE public.contest_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contest readable" ON public.contest_settings;
CREATE POLICY "contest readable" ON public.contest_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admins manage contest" ON public.contest_settings;
CREATE POLICY "admins manage contest" ON public.contest_settings FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
INSERT INTO public.contest_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.contest_entries TO authenticated;
GRANT ALL ON public.contest_entries TO service_role;
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own contest entry" ON public.contest_entries;
CREATE POLICY "own contest entry" ON public.contest_entries FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "create own contest entry" ON public.contest_entries;
CREATE POLICY "create own contest entry" ON public.contest_entries FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.my_wallet()
RETURNS public.student_wallets LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _row public.student_wallets;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.student_wallets (user_id) VALUES (_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO _row FROM public.student_wallets WHERE user_id = _uid;
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.my_wallet() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_wallet() TO authenticated;

CREATE OR REPLACE FUNCTION public.grant_wallet_credits(
  _target UUID, _questions INTEGER, _images INTEGER, _pdfs INTEGER, _reason TEXT, _meta JSONB DEFAULT '{}'::jsonb
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.student_wallets (user_id) VALUES (_target) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.student_wallets
     SET question_credits = question_credits + COALESCE(_questions,0),
         image_credits = image_credits + COALESCE(_images,0),
         pdf_credits = pdf_credits + COALESCE(_pdfs,0)
   WHERE user_id = _target;
  IF COALESCE(_questions,0) <> 0 THEN
    INSERT INTO public.wallet_ledger (user_id, resource_type, delta, reason, metadata)
    VALUES (_target, 'questions', _questions, _reason, _meta); END IF;
  IF COALESCE(_images,0) <> 0 THEN
    INSERT INTO public.wallet_ledger (user_id, resource_type, delta, reason, metadata)
    VALUES (_target, 'images', _images, _reason, _meta); END IF;
  IF COALESCE(_pdfs,0) <> 0 THEN
    INSERT INTO public.wallet_ledger (user_id, resource_type, delta, reason, metadata)
    VALUES (_target, 'pdfs', _pdfs, _reason, _meta); END IF;
END; $$;
REVOKE ALL ON FUNCTION public.grant_wallet_credits(UUID, INTEGER, INTEGER, INTEGER, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.reserve_ai_credits(
  _request_id TEXT, _resource_type TEXT, _amount INTEGER
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid(); _w public.student_wallets;
  _balance INTEGER; _held INTEGER; _res UUID; _col TEXT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid amount'; END IF;
  _col := CASE _resource_type
            WHEN 'questions' THEN 'questions'
            WHEN 'images' THEN 'images'
            WHEN 'pdfs' THEN 'pdfs'
            WHEN 'documents' THEN 'pdfs'
            ELSE NULL END;
  IF _col IS NULL THEN RAISE EXCEPTION 'invalid resource type'; END IF;

  INSERT INTO public.student_wallets (user_id) VALUES (_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO _w FROM public.student_wallets WHERE user_id = _uid FOR UPDATE;

  _balance := CASE _col WHEN 'questions' THEN _w.question_credits
                        WHEN 'images' THEN _w.image_credits
                        ELSE _w.pdf_credits END;

  SELECT COALESCE(sum(amount),0) INTO _held FROM public.ai_credit_reservations
   WHERE user_id = _uid AND status = 'reserved'
     AND (CASE resource_type WHEN 'documents' THEN 'pdfs' ELSE resource_type END) = _col;

  IF public.has_role(_uid, 'admin') THEN
    _balance := GREATEST(_balance, _held + _amount);
  END IF;

  IF _held + _amount > _balance THEN
    RAISE EXCEPTION 'quota_exceeded: balance=%, held=%, requested=%', _balance, _held, _amount;
  END IF;

  INSERT INTO public.ai_credit_reservations (user_id, request_id, resource_type, amount)
  VALUES (_uid, _request_id, _resource_type, _amount)
  ON CONFLICT (request_id, resource_type) DO NOTHING
  RETURNING id INTO _res;

  IF _res IS NULL THEN RAISE EXCEPTION 'duplicate_request'; END IF;
  RETURN _res;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_ai_credits(TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_ai_credits(TEXT, TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.commit_ai_credits(
  _reservation_id UUID, _actual_amount INTEGER DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _r public.ai_credit_reservations; _use INTEGER; _col TEXT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _r FROM public.ai_credit_reservations
   WHERE id = _reservation_id AND user_id = _uid AND status = 'reserved' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'reservation not found or not reservable'; END IF;

  _use := LEAST(GREATEST(COALESCE(_actual_amount, _r.amount), 0), _r.amount);
  _col := CASE _r.resource_type WHEN 'documents' THEN 'pdfs' ELSE _r.resource_type END;

  IF _use > 0 AND NOT public.has_role(_uid, 'admin') THEN
    UPDATE public.student_wallets SET
      question_credits = GREATEST(question_credits - CASE WHEN _col = 'questions' THEN _use ELSE 0 END, 0),
      image_credits    = GREATEST(image_credits    - CASE WHEN _col = 'images'    THEN _use ELSE 0 END, 0),
      pdf_credits      = GREATEST(pdf_credits      - CASE WHEN _col = 'pdfs'      THEN _use ELSE 0 END, 0)
    WHERE user_id = _uid;
    INSERT INTO public.wallet_ledger (user_id, resource_type, delta, reason, request_id)
    VALUES (_uid, _col, -_use, 'ai_usage', _r.request_id);
  END IF;

  UPDATE public.ai_credit_reservations
     SET status = 'committed', committed_amount = _use, committed_at = now(), updated_at = now()
   WHERE id = _reservation_id;
END; $$;
REVOKE ALL ON FUNCTION public.commit_ai_credits(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commit_ai_credits(UUID, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.release_ai_credits(_reservation_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.ai_credit_reservations
     SET status = 'released', released_at = now(), updated_at = now()
   WHERE id = _reservation_id AND user_id = _uid AND status = 'reserved';
END; $$;
REVOKE ALL ON FUNCTION public.release_ai_credits(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.release_ai_credits(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_review_payment_request(
  _request UUID, _approve BOOLEAN, _reason TEXT DEFAULT NULL
) RETURNS public.payment_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.payment_requests; _plan public.subscription_plans;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO _row FROM public.payment_requests WHERE id = _request AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not found or already reviewed'; END IF;

  IF _approve THEN
    SELECT * INTO _plan FROM public.subscription_plans WHERE id = _row.plan_id;
    PERFORM public.grant_wallet_credits(_row.user_id,
      COALESCE(_plan.question_credits,0), COALESCE(_plan.image_credits,0), COALESCE(_plan.pdf_credits,0),
      'payment_confirmed', jsonb_build_object('payment_request', _request));
    INSERT INTO public.revenue_entries (user_id, source, reference_id, amount_egp)
    VALUES (_row.user_id, 'payment_request', _request, _row.amount_egp);
    UPDATE public.payment_requests SET status = 'confirmed', reviewed_by = auth.uid(), reviewed_at = now()
     WHERE id = _request RETURNING * INTO _row;
    INSERT INTO public.notifications (user_id, title, body, kind)
    VALUES (_row.user_id, 'تم تأكيد الدفع', 'تم شحن محفظتك بنجاح.', 'payment');
  ELSE
    UPDATE public.payment_requests SET status = 'rejected', reject_reason = _reason,
      reviewed_by = auth.uid(), reviewed_at = now()
     WHERE id = _request RETURNING * INTO _row;
    INSERT INTO public.notifications (user_id, title, body, kind)
    VALUES (_row.user_id, 'تم رفض طلب الدفع', COALESCE(_reason,'برجاء مراجعة بيانات التحويل.'), 'payment');
  END IF;

  PERFORM public.admin_log(_row.user_id, 'review_payment_request',
    jsonb_build_object('request', _request, 'approved', _approve, 'reason', _reason));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_review_payment_request(UUID, BOOLEAN, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_payment_request(UUID, BOOLEAN, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_center_code(_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _c public.center_codes; _plan public.subscription_plans;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _c FROM public.center_codes WHERE code = upper(trim(_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_code'; END IF;
  IF _c.used_by IS NOT NULL THEN RAISE EXCEPTION 'code_already_used'; END IF;

  SELECT * INTO _plan FROM public.subscription_plans WHERE id = _c.plan_id;
  UPDATE public.center_codes SET used_by = _uid, used_at = now() WHERE id = _c.id;
  PERFORM public.grant_wallet_credits(_uid,
    COALESCE(_plan.question_credits,0), COALESCE(_plan.image_credits,0), COALESCE(_plan.pdf_credits,0),
    'center_code', jsonb_build_object('code_id', _c.id, 'center_id', _c.center_id));
  INSERT INTO public.revenue_entries (user_id, source, reference_id, amount_egp)
  VALUES (_uid, 'center_code', _c.id, COALESCE(_plan.price_egp, 0));

  RETURN jsonb_build_object('ok', true, 'question_credits', COALESCE(_plan.question_credits,0),
    'image_credits', COALESCE(_plan.image_credits,0), 'pdf_credits', COALESCE(_plan.pdf_credits,0));
END; $$;
REVOKE ALL ON FUNCTION public.redeem_center_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_center_code(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_generate_center_codes(
  _center UUID, _plan UUID, _count INTEGER
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i INTEGER; _made INTEGER := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _count IS NULL OR _count <= 0 OR _count > 5000 THEN RAISE EXCEPTION 'invalid count'; END IF;
  FOR i IN 1.._count LOOP
    BEGIN
      INSERT INTO public.center_codes (center_id, plan_id, code)
      VALUES (_center, _plan, 'WISO-' || upper(substr(encode(gen_random_bytes(6),'hex'), 1, 10)));
      _made := _made + 1;
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
  END LOOP;
  PERFORM public.admin_log(NULL, 'generate_center_codes',
    jsonb_build_object('center', _center, 'plan', _plan, 'count', _made));
  RETURN _made;
END; $$;
REVOKE ALL ON FUNCTION public.admin_generate_center_codes(UUID, UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_generate_center_codes(UUID, UUID, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_revenue_summary()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN jsonb_build_object(
    'total_revenue', (SELECT COALESCE(sum(amount_egp),0) FROM public.revenue_entries),
    'pending_revenue', (SELECT COALESCE(sum(amount_egp),0) FROM public.payment_requests WHERE status = 'pending'),
    'by_source', (SELECT COALESCE(jsonb_object_agg(source, total), '{}'::jsonb)
                  FROM (SELECT source, sum(amount_egp) AS total FROM public.revenue_entries GROUP BY source) s),
    'codes_used', (SELECT count(*) FROM public.center_codes WHERE used_by IS NOT NULL),
    'codes_total', (SELECT count(*) FROM public.center_codes)
  );
END; $$;
REVOKE ALL ON FUNCTION public.admin_revenue_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_revenue_summary() TO authenticated;