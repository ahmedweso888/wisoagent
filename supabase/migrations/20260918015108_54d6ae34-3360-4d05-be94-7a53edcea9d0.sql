-- ============ profiles: identity + entitlement ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS national_id TEXT,
  ADD COLUMN IF NOT EXISTS national_id_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS national_id_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS national_id_verification_method TEXT,
  ADD COLUMN IF NOT EXISTS extreme_difficulty_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_national_id_key
  ON public.profiles (national_id) WHERE national_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  NEW.user_code := OLD.user_code;
  NEW.trial_started_at := OLD.trial_started_at;
  NEW.trial_expires_at := OLD.trial_expires_at;
  NEW.subscription_status := OLD.subscription_status;
  NEW.subscription_expires_at := OLD.subscription_expires_at;
  NEW.platform_access_status := OLD.platform_access_status;
  NEW.access_override := OLD.access_override;
  NEW.access_granted_at := OLD.access_granted_at;
  NEW.access_expires_at := OLD.access_expires_at;
  NEW.permanent_access := OLD.permanent_access;
  NEW.suspended_at := OLD.suspended_at;
  NEW.suspended_reason := OLD.suspended_reason;
  NEW.created_at := OLD.created_at;
  -- identity + entitlement are server-controlled only
  NEW.national_id := OLD.national_id;
  NEW.national_id_verified := OLD.national_id_verified;
  NEW.national_id_verified_at := OLD.national_id_verified_at;
  NEW.national_id_verification_method := OLD.national_id_verification_method;
  NEW.extreme_difficulty_enabled := OLD.extreme_difficulty_enabled;
  RETURN NEW;
END; $$;

-- ============ welcome bonus configuration ============
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS welcome_bonus_questions INTEGER NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS welcome_bonus_hours INTEGER NOT NULL DEFAULT 24;

ALTER TABLE public.student_wallets
  ADD COLUMN IF NOT EXISTS bonus_question_credits INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS welcome_bonus_granted_at TIMESTAMPTZ;

-- valid (unexpired) bonus questions for a wallet row
CREATE OR REPLACE FUNCTION public.valid_bonus_questions(_uid UUID)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT CASE
      WHEN bonus_expires_at IS NULL OR bonus_expires_at <= now() THEN 0
      ELSE GREATEST(bonus_question_credits, 0) END
    FROM public.student_wallets WHERE user_id = _uid), 0);
