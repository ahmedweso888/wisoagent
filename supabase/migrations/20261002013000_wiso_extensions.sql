
-- WISO Agent extensions: SPRIX activation codes, referrals, center requests,
-- paid-purchase attribution, wallet cash balance, and atomic payment flows.

-- ============================================================
-- Existing wallet: extend, do not replace.
-- ============================================================
ALTER TABLE public.student_wallets
  ADD COLUMN IF NOT EXISTS cash_balance_egp NUMERIC(12,2) NOT NULL DEFAULT 0
    CHECK (cash_balance_egp >= 0);

ALTER TABLE public.wallet_ledger
  ADD COLUMN IF NOT EXISTS cash_delta_egp NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE public.wallet_ledger
  DROP CONSTRAINT IF EXISTS wallet_ledger_resource_type_check;

ALTER TABLE public.wallet_ledger
  ADD CONSTRAINT wallet_ledger_resource_type_check
  CHECK (resource_type IN ('questions','images','pdfs','cash'));

-- ============================================================
-- Existing code system: extend center_codes instead of creating
-- a second generic code table.
-- ============================================================
ALTER TABLE public.center_codes
  ADD COLUMN IF NOT EXISTS code_type TEXT NOT NULL DEFAULT 'question',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sprix_access_days INTEGER;

ALTER TABLE public.center_codes
  DROP CONSTRAINT IF EXISTS center_codes_code_type_check;

ALTER TABLE public.center_codes
  ADD CONSTRAINT center_codes_code_type_check
  CHECK (code_type IN ('question','sprix'));

ALTER TABLE public.center_codes
  DROP CONSTRAINT IF EXISTS center_codes_sprix_days_check;

ALTER TABLE public.center_codes
  ADD CONSTRAINT center_codes_sprix_days_check
  CHECK (sprix_access_days IS NULL OR (sprix_access_days BETWEEN 1 AND 3650));

CREATE INDEX IF NOT EXISTS idx_center_codes_type_status
  ON public.center_codes(code_type, used_at, expires_at);

WITH duplicate_pending AS (
  SELECT id,
         row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.payment_requests
  WHERE status = 'pending'
)
UPDATE public.payment_requests p
SET status = 'rejected',
    reject_reason = COALESCE(p.reject_reason, 'تم إغلاق طلب دفع قديم تلقائيًا.'),
    reviewed_at = COALESCE(p.reviewed_at, now()),
    updated_at = now()
FROM duplicate_pending d
WHERE p.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_wiso_one_pending_payment_per_user
  ON public.payment_requests(user_id)
  WHERE status = 'pending';

-- ============================================================
-- Existing SPRIX credential/binding store: verified account
-- binding + one WISO account per SPRIX account.
-- ============================================================
ALTER TABLE public.sprix_credentials
  ADD COLUMN IF NOT EXISTS account_username_hash TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE public.sprix_credentials
  DROP CONSTRAINT IF EXISTS sprix_credentials_verification_status_check;

