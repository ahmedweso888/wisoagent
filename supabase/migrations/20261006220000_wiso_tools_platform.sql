-- WISO Tools Platform integration.
-- Extends the existing WISO code/payment/admin infrastructure without
-- creating a second auth, wallet, subscription, or payment gateway.

-- ============================================================
-- Tool access + orders
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tool_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_key TEXT NOT NULL CHECK (tool_key IN ('financial_literacy','qureo')),
  active BOOLEAN NOT NULL DEFAULT true,
  source_type TEXT NOT NULL CHECK (source_type IN ('payment','code','admin')),
  source_order_id UUID,
  source_code_id UUID REFERENCES public.center_codes(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_key)
);

CREATE INDEX IF NOT EXISTS idx_tool_access_user ON public.tool_access(user_id, tool_key);
CREATE INDEX IF NOT EXISTS idx_tool_access_active ON public.tool_access(tool_key, active, expires_at);

ALTER TABLE public.tool_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tool_access FROM anon, authenticated;
GRANT SELECT ON public.tool_access TO authenticated;
GRANT ALL ON public.tool_access TO service_role;

DROP POLICY IF EXISTS "students read own tool access" ON public.tool_access;
CREATE POLICY "students read own tool access"
  ON public.tool_access FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE TABLE IF NOT EXISTS public.tool_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_key TEXT NOT NULL CHECK (product_key IN ('financial_literacy','qureo','financial_literacy_qureo')),
  amount_egp NUMERIC(10,2) NOT NULL CHECK (amount_egp > 0),
  method TEXT NOT NULL CHECK (method IN ('vodafone_cash','instapay')),
  sender_number TEXT NOT NULL CHECK (char_length(sender_number) BETWEEN 8 AND 30),
  screenshot_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected')),
  reject_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tool_orders_user ON public.tool_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_orders_status ON public.tool_orders(status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tool_one_pending_order_per_user
  ON public.tool_orders(user_id)
  WHERE status = 'pending';

ALTER TABLE public.tool_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tool_orders FROM anon, authenticated;
GRANT SELECT ON public.tool_orders TO authenticated;
GRANT ALL ON public.tool_orders TO service_role;

DROP POLICY IF EXISTS "students read own tool orders" ON public.tool_orders;
CREATE POLICY "students read own tool orders"
  ON public.tool_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE TABLE IF NOT EXISTS public.tool_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_key TEXT NOT NULL CHECK (tool_key IN ('financial_literacy','qureo')),
  account_id_hash TEXT NOT NULL,
  credential_ciphertext TEXT NOT NULL,
  encryption_version SMALLINT NOT NULL DEFAULT 1 CHECK (encryption_version > 0),
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('unverified','verified')),
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_key),
  UNIQUE(tool_key, account_id_hash)
);

CREATE INDEX IF NOT EXISTS idx_tool_accounts_user ON public.tool_accounts(user_id, tool_key);

ALTER TABLE public.tool_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tool_accounts FROM anon, authenticated;
GRANT ALL ON public.tool_accounts TO service_role;

-- Keep timestamps consistent with the existing WISO infrastructure.
DROP TRIGGER IF EXISTS trg_tool_access_updated_at ON public.tool_access;
CREATE TRIGGER trg_tool_access_updated_at
BEFORE UPDATE ON public.tool_access
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tool_orders_updated_at ON public.tool_orders;
CREATE TRIGGER trg_tool_orders_updated_at
BEFORE UPDATE ON public.tool_orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tool_accounts_updated_at ON public.tool_accounts;
CREATE TRIGGER trg_tool_accounts_updated_at
BEFORE UPDATE ON public.tool_accounts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tool_jobs_updated_at ON public.tool_jobs;
CREATE TRIGGER trg_tool_jobs_updated_at
BEFORE UPDATE ON public.tool_jobs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Existing center code system: add tool code types.
-- "sprix" remains valid for backwards compatibility and means
-- financial_literacy.
-- ============================================================

ALTER TABLE public.center_codes
  ALTER COLUMN plan_id DROP NOT NULL;

ALTER TABLE public.center_codes
  DROP CONSTRAINT IF EXISTS center_codes_code_type_check;

ALTER TABLE public.center_codes
  ADD CONSTRAINT center_codes_code_type_check
  CHECK (code_type IN ('question','sprix','qureo','sprix_qureo'));