$$;
REVOKE ALL ON FUNCTION public.valid_bonus_questions(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.valid_bonus_questions(UUID) TO authenticated;

-- one-time welcome bonus, idempotent and race-safe
CREATE OR REPLACE FUNCTION public.grant_welcome_bonus(_target UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _w public.student_wallets; _qty INTEGER; _hours INTEGER;
BEGIN
  SELECT welcome_bonus_questions, welcome_bonus_hours INTO _qty, _hours
    FROM public.platform_settings WHERE id = true;
  _qty := COALESCE(_qty, 40); _hours := COALESCE(_hours, 24);
  IF _qty <= 0 THEN RETURN; END IF;

  INSERT INTO public.student_wallets (user_id) VALUES (_target) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO _w FROM public.student_wallets WHERE user_id = _target FOR UPDATE;
  IF _w.welcome_bonus_granted_at IS NOT NULL THEN RETURN; END IF;

  UPDATE public.student_wallets
     SET bonus_question_credits = _qty,
         bonus_expires_at = now() + make_interval(hours => _hours),
         welcome_bonus_granted_at = now(),
         updated_at = now()
   WHERE user_id = _target;

  INSERT INTO public.wallet_ledger (user_id, resource_type, delta, reason, metadata)
  VALUES (_target, 'questions', _qty, 'welcome_bonus',
          jsonb_build_object('expires_in_hours', _hours, 'kind', 'bonus'));
END; $$;
REVOKE ALL ON FUNCTION public.grant_welcome_bonus(UUID) FROM PUBLIC, anon, authenticated;

-- ensure_profile now grants the bonus exactly once at account creation
CREATE OR REPLACE FUNCTION public.ensure_profile(_full_name TEXT DEFAULT NULL)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _email TEXT; _row public.profiles;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _row FROM public.profiles WHERE id = _uid;
  IF FOUND THEN
    UPDATE public.profiles SET last_active_at = now(), full_name = COALESCE(NULLIF(_full_name,''), full_name)
    WHERE id = _uid RETURNING * INTO _row;
    INSERT INTO public.user_roles(user_id, role) VALUES (_uid, 'student') ON CONFLICT DO NOTHING;
    DELETE FROM public.user_roles WHERE user_id = _uid AND role = 'user';
    PERFORM public.grant_welcome_bonus(_uid);
    RETURN _row;
  END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  INSERT INTO public.profiles (id, email, full_name) VALUES (_uid, _email, NULLIF(_full_name,'')) RETURNING * INTO _row;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'student') ON CONFLICT DO NOTHING;
  PERFORM public.grant_welcome_bonus(_uid);
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.ensure_profile(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_profile(TEXT) TO authenticated;

-- ============ reservation / commit honour the expiring bonus ============
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

  _balance := CASE _col
    WHEN 'questions' THEN _w.question_credits
      + CASE WHEN _w.bonus_expires_at IS NOT NULL AND _w.bonus_expires_at > now()
             THEN GREATEST(_w.bonus_question_credits, 0) ELSE 0 END
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

-- Policy: bonus credits are spent first and only while still valid at commit time.
-- Anything the (now expired) bonus can no longer cover falls back to permanent
-- credits; nothing is ever charged below zero and expired bonus never persists.
CREATE OR REPLACE FUNCTION public.commit_ai_credits(
  _reservation_id UUID, _actual_amount INTEGER DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid(); _r public.ai_credit_reservations; _use INTEGER; _col TEXT;
  _w public.student_wallets; _from_bonus INTEGER := 0; _from_perm INTEGER := 0;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _r FROM public.ai_credit_reservations
   WHERE id = _reservation_id AND user_id = _uid AND status = 'reserved' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'reservation not found or not reservable'; END IF;

  _use := LEAST(GREATEST(COALESCE(_actual_amount, _r.amount), 0), _r.amount);
  _col := CASE _r.resource_type WHEN 'documents' THEN 'pdfs' ELSE _r.resource_type END;

  IF _use > 0 AND NOT public.has_role(_uid, 'admin') THEN
    SELECT * INTO _w FROM public.student_wallets WHERE user_id = _uid FOR UPDATE;

    IF _col = 'questions' THEN
      IF _w.bonus_expires_at IS NOT NULL AND _w.bonus_expires_at > now() THEN
        _from_bonus := LEAST(_use, GREATEST(_w.bonus_question_credits, 0));
      END IF;
      _from_perm := LEAST(_use - _from_bonus, GREATEST(_w.question_credits, 0));
      UPDATE public.student_wallets
         SET bonus_question_credits = GREATEST(bonus_question_credits - _from_bonus, 0),
             question_credits = GREATEST(question_credits - _from_perm, 0),
             updated_at = now()
       WHERE user_id = _uid;
      IF _from_bonus > 0 THEN
        INSERT INTO public.wallet_ledger (user_id, resource_type, delta, reason, request_id, metadata)
        VALUES (_uid, 'questions', -_from_bonus, 'ai_usage', _r.request_id, jsonb_build_object('kind','bonus'));
      END IF;
      IF _from_perm > 0 THEN
        INSERT INTO public.wallet_ledger (user_id, resource_type, delta, reason, request_id)
        VALUES (_uid, 'questions', -_from_perm, 'ai_usage', _r.request_id);
      END IF;
    ELSE
      UPDATE public.student_wallets SET
        image_credits = GREATEST(image_credits - CASE WHEN _col = 'images' THEN _use ELSE 0 END, 0),
        pdf_credits   = GREATEST(pdf_credits   - CASE WHEN _col = 'pdfs'   THEN _use ELSE 0 END, 0),
        updated_at = now()
      WHERE user_id = _uid;
      INSERT INTO public.wallet_ledger (user_id, resource_type, delta, reason, request_id)
      VALUES (_uid, _col, -_use, 'ai_usage', _r.request_id);
    END IF;
  END IF;

  UPDATE public.ai_credit_reservations
     SET status = 'committed', committed_amount = _use, committed_at = now(), updated_at = now()
   WHERE id = _reservation_id;
END; $$;
REVOKE ALL ON FUNCTION public.commit_ai_credits(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commit_ai_credits(UUID, INTEGER) TO authenticated;

-- wallet snapshot including the effective (bonus-aware) question balance
CREATE OR REPLACE FUNCTION public.my_wallet_state()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _w public.student_wallets; _p public.profiles; _bonus INTEGER;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _w FROM public.student_wallets WHERE user_id = _uid;
  SELECT * INTO _p FROM public.profiles WHERE id = _uid;
  _bonus := CASE WHEN _w.bonus_expires_at IS NOT NULL AND _w.bonus_expires_at > now()
                 THEN GREATEST(COALESCE(_w.bonus_question_credits,0),0) ELSE 0 END;
  RETURN jsonb_build_object(
    'question_credits', COALESCE(_w.question_credits, 0),
    'bonus_question_credits', _bonus,
    'questions_available', COALESCE(_w.question_credits, 0) + _bonus,
    'bonus_expires_at', CASE WHEN _bonus > 0 THEN _w.bonus_expires_at ELSE NULL END,
    'image_credits', COALESCE(_w.image_credits, 0),
    'pdf_credits', COALESCE(_w.pdf_credits, 0),
    'extreme_difficulty_enabled', COALESCE(_p.extreme_difficulty_enabled, false),
    'national_id_verified', COALESCE(_p.national_id_verified, false),
    'user_code', _p.user_code
  );
END; $$;
REVOKE ALL ON FUNCTION public.my_wallet_state() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_wallet_state() TO authenticated;

-- ============ Egyptian national ID validation ============
CREATE OR REPLACE FUNCTION public.validate_egyptian_national_id(_nid TEXT)
RETURNS JSONB LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE
  _w INTEGER[] := ARRAY[2,7,6,5,4,3,2,7,6,5,4,3];
  _sum INTEGER := 0; _i INTEGER; _check INTEGER; _prefix INTEGER;
  _c INTEGER; _yy INTEGER; _mm INTEGER; _dd INTEGER; _gov TEXT; _year INTEGER;
BEGIN
  IF _nid IS NULL OR _nid !~ '^[0-9]{14}$' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'format');
  END IF;
  _prefix := substr(_nid,1,3)::INTEGER;
  IF _prefix < 210 OR _prefix > 311 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'age_range');
  END IF;
  _c := substr(_nid,1,1)::INTEGER;
  _yy := substr(_nid,2,2)::INTEGER;
  _mm := substr(_nid,4,2)::INTEGER;
  _dd := substr(_nid,6,2)::INTEGER;
  _gov := substr(_nid,8,2);
  _year := CASE WHEN _c = 2 THEN 1900 + _yy ELSE 2000 + _yy END;
  IF _mm < 1 OR _mm > 12 OR _dd < 1 OR _dd > 31 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'birth_date');
  END IF;
  BEGIN
    PERFORM make_date(_year, _mm, _dd);
  EXCEPTION WHEN others THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'birth_date');
  END;
  IF make_date(_year, _mm, _dd) > current_date THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'birth_date');
  END IF;
  IF _gov NOT IN ('01','02','03','04','11','12','13','14','15','16','17','18','19',
                  '21','22','23','24','25','26','27','28','29',
                  '31','32','33','34','35','88') THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'governorate');
  END IF;
  FOR _i IN 1..12 LOOP
    _sum := _sum + substr(_nid,_i,1)::INTEGER * _w[_i];
  END LOOP;
  _sum := _sum + substr(_nid,13,1)::INTEGER * 2;
  _check := (11 - (_sum % 11)) % 11;
  IF _check > 9 OR _check <> substr(_nid,14,1)::INTEGER THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'checksum');
  END IF;
  RETURN jsonb_build_object('valid', true, 'birth_date', make_date(_year,_mm,_dd), 'governorate', _gov);