ALTER TABLE public.sprix_credentials
  ADD CONSTRAINT sprix_credentials_verification_status_check
  CHECK (verification_status IN ('unverified','verified'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_sprix_credentials_account_hash
  ON public.sprix_credentials(account_username_hash)
  WHERE account_username_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sprix_credentials_verified
  ON public.sprix_credentials(user_id, verification_status, verified_at);

CREATE TABLE IF NOT EXISTS public.sprix_binding_attempts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  locked_until TIMESTAMPTZ
);

ALTER TABLE public.sprix_binding_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sprix_binding_attempts FROM anon, authenticated;
GRANT ALL ON public.sprix_binding_attempts TO service_role;

CREATE OR REPLACE FUNCTION public.begin_sprix_binding_attempt(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.sprix_binding_attempts;
BEGIN
  INSERT INTO public.sprix_binding_attempts(user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO _row
  FROM public.sprix_binding_attempts
  WHERE user_id = _user_id
  FOR UPDATE;

  IF _row.locked_until IS NOT NULL AND _row.locked_until > now() THEN
    RAISE EXCEPTION 'SPRIX_VERIFICATION_RATE_LIMITED';
  END IF;

  IF _row.window_started_at < now() - interval '15 minutes' THEN
    UPDATE public.sprix_binding_attempts
    SET window_started_at = now(), attempt_count = 1, locked_until = NULL
    WHERE user_id = _user_id;
    RETURN;
  END IF;

  IF _row.attempt_count >= 5 THEN
    UPDATE public.sprix_binding_attempts
    SET locked_until = now() + interval '15 minutes'
    WHERE user_id = _user_id;
    RAISE EXCEPTION 'SPRIX_VERIFICATION_RATE_LIMITED';
  END IF;

  UPDATE public.sprix_binding_attempts
  SET attempt_count = attempt_count + 1
  WHERE user_id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.begin_sprix_binding_attempt(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.begin_sprix_binding_attempt(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.reset_sprix_binding_attempt(_user_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.sprix_binding_attempts
  SET attempt_count = 0, window_started_at = now(), locked_until = NULL
  WHERE user_id = _user_id;
$$;

REVOKE ALL ON FUNCTION public.reset_sprix_binding_attempt(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_sprix_binding_attempt(UUID) TO service_role;

-- ============================================================
-- Existing SPRIX entitlement: support code source + expiry.
-- ============================================================
ALTER TABLE public.sprix_agent_access
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'payment',
  ADD COLUMN IF NOT EXISTS source_code_id UUID REFERENCES public.center_codes(id) ON DELETE SET NULL;

ALTER TABLE public.sprix_agent_access
  DROP CONSTRAINT IF EXISTS sprix_agent_access_source_type_check;

ALTER TABLE public.sprix_agent_access
  ADD CONSTRAINT sprix_agent_access_source_type_check
  CHECK (source_type IN ('payment','code','admin'));

CREATE INDEX IF NOT EXISTS idx_sprix_agent_access_expiry
  ON public.sprix_agent_access(active, expires_at);

ALTER TABLE public.revenue_entries
  DROP CONSTRAINT IF EXISTS revenue_entries_source_check;

ALTER TABLE public.revenue_entries
  ADD CONSTRAINT revenue_entries_source_check
  CHECK (source IN ('payment_request','sprix_payment_request','special_request','center_code'));

-- ============================================================
-- Referral system. These are attribution/reward records, not a
-- second subscription or wallet system.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  visitor_key_hash TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  hit_count INTEGER NOT NULL DEFAULT 1 CHECK (hit_count > 0),
  UNIQUE(referral_link_id, visitor_key_hash)
);

CREATE TABLE IF NOT EXISTS public.referral_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE RESTRICT,
  attributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rewarded_at TIMESTAMPTZ,
  reward_amount_egp NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (reward_amount_egp >= 0),
  reward_payment_kind TEXT,
  reward_payment_reference UUID
);

CREATE INDEX IF NOT EXISTS idx_referral_attributions_referrer
  ON public.referral_attributions(referrer_user_id, attributed_at DESC);

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_kind TEXT NOT NULL CHECK (payment_kind IN ('wiso_question','sprix_agent')),
  payment_reference UUID NOT NULL,
  purchase_amount_egp NUMERIC(12,2) NOT NULL CHECK (purchase_amount_egp > 0),
  reward_amount_egp NUMERIC(12,2) NOT NULL CHECK (reward_amount_egp > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(payment_kind, payment_reference)
);

ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.referral_links, public.referral_visits,
  public.referral_attributions, public.referral_rewards FROM anon, authenticated;
GRANT ALL ON public.referral_links, public.referral_visits,
  public.referral_attributions, public.referral_rewards TO service_role;

-- ============================================================
-- Paid purchase ledger: identifies the first genuinely paid
-- WISO Question/Sprix purchase across both products.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.paid_subscription_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('wiso_question','sprix_agent')),
  payment_reference UUID NOT NULL UNIQUE,
  amount_egp NUMERIC(12,2) NOT NULL CHECK (amount_egp > 0),
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, payment_reference)
);

ALTER TABLE public.paid_subscription_purchases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.paid_subscription_purchases FROM anon, authenticated;
GRANT ALL ON public.paid_subscription_purchases TO service_role;
CREATE INDEX IF NOT EXISTS idx_paid_purchases_user
  ON public.paid_subscription_purchases(user_id, created_at);

-- ============================================================
-- Center cooperation requests.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.center_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  center_name TEXT NOT NULL CHECK (char_length(trim(center_name)) BETWEEN 2 AND 200),
  center_address TEXT NOT NULL CHECK (char_length(trim(center_address)) BETWEEN 5 AND 500),
  contact_number TEXT NOT NULL CHECK (char_length(trim(contact_number)) BETWEEN 8 AND 30),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','reviewing','contacted','approved','rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_center_requests_status_created
  ON public.center_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_center_requests_user
  ON public.center_requests(user_id, created_at DESC);

ALTER TABLE public.center_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.center_requests TO authenticated;
GRANT ALL ON public.center_requests TO service_role;

DROP POLICY IF EXISTS "users read own center requests" ON public.center_requests;
CREATE POLICY "users read own center requests"
  ON public.center_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "users create own center requests" ON public.center_requests;
CREATE POLICY "users create own center requests"
  ON public.center_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admins manage center requests" ON public.center_requests;
CREATE POLICY "admins manage center requests"
  ON public.center_requests FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER trg_center_requests_updated_at
BEFORE UPDATE ON public.center_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Referral link creation / attribution.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_or_create_referral_link(_user_id UUID DEFAULT auth.uid())
RETURNS public.referral_links
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := COALESCE(_user_id, auth.uid());
  _row public.referral_links;
  _code TEXT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _user_id IS NOT NULL AND _user_id <> auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO _row FROM public.referral_links
  WHERE referrer_user_id = _uid
  LIMIT 1;

  IF FOUND THEN RETURN _row; END IF;

  LOOP
    _code := 'REF-' || upper(encode(gen_random_bytes(12), 'hex'));
    BEGIN
      INSERT INTO public.referral_links(referrer_user_id, code)
      VALUES (_uid, _code)
      RETURNING * INTO _row;
      RETURN _row;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_referral_link(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_link(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.capture_referral_attribution(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _link public.referral_links;
  _profile public.profiles;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _code IS NULL OR length(trim(_code)) < 8 OR length(trim(_code)) > 100 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;

  SELECT * INTO _link
  FROM public.referral_links
  WHERE code = upper(trim(_code))
  FOR SHARE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;

  IF _link.referrer_user_id = _uid THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'self_referral');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.referral_attributions
    WHERE referred_user_id = _uid
  ) THEN
    RETURN jsonb_build_object('ok', true, 'already_attributed', true);
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE id = _uid;
  -- Attribution is a registration event. Existing long-lived accounts cannot
  -- be retroactively converted into referrals.
  IF _profile.created_at < now() - interval '48 hours' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'registration_window_expired');
  END IF;

  INSERT INTO public.referral_attributions(
    referred_user_id, referrer_user_id, referral_link_id
  )
  VALUES (_uid, _link.referrer_user_id, _link.id)
  ON CONFLICT (referred_user_id) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'referrer_user_id', _link.referrer_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.capture_referral_attribution(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.capture_referral_attribution(TEXT) TO authenticated;

-- ============================================================
-- First-paid referral reward. Called only from atomic paid
-- confirmation functions below.
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_first_paid_referral_reward(
  _buyer UUID,
  _payment_kind TEXT,
  _payment_reference UUID,
  _amount_egp NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _attr public.referral_attributions;
  _reward NUMERIC(12,2);
  _inserted UUID;
BEGIN
  IF _payment_kind NOT IN ('wiso_question','sprix_agent') THEN
    RAISE EXCEPTION 'invalid_payment_kind';
  END IF;
  IF _amount_egp <= 0 THEN RETURN 0; END IF;

  SELECT * INTO _attr
  FROM public.referral_attributions
  WHERE referred_user_id = _buyer
  FOR UPDATE;

  IF NOT FOUND OR _attr.rewarded_at IS NOT NULL THEN
    RETURN 0;
  END IF;

  -- The paid purchase table is the authoritative first-paid marker.
  IF (SELECT count(*) FROM public.paid_subscription_purchases WHERE user_id = _buyer) <> 1 THEN
    RETURN 0;
  END IF;

  _reward := round(_amount_egp * 0.10, 2);
  IF _reward <= 0 THEN RETURN 0; END IF;

  INSERT INTO public.referral_rewards(
    referred_user_id, referrer_user_id, payment_kind, payment_reference,
    purchase_amount_egp, reward_amount_egp
  )
  VALUES (
    _buyer, _attr.referrer_user_id, _payment_kind, _payment_reference,
    _amount_egp, _reward
  )
  ON CONFLICT (referred_user_id) DO NOTHING
  RETURNING id INTO _inserted;

  IF _inserted IS NULL THEN
    RETURN 0;
  END IF;

  INSERT INTO public.student_wallets(user_id)
  VALUES (_attr.referrer_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.student_wallets
  SET cash_balance_egp = cash_balance_egp + _reward,
      updated_at = now()
  WHERE user_id = _attr.referrer_user_id;

  INSERT INTO public.wallet_ledger(
    user_id, resource_type, delta, cash_delta_egp, reason, metadata
  )
  VALUES (
    _attr.referrer_user_id, 'cash', 0, _reward, 'referral_reward',
    jsonb_build_object(
      'referred_user_id', _buyer,
      'payment_kind', _payment_kind,
      'payment_reference', _payment_reference
    )
  );

  UPDATE public.referral_attributions
  SET rewarded_at = now(),
      reward_amount_egp = _reward,
      reward_payment_kind = _payment_kind,
      reward_payment_reference = _payment_reference
  WHERE id = _attr.id;

  INSERT INTO public.notifications(user_id, title, body, kind, metadata)
  VALUES (
    _attr.referrer_user_id,
    'اتضافت لك عمولة دعوة',
    'صاحبك اشترك لأول مرة، واتضافت 10% من قيمة الاشتراك لمحفظتك.',
    'referral_reward',
    jsonb_build_object('amount_egp', _reward, 'referred_user_id', _buyer)
  );

  RETURN _reward;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_first_paid_referral_reward(UUID, TEXT, UUID, NUMERIC)
  FROM PUBLIC, anon, authenticated;

-- ============================================================
-- Atomic WISO Question payment confirmation.
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_review_wiso_payment(
  _request UUID,
  _approve BOOLEAN,
  _reason TEXT DEFAULT NULL,
  _admin_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.payment_requests;
  _plan public.subscription_plans;
  _profile public.profiles;
  _base TIMESTAMPTZ;
  _expires TIMESTAMPTZ;
  _reward NUMERIC(12,2) := 0;
BEGIN
  IF _admin_id IS NULL OR NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO _row
  FROM public.payment_requests
  WHERE id = _request AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'request_not_found_or_already_reviewed'; END IF;

  IF NOT _approve THEN
    UPDATE public.payment_requests
    SET status = 'rejected',
        reject_reason = NULLIF(trim(COALESCE(_reason,'')), ''),
        reviewed_by = _admin_id,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = _request;

    INSERT INTO public.notifications(user_id, title, body, kind)
    VALUES (
      _row.user_id, 'تم رفض طلب الدفع',
      COALESCE(NULLIF(trim(_reason), ''), 'برجاء مراجعة إثبات التحويل.'),
      'payment'
    );

    INSERT INTO public.admin_audit_logs(admin_id, target_user_id, action, metadata)
    VALUES (_admin_id, _row.user_id, 'review_payment_request',
      jsonb_build_object('request', _request, 'approved', false, 'reason', _reason));

    RETURN jsonb_build_object('ok', true, 'status', 'rejected', 'reward', 0);
  END IF;

  SELECT * INTO _plan
  FROM public.subscription_plans
  WHERE id = _row.plan_id AND is_active = true
  FOR SHARE;

  IF NOT FOUND THEN RAISE EXCEPTION 'payment_plan_missing_or_inactive'; END IF;

  -- Amount is derived from the database plan, never trusted from the browser.
  IF round(_row.amount_egp, 2) <> round(_plan.price_egp, 2) THEN
    RAISE EXCEPTION 'payment_amount_mismatch';
  END IF;

  SELECT * INTO _profile
  FROM public.profiles
  WHERE id = _row.user_id
  FOR UPDATE;

  _base := GREATEST(COALESCE(_profile.subscription_expires_at, now()), now());
  _expires := CASE
    WHEN _plan.ends_at IS NOT NULL AND _plan.ends_at > now()
      AND _plan.duration_days >= 300
      THEN _plan.ends_at
    ELSE _base + make_interval(days => GREATEST(_plan.duration_days, 1))
  END;

  PERFORM public.grant_wallet_credits(
    _row.user_id,
    COALESCE(_plan.question_credits,0),
    COALESCE(_plan.image_credits,0),
    COALESCE(_plan.pdf_credits,0),
    'payment_confirmed',
    jsonb_build_object('payment_request', _request, 'plan_id', _plan.id)
  );

  INSERT INTO public.subscriptions(
    user_id, plan, status, provider, provider_subscription_id,
    granted_manually, started_at, expires_at, plan_id
  )
  VALUES (
    _row.user_id, _plan.name_en, 'active', 'wiso_payment', _request::text,
    false, now(), _expires, _plan.id
  );

  UPDATE public.profiles
  SET subscription_status = 'active',
      subscription_expires_at = _expires,
      extreme_difficulty_enabled = true,
      updated_at = now()
  WHERE id = _row.user_id;

  INSERT INTO public.revenue_entries(user_id, source, reference_id, amount_egp)
  VALUES (_row.user_id, 'payment_request', _row.id, _plan.price_egp);

  INSERT INTO public.paid_subscription_purchases(
    user_id, kind, payment_reference, amount_egp, plan_id
  )
  VALUES (_row.user_id, 'wiso_question', _row.id, _plan.price_egp, _plan.id);

  _reward := public.apply_first_paid_referral_reward(
    _row.user_id, 'wiso_question', _row.id, _plan.price_egp
  );

  UPDATE public.payment_requests
  SET status = 'confirmed',
      reject_reason = NULL,
      reviewed_by = _admin_id,
      reviewed_at = now(),
      updated_at = now()
  WHERE id = _request;

  INSERT INTO public.notifications(user_id, title, body, kind, metadata)
  VALUES (
    _row.user_id, 'تم تأكيد الدفع',
    'تم تفعيل اشتراكك وشحن محفظتك بنجاح.',
    'payment',
    jsonb_build_object('plan_id', _plan.id, 'expires_at', _expires)
  );

  INSERT INTO public.admin_audit_logs(admin_id, target_user_id, action, metadata)
  VALUES (
    _admin_id, _row.user_id, 'review_payment_request',
    jsonb_build_object(
      'request', _request, 'approved', true,
      'plan_id', _plan.id, 'amount_egp', _plan.price_egp,
      'referral_reward_egp', _reward
    )
  );

  RETURN jsonb_build_object(
    'ok', true, 'status', 'confirmed',
    'subscription_expires_at', _expires,
    'referral_reward_egp', _reward
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_wiso_payment(UUID, BOOLEAN, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;

-- ============================================================
-- Atomic SPRIX payment confirmation.
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_review_sprix_payment(
  _request UUID,
  _approve BOOLEAN,
  _reason TEXT DEFAULT NULL,
  _admin_id UUID DEFAULT auth.uid(),
  _access_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.sprix_payment_requests;
  _profile public.profiles;
  _expires TIMESTAMPTZ;
  _base TIMESTAMPTZ;
  _reward NUMERIC(12,2) := 0;
BEGIN
  IF _admin_id IS NULL OR NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _access_days < 1 OR _access_days > 3650 THEN
    RAISE EXCEPTION 'invalid_access_days';
  END IF;

  SELECT * INTO _row
  FROM public.sprix_payment_requests
  WHERE id = _request AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'request_not_found_or_already_reviewed'; END IF;

  IF NOT _approve THEN
    UPDATE public.sprix_payment_requests
    SET status = 'rejected',
        reject_reason = NULLIF(trim(COALESCE(_reason,'')), ''),
        reviewed_by = _admin_id,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = _request;

    INSERT INTO public.notifications(user_id, title, body, kind, metadata)
    VALUES (
      _row.user_id, 'تم رفض طلب دفع SPRIX',
      COALESCE(NULLIF(trim(_reason), ''), 'برجاء مراجعة إثبات التحويل.'),
      'sprix_payment',
      jsonb_build_object('payment_request_id', _request)
    );

    INSERT INTO public.admin_audit_logs(admin_id, target_user_id, action, metadata)
    VALUES (_admin_id, _row.user_id, 'review_sprix_payment',
      jsonb_build_object('payment_request_id', _request, 'approved', false));

    RETURN jsonb_build_object('ok', true, 'status', 'rejected', 'reward', 0);
  END IF;

  SELECT * INTO _profile
  FROM public.profiles
  WHERE id = _row.user_id
  FOR UPDATE;

  _base := GREATEST(
    COALESCE((SELECT expires_at FROM public.sprix_agent_access WHERE user_id = _row.user_id), now()),
    now()
  );
  _expires := _base + make_interval(days => _access_days);

  INSERT INTO public.subscriptions(
    user_id, plan, status, provider, provider_subscription_id,
    granted_manually, started_at, expires_at, plan_id
  )
  VALUES (
    _row.user_id, 'sprix_agent', 'active', 'sprix_payment', _request::text,
    false, now(), _expires, NULL
  );

  INSERT INTO public.sprix_agent_access(
    user_id, active, payment_request_id, granted_at, revoked_at,
    expires_at, source_type, source_code_id, updated_at
  )
  VALUES (
    _row.user_id, true, _row.id, now(), NULL,
    _expires, 'payment', NULL, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    active = true,
    payment_request_id = EXCLUDED.payment_request_id,
    granted_at = COALESCE(public.sprix_agent_access.granted_at, EXCLUDED.granted_at),
    revoked_at = NULL,
    expires_at = EXCLUDED.expires_at,
    source_type = 'payment',
    source_code_id = NULL,
    updated_at = now();

  INSERT INTO public.revenue_entries(user_id, source, reference_id, amount_egp)
  VALUES (_row.user_id, 'sprix_payment_request', _row.id, _row.amount_egp);

  INSERT INTO public.paid_subscription_purchases(
    user_id, kind, payment_reference, amount_egp, plan_id
  )
  VALUES (_row.user_id, 'sprix_agent', _row.id, _row.amount_egp, NULL);

  _reward := public.apply_first_paid_referral_reward(
    _row.user_id, 'sprix_agent', _row.id, _row.amount_egp
  );

  UPDATE public.sprix_payment_requests
  SET status = 'confirmed',
      reject_reason = NULL,
      reviewed_by = _admin_id,
      reviewed_at = now(),
      updated_at = now()
  WHERE id = _request;

  INSERT INTO public.notifications(user_id, title, body, kind, metadata)
  VALUES (
    _row.user_id, 'تم تفعيل WISO SPRIX Agent',
    'تم اعتماد الدفع ويمكنك الآن تشغيل وكيل SPRIX.',
    'sprix_payment',
    jsonb_build_object('expires_at', _expires)
  );

  INSERT INTO public.admin_audit_logs(admin_id, target_user_id, action, metadata)
  VALUES (
    _admin_id, _row.user_id, 'review_sprix_payment',
    jsonb_build_object(
      'payment_request_id', _request, 'approved', true,
      'amount_egp', _row.amount_egp, 'referral_reward_egp', _reward
    )
  );

  RETURN jsonb_build_object(
    'ok', true, 'status', 'confirmed',
    'expires_at', _expires, 'referral_reward_egp', _reward
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_sprix_payment(UUID, BOOLEAN, TEXT, UUID, INTEGER)
  FROM PUBLIC, anon, authenticated;

-- ============================================================
-- Extend existing center-code redemption atomically.
-- ============================================================
CREATE OR REPLACE FUNCTION public.redeem_center_code(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _c public.center_codes;
  _plan public.subscription_plans;
  _expires TIMESTAMPTZ;
  _base TIMESTAMPTZ;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND suspended_at IS NOT NULL) THEN
    RAISE EXCEPTION 'student_not_eligible';
  END IF;
  SELECT * INTO _c
  FROM public.center_codes
  WHERE code = upper(trim(_code))
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_code'; END IF;
  IF _c.used_by IS NOT NULL THEN RAISE EXCEPTION 'code_already_used'; END IF;
  IF _c.expires_at IS NOT NULL AND _c.expires_at <= now() THEN
    RAISE EXCEPTION 'code_expired';
  END IF;

  SELECT * INTO _plan
  FROM public.subscription_plans
  WHERE id = _c.plan_id AND is_active = true;

  IF NOT FOUND THEN RAISE EXCEPTION 'code_plan_unavailable'; END IF;

  IF _c.code_type = 'question' THEN
    _base := GREATEST(
      COALESCE((SELECT subscription_expires_at FROM public.profiles WHERE id = _uid), now()),
      now()
    );
    _expires := CASE
      WHEN _plan.ends_at IS NOT NULL AND _plan.ends_at > now()
        AND _plan.duration_days >= 300
        THEN _plan.ends_at
      ELSE _base + make_interval(days => GREATEST(_plan.duration_days,1))
    END;

    PERFORM public.grant_wallet_credits(
      _uid,
      COALESCE(_plan.question_credits,0),
      COALESCE(_plan.image_credits,0),
      COALESCE(_plan.pdf_credits,0),
      'center_code',
      jsonb_build_object('code_id', _c.id, 'center_id', _c.center_id)
    );

    INSERT INTO public.subscriptions(
      user_id, plan, status, provider, provider_subscription_id,
      granted_manually, started_at, expires_at, plan_id
    )
    VALUES (
      _uid, _plan.name_en, 'active', 'center_code', _c.id::text,
      true, now(), _expires, _plan.id
    );

    UPDATE public.profiles
    SET subscription_status = 'active',
        subscription_expires_at = _expires,
        updated_at = now()
    WHERE id = _uid;

    INSERT INTO public.revenue_entries(user_id, source, reference_id, amount_egp)
    VALUES (_uid, 'center_code', _c.id, COALESCE(_plan.price_egp,0));

  ELSIF _c.code_type = 'sprix' THEN
    _base := GREATEST(
      COALESCE((SELECT expires_at FROM public.sprix_agent_access WHERE user_id = _uid), now()),
      now()
    );
    IF EXISTS (
      SELECT 1 FROM public.sprix_agent_access
      WHERE user_id = _uid AND active = true
        AND (expires_at IS NULL OR expires_at > now())
    ) THEN
      RAISE EXCEPTION 'sprix_access_already_active';
    END IF;

    _expires := _base + make_interval(days => GREATEST(COALESCE(_c.sprix_access_days, _plan.duration_days),1));

    INSERT INTO public.sprix_agent_access(
      user_id, active, payment_request_id, granted_at, revoked_at,
      expires_at, source_type, source_code_id, updated_at
    )
    VALUES (
      _uid, true, NULL, now(), NULL, _expires, 'code', _c.id, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      active = true,
      payment_request_id = NULL,
      granted_at = now(),
      revoked_at = NULL,
      expires_at = EXCLUDED.expires_at,
      source_type = 'code',
      source_code_id = EXCLUDED.source_code_id,
      updated_at = now();

    INSERT INTO public.subscriptions(
      user_id, plan, status, provider, provider_subscription_id,
      granted_manually, started_at, expires_at, plan_id
    )
    VALUES (
      _uid, 'sprix_agent', 'active', 'center_code', _c.id::text,
      true, now(), _expires, NULL
    );

    INSERT INTO public.revenue_entries(user_id, source, reference_id, amount_egp)
    VALUES (_uid, 'center_code', _c.id, COALESCE(_plan.price_egp,0));
  ELSE
    RAISE EXCEPTION 'invalid_code_type';
  END IF;

  UPDATE public.center_codes
  SET used_by = _uid, used_at = now()
  WHERE id = _c.id;

  RETURN jsonb_build_object(
    'ok', true,
    'code_type', _c.code_type,
    'expires_at', _expires,
    'question_credits', CASE WHEN _c.code_type = 'question' THEN COALESCE(_plan.question_credits,0) ELSE 0 END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_center_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_center_code(TEXT) TO authenticated;

-- Replace the old 3-argument generator with an extended version.
DROP FUNCTION IF EXISTS public.admin_generate_center_codes(UUID, UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.admin_generate_center_codes(
  _center UUID,
  _plan UUID,
  _count INTEGER,
  _code_type TEXT DEFAULT 'question',
  _expires_at TIMESTAMPTZ DEFAULT NULL,
  _sprix_access_days INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i INTEGER;
  _made INTEGER := 0;
  _code TEXT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _count IS NULL OR _count < 1 OR _count > 5000 THEN RAISE EXCEPTION 'invalid_count'; END IF;
  IF _code_type NOT IN ('question','sprix') THEN RAISE EXCEPTION 'invalid_code_type'; END IF;
  IF _expires_at IS NOT NULL AND _expires_at <= now() THEN RAISE EXCEPTION 'invalid_expiry'; END IF;
  IF _code_type = 'sprix' AND (COALESCE(_sprix_access_days,0) NOT BETWEEN 1 AND 3650) THEN
    RAISE EXCEPTION 'invalid_sprix_access_days';
  END IF;

  PERFORM 1 FROM public.centers WHERE id = _center;
  IF NOT FOUND THEN RAISE EXCEPTION 'center_not_found'; END IF;
  PERFORM 1 FROM public.subscription_plans WHERE id = _plan AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'plan_not_found'; END IF;

  FOR i IN 1.._count LOOP
    LOOP
      _code := CASE
        WHEN _code_type = 'sprix'
          THEN 'WISO-SPRIX-' || upper(encode(gen_random_bytes(16),'hex'))
        ELSE 'WISO-' || upper(encode(gen_random_bytes(16),'hex'))
      END;
      BEGIN
        INSERT INTO public.center_codes(
          center_id, plan_id, code, code_type, expires_at, sprix_access_days
        )
        VALUES (
          _center, _plan, _code, _code_type, _expires_at,
          CASE WHEN _code_type = 'sprix' THEN _sprix_access_days ELSE NULL END
        );
        _made := _made + 1;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;
  END LOOP;

  PERFORM public.admin_log(
    NULL,
    'generate_center_codes',
    jsonb_build_object(
      'center', _center, 'plan', _plan, 'count', _made,
      'code_type', _code_type, 'expires_at', _expires_at,
      'sprix_access_days', _sprix_access_days
    )
  );

  RETURN _made;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_generate_center_codes(UUID, UUID, INTEGER, TEXT, TIMESTAMPTZ, INTEGER)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_generate_center_codes(UUID, UUID, INTEGER, TEXT, TIMESTAMPTZ, INTEGER)
  TO authenticated;

-- ============================================================
-- Current WISO commercial plans from the requested production
-- configuration. Existing admin-managed plan rows are updated,
-- not replaced with a second plan system.
-- ============================================================
UPDATE public.subscription_plans
SET name_ar = 'باقة 100 جنيه',
    name_en = 'WISO 100',
    price_egp = 100,
    question_credits = 1200,
    duration_days = 30,
    competition_eligible = true,
    is_active = true
WHERE name_en IN ('Starter','WISO 100') OR name_ar IN ('باقة البداية','باقة 100 جنيه');

UPDATE public.subscription_plans
SET name_ar = 'باقة 200 جنيه',
    name_en = 'WISO 200',
    price_egp = 200,
    question_credits = 2600,
    duration_days = 60,
    competition_eligible = true,
    is_active = true
WHERE name_en IN ('Student','WISO 200') OR name_ar IN ('باقة الطالب','باقة 200 جنيه');

UPDATE public.subscription_plans
SET name_ar = 'باقة 500 جنيه',
    name_en = 'WISO 500',
    price_egp = 500,
    question_credits = 5800,
    duration_days = GREATEST(CEIL(EXTRACT(EPOCH FROM (date_trunc('year', now()) + interval '1 year' - now())) / 86400)::INTEGER, 1),
    ends_at = date_trunc('year', now()) + interval '1 year',
    competition_eligible = true,
    is_active = true
WHERE name_en IN ('Excellence','WISO 500') OR name_ar IN ('باقة التفوق','باقة 500 جنيه');

-- ============================================================
-- Existing competition system: use its current server-side state.
-- ============================================================
UPDATE public.contest_settings
SET enabled = true,
    activation_mode = 'auto',
    activation_target = 30000,
    prize_egp = 100000,
    status = CASE WHEN status = 'active' THEN status ELSE 'draft' END,
    updated_at = now()
WHERE id = true;

-- Public footer link, without changing Footer architecture.
INSERT INTO public.site_footer_links(group_title, label, href, group_order, sort_order)
SELECT 'التعاون', 'تقديم طلب كـسنتر', '/center-request', 4, 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_footer_links
  WHERE label = 'تقديم طلب كـسنتر'
);

INSERT INTO public.site_footer_links(group_title, label, href, group_order, sort_order)
SELECT 'التعاون', 'اشتغل مع WISO', '/work-with-wiso', 4, 2
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_footer_links
  WHERE label = 'اشتغل مع WISO'
);