ALTER TABLE public.center_codes
  DROP CONSTRAINT IF EXISTS center_codes_sprix_days_check;

ALTER TABLE public.center_codes
  ADD CONSTRAINT center_codes_sprix_days_check
  CHECK (sprix_access_days IS NULL OR (sprix_access_days BETWEEN 1 AND 3650));

-- ============================================================
-- Seed the three products as immutable server-side catalog data.
-- Prices are also enforced in the server code and in the payment
-- confirmation RPC below; the browser never controls the amount.
-- ============================================================

-- ============================================================
-- Atomic tool order review.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_review_tool_order(
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
  _row public.tool_orders;
  _expected NUMERIC(10,2);
  _expires TIMESTAMPTZ := NULL;
  _tool TEXT;
  _source_key TEXT;
BEGIN
  IF _admin_id IS NULL OR NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO _row
  FROM public.tool_orders
  WHERE id = _request AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'request_not_found_or_already_reviewed';
  END IF;

  _expected := CASE _row.product_key
    WHEN 'financial_literacy' THEN 60
    WHEN 'qureo' THEN 70
    WHEN 'financial_literacy_qureo' THEN 120
    ELSE 0
  END;

  IF round(_row.amount_egp, 2) <> _expected THEN
    RAISE EXCEPTION 'tool_payment_amount_mismatch';
  END IF;

  IF NOT _approve THEN
    UPDATE public.tool_orders
    SET status = 'rejected',
        reject_reason = NULLIF(trim(COALESCE(_reason,'')), ''),
        reviewed_by = _admin_id,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = _request;

    INSERT INTO public.notifications(user_id, title, body, kind, metadata)
    VALUES (
      _row.user_id,
      'تم رفض طلب أداة WISO',
      COALESCE(NULLIF(trim(_reason), ''), 'برجاء مراجعة إثبات التحويل.'),
      'tool_payment',
      jsonb_build_object('tool_order_id', _request, 'product_key', _row.product_key)
    );

    INSERT INTO public.admin_audit_logs(admin_id, target_user_id, action, metadata)
    VALUES (
      _admin_id, _row.user_id, 'review_tool_order',
      jsonb_build_object('tool_order_id', _request, 'approved', false, 'reason', _reason)
    );

    RETURN jsonb_build_object('ok', true, 'status', 'rejected');
  END IF;

  IF _row.product_key IN ('financial_literacy','financial_literacy_qureo') THEN
    INSERT INTO public.tool_access(
      user_id, tool_key, active, source_type, source_order_id, activated_at,
      expires_at, revoked_at, updated_at
    )
    VALUES (
      _row.user_id, 'financial_literacy', true, 'payment', _row.id, now(),
      _expires, NULL, now()
    )
    ON CONFLICT (user_id, tool_key) DO UPDATE SET
      active = true,
      source_type = 'payment',
      source_order_id = EXCLUDED.source_order_id,
      activated_at = now(),
      expires_at = EXCLUDED.expires_at,
      revoked_at = NULL,
      updated_at = now();
  END IF;

  IF _row.product_key IN ('qureo','financial_literacy_qureo') THEN
    INSERT INTO public.tool_access(
      user_id, tool_key, active, source_type, source_order_id, activated_at,
      expires_at, revoked_at, updated_at
    )
    VALUES (
      _row.user_id, 'qureo', true, 'payment', _row.id, now(),
      _expires, NULL, now()
    )
    ON CONFLICT (user_id, tool_key) DO UPDATE SET
      active = true,
      source_type = 'payment',
      source_order_id = EXCLUDED.source_order_id,
      activated_at = now(),
      expires_at = EXCLUDED.expires_at,
      revoked_at = NULL,
      updated_at = now();
  END IF;

  INSERT INTO public.revenue_entries(user_id, source, reference_id, amount_egp)
  VALUES (_row.user_id, 'tool_order', _row.id, _row.amount_egp);

  UPDATE public.tool_orders
  SET status = 'confirmed',
      reject_reason = NULL,
      reviewed_by = _admin_id,
      reviewed_at = now(),
      updated_at = now()
  WHERE id = _request;

  INSERT INTO public.notifications(user_id, title, body, kind, metadata)
  VALUES (
    _row.user_id,
    'تم تفعيل أداة WISO',
    'تم اعتماد الدفع وتفعيل الأداة المطلوبة.',
    'tool_payment',
    jsonb_build_object('tool_order_id', _request, 'product_key', _row.product_key)
  );

  INSERT INTO public.admin_audit_logs(admin_id, target_user_id, action, metadata)
  VALUES (
    _admin_id, _row.user_id, 'review_tool_order',
    jsonb_build_object(
      'tool_order_id', _request,
      'approved', true,
      'product_key', _row.product_key,
      'amount_egp', _row.amount_egp
    )
  );

  RETURN jsonb_build_object('ok', true, 'status', 'confirmed', 'product_key', _row.product_key);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_tool_order(UUID, BOOLEAN, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_tool_order(UUID, BOOLEAN, TEXT, UUID)
  TO service_role;

-- ============================================================
-- Atomic tool-code redemption. Question codes continue to use
-- redeem_center_code and never grant tool access.
-- ============================================================

CREATE OR REPLACE FUNCTION public.redeem_tool_code(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _c public.center_codes;
  _base TIMESTAMPTZ;
  _expires TIMESTAMPTZ;
  _days INTEGER;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _uid AND suspended_at IS NOT NULL
  ) THEN
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

  IF _c.code_type NOT IN ('sprix','qureo','sprix_qureo') THEN
    RAISE EXCEPTION 'not_tool_code';
  END IF;

  _days := COALESCE(_c.sprix_access_days, 30);
  IF _days < 1 OR _days > 3650 THEN
    RAISE EXCEPTION 'invalid_tool_access_days';
  END IF;

  _base := now();
  _expires := _base + make_interval(days => _days);

  IF _c.code_type IN ('sprix','sprix_qureo') THEN
    INSERT INTO public.tool_access(
      user_id, tool_key, active, source_type, source_code_id,
      activated_at, expires_at, revoked_at, updated_at
    )
    VALUES (
      _uid, 'financial_literacy', true, 'code', _c.id,
      now(), _expires, NULL, now()
    )
    ON CONFLICT (user_id, tool_key) DO UPDATE SET
      active = true,
      source_type = 'code',
      source_code_id = EXCLUDED.source_code_id,
      activated_at = now(),
      expires_at = EXCLUDED.expires_at,
      revoked_at = NULL,
      updated_at = now();
  END IF;

  IF _c.code_type IN ('qureo','sprix_qureo') THEN
    INSERT INTO public.tool_access(
      user_id, tool_key, active, source_type, source_code_id,
      activated_at, expires_at, revoked_at, updated_at
    )
    VALUES (
      _uid, 'qureo', true, 'code', _c.id,
      now(), _expires, NULL, now()
    )
    ON CONFLICT (user_id, tool_key) DO UPDATE SET
      active = true,
      source_type = 'code',
      source_code_id = EXCLUDED.source_code_id,
      activated_at = now(),
      expires_at = EXCLUDED.expires_at,
      revoked_at = NULL,
      updated_at = now();
  END IF;

  UPDATE public.center_codes
  SET used_by = _uid, used_at = now()
  WHERE id = _c.id;

  RETURN jsonb_build_object(
    'ok', true,
    'code_type', _c.code_type,
    'expires_at', _expires
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_tool_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_tool_code(TEXT) TO authenticated;

-- Revenue supports tool orders without touching question-package revenue.
ALTER TABLE public.revenue_entries
  DROP CONSTRAINT IF EXISTS revenue_entries_source_check;

ALTER TABLE public.revenue_entries
  ADD CONSTRAINT revenue_entries_source_check
  CHECK (source IN (
    'payment_request',
    'sprix_payment_request',
    'special_request',
    'center_code',
    'tool_order'
  ));

-- Existing paid SPRIX entitlement is copied into the generic tool-access
-- table once. Existing legacy rows remain untouched for rollback/history.
INSERT INTO public.tool_access(
  user_id, tool_key, active, source_type, source_order_id,
  source_code_id, activated_at, expires_at, revoked_at, updated_at
)
SELECT
  a.user_id,
  'financial_literacy',
  a.active,
  CASE WHEN a.source_type IN ('payment','code','admin') THEN a.source_type ELSE 'admin' END,
  a.payment_request_id,
  a.source_code_id,
  COALESCE(a.granted_at, a.created_at),
  a.expires_at,
  a.revoked_at,
  now()
FROM public.sprix_agent_access a
ON CONFLICT (user_id, tool_key) DO UPDATE SET
  active = EXCLUDED.active,
  source_type = EXCLUDED.source_type,
  source_order_id = EXCLUDED.source_order_id,
  source_code_id = EXCLUDED.source_code_id,
  activated_at = EXCLUDED.activated_at,
  expires_at = EXCLUDED.expires_at,
  revoked_at = EXCLUDED.revoked_at,
  updated_at = now();

-- Update the existing center-code generator to accept the new tool types.
DROP FUNCTION IF EXISTS public.admin_generate_center_codes(UUID, UUID, INTEGER, TEXT, TIMESTAMPTZ, INTEGER);

CREATE OR REPLACE FUNCTION public.admin_generate_center_codes(
  _center UUID,
  _plan UUID DEFAULT NULL,
  _count INTEGER DEFAULT 1,
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
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _count IS NULL OR _count < 1 OR _count > 5000 THEN
    RAISE EXCEPTION 'invalid_count';
  END IF;
  IF _code_type NOT IN ('question','sprix','qureo','sprix_qureo') THEN
    RAISE EXCEPTION 'invalid_code_type';
  END IF;
  IF _expires_at IS NOT NULL AND _expires_at <= now() THEN
    RAISE EXCEPTION 'invalid_expiry';
  END IF;
  IF _code_type = 'question' AND _plan IS NULL THEN
    RAISE EXCEPTION 'plan_required';
  END IF;
  IF _code_type <> 'question' AND _sprix_access_days IS NOT NULL
     AND (_sprix_access_days < 1 OR _sprix_access_days > 3650) THEN
    RAISE EXCEPTION 'invalid_tool_access_days';
  END IF;

  PERFORM 1 FROM public.centers WHERE id = _center;
  IF NOT FOUND THEN RAISE EXCEPTION 'center_not_found'; END IF;

  IF _plan IS NOT NULL THEN
    PERFORM 1 FROM public.subscription_plans WHERE id = _plan AND is_active = true;
    IF NOT FOUND THEN RAISE EXCEPTION 'plan_not_found'; END IF;
  END IF;

  FOR i IN 1.._count LOOP
    LOOP
      _code := CASE
        WHEN _code_type = 'sprix'
          THEN 'WISO-SPRIX-' || upper(encode(gen_random_bytes(16),'hex'))
        WHEN _code_type = 'qureo'
          THEN 'WISO-QUREO-' || upper(encode(gen_random_bytes(16),'hex'))
        WHEN _code_type = 'sprix_qureo'
          THEN 'WISO-TOOLS-' || upper(encode(gen_random_bytes(16),'hex'))
        ELSE 'WISO-' || upper(encode(gen_random_bytes(16),'hex'))
      END;

      BEGIN
        INSERT INTO public.center_codes(
          center_id, plan_id, code, code_type, expires_at, sprix_access_days
        )
        VALUES (
          _center, CASE WHEN _code_type = 'question' THEN _plan ELSE NULL END,
          _code, _code_type, _expires_at,
          CASE WHEN _code_type <> 'question' THEN COALESCE(_sprix_access_days, 30) ELSE NULL END
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
      'tool_access_days', _sprix_access_days
    )
  );

  RETURN _made;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_generate_center_codes(UUID, UUID, INTEGER, TEXT, TIMESTAMPTZ, INTEGER)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_generate_center_codes(UUID, UUID, INTEGER, TEXT, TIMESTAMPTZ, INTEGER)
  TO service_role;

-- Existing SPRIX payment approvals also update generic access, so old
-- pending records can still be reviewed safely after the migration.
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

  INSERT INTO public.tool_access(
    user_id, tool_key, active, source_type, source_order_id,
    activated_at, expires_at, revoked_at, updated_at
  )
  VALUES (
    _row.user_id, 'financial_literacy', true, 'payment', _row.id,
    now(), _expires, NULL, now()
  )
  ON CONFLICT (user_id, tool_key) DO UPDATE SET
    active = true,
    source_type = 'payment',
    source_order_id = EXCLUDED.source_order_id,
    activated_at = now(),
    expires_at = EXCLUDED.expires_at,
    revoked_at = NULL,
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
GRANT EXECUTE ON FUNCTION public.admin_review_sprix_payment(UUID, BOOLEAN, TEXT, UUID, INTEGER)
  TO service_role;