END; $$;
GRANT EXECUTE ON FUNCTION public.validate_egyptian_national_id(TEXT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.submit_national_id(_national_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _p public.profiles; _v JSONB; _clean TEXT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _p FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile not found'; END IF;
  IF _p.national_id_verified THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_verified');
  END IF;
  _clean := regexp_replace(COALESCE(_national_id,''), '[^0-9]', '', 'g');
  _v := public.validate_egyptian_national_id(_clean);
  IF NOT (_v->>'valid')::BOOLEAN THEN
    RETURN jsonb_build_object('ok', false, 'reason', _v->>'reason');
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE national_id = _clean AND id <> _uid) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_used');
  END IF;
  UPDATE public.profiles
     SET national_id = _clean,
         national_id_verified = true,
         national_id_verified_at = now(),
         national_id_verification_method = 'server_format_checksum',
         updated_at = now()
   WHERE id = _uid;
  RETURN jsonb_build_object('ok', true);
END; $$;
REVOKE ALL ON FUNCTION public.submit_national_id(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_national_id(TEXT) TO authenticated;

-- admin: entitlement + identity reset (re-verification path)
CREATE OR REPLACE FUNCTION public.admin_set_extreme_access(_target UUID, _enabled BOOLEAN)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.profiles;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles SET extreme_difficulty_enabled = _enabled, updated_at = now()
   WHERE id = _target RETURNING * INTO _row;
  PERFORM public.admin_log(_target, 'set_extreme_access', jsonb_build_object('enabled', _enabled));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_set_extreme_access(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_extreme_access(UUID, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_reset_national_id(_target UUID)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.profiles;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles
     SET national_id = NULL, national_id_verified = false, national_id_verified_at = NULL,
         national_id_verification_method = NULL, updated_at = now()
   WHERE id = _target RETURNING * INTO _row;
  PERFORM public.admin_log(_target, 'reset_national_id', '{}'::jsonb);
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_reset_national_id(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reset_national_id(UUID) TO authenticated;