-- WISO Partners: fixed referral rewards + influencer activation and commissions.
-- Extends the existing referral attribution and cash wallet systems.

-- 1) Influencer activation codes are created by admins on the server.
CREATE TABLE IF NOT EXISTS public.influencer_activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER NOT NULL DEFAULT 1 CHECK (max_uses > 0),
  uses_count INTEGER NOT NULL DEFAULT 0 CHECK (uses_count >= 0 AND uses_count <= max_uses),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (char_length(code) BETWEEN 8 AND 100)
);

CREATE TABLE IF NOT EXISTS public.influencer_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  activation_code_id UUID NOT NULL REFERENCES public.influencer_activation_codes(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.influencer_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_order_id UUID NOT NULL REFERENCES public.tool_orders(id) ON DELETE RESTRICT,
  product_key TEXT NOT NULL CHECK (product_key IN ('financial_literacy','qureo','financial_literacy_qureo')),
  amount_egp NUMERIC(12,2) NOT NULL CHECK (amount_egp IN (20,30,50)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tool_order_id)
);

-- A regular referrer receives one fixed 10 EGP reward when their invitee's
-- first special request is accepted. Keep this separate from old paid-purchase
-- referral history so old records remain intact.
CREATE TABLE IF NOT EXISTS public.referral_request_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  special_request_id UUID NOT NULL UNIQUE REFERENCES public.special_requests(id) ON DELETE RESTRICT,
  amount_egp NUMERIC(12,2) NOT NULL DEFAULT 10 CHECK (amount_egp = 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_influencer_commissions_owner
  ON public.influencer_commissions(influencer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_request_rewards_owner
  ON public.referral_request_rewards(referrer_user_id, created_at DESC);

ALTER TABLE public.influencer_activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_request_rewards ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.influencer_activation_codes, public.influencer_profiles,
  public.influencer_commissions, public.referral_request_rewards FROM anon, authenticated;
GRANT ALL ON public.influencer_activation_codes, public.influencer_profiles,
  public.influencer_commissions, public.referral_request_rewards TO service_role;

-- Authenticated users may read only their own influencer status and commission history.
GRANT SELECT ON public.influencer_profiles, public.influencer_commissions TO authenticated;
CREATE POLICY influencer_profile_read_own ON public.influencer_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY influencer_commissions_read_own ON public.influencer_commissions
  FOR SELECT TO authenticated USING (influencer_user_id = auth.uid() OR public.is_admin());

-- Activation is atomic: one code use and one influencer profile per account.
CREATE OR REPLACE FUNCTION public.activate_wiso_influencer(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _code_row public.influencer_activation_codes;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _code IS NULL OR length(trim(_code)) < 8 OR length(trim(_code)) > 100 THEN
    RAISE EXCEPTION 'invalid_influencer_code';
  END IF;

  IF EXISTS (SELECT 1 FROM public.influencer_profiles WHERE user_id = _uid) THEN
    RETURN jsonb_build_object('ok', true, 'already_active', true);
  END IF;

  SELECT * INTO _code_row
  FROM public.influencer_activation_codes
  WHERE code = upper(trim(_code))
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > now())
    AND uses_count < max_uses
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_or_expired_influencer_code'; END IF;

  UPDATE public.influencer_activation_codes
  SET uses_count = uses_count + 1
  WHERE id = _code_row.id;

  INSERT INTO public.influencer_profiles(user_id, activation_code_id)
  VALUES (_uid, _code_row.id);

  RETURN jsonb_build_object('ok', true, 'already_active', false);
END;
$$;
REVOKE ALL ON FUNCTION public.activate_wiso_influencer(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_wiso_influencer(TEXT) TO authenticated;

-- Fixed 10 EGP reward for the first accepted special request of an invitee.
-- This helper is called inside the admin approval transaction in a follow-up patch.
CREATE OR REPLACE FUNCTION public.apply_referral_request_reward(_request UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _request_row public.special_requests;
  _attribution public.referral_attributions;
  _inserted UUID;
BEGIN
  SELECT * INTO _request_row
  FROM public.special_requests
  WHERE id = _request AND status = 'accepted'
  FOR UPDATE;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT * INTO _attribution
  FROM public.referral_attributions
  WHERE referred_user_id = _request_row.user_id
  FOR UPDATE;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- Influencers earn product commissions, not the regular 10 EGP request reward.
  IF EXISTS (
    SELECT 1 FROM public.influencer_profiles
    WHERE user_id = _attribution.referrer_user_id AND is_active = TRUE
  ) THEN RETURN 0; END IF;

  INSERT INTO public.referral_request_rewards(
    referred_user_id, referrer_user_id, special_request_id, amount_egp
  ) VALUES (
    _request_row.user_id, _attribution.referrer_user_id, _request_row.id, 10
  ) ON CONFLICT DO NOTHING RETURNING id INTO _inserted;

  IF _inserted IS NULL THEN RETURN 0; END IF;

  INSERT INTO public.student_wallets(user_id)
  VALUES (_attribution.referrer_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.student_wallets
  SET cash_balance_egp = cash_balance_egp + 10, updated_at = now()
  WHERE user_id = _attribution.referrer_user_id;

  INSERT INTO public.wallet_ledger(user_id, resource_type, delta, cash_delta_egp, reason, metadata)
  VALUES (
    _attribution.referrer_user_id, 'cash', 0, 10, 'referral_request_reward',
    jsonb_build_object('referred_user_id', _request_row.user_id, 'special_request_id', _request_row.id)
  );

  INSERT INTO public.notifications(user_id, title, body, kind, metadata)
  VALUES (
    _attribution.referrer_user_id,
    'مكافأة دعوة جديدة',
    'تم قبول أول طلب لصاحب دعوتك، واتضاف 10 جنيه لرصيدك.',
    'referral_reward',
    jsonb_build_object('amount_egp', 10, 'referred_user_id', _request_row.user_id)
  );

  RETURN 10;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_referral_request_reward(UUID) FROM PUBLIC, anon, authenticated;

-- Influencer commission for a confirmed SPRIX/Qureo order. Called in the same
-- transaction that confirms the tool order, so approval and credit are atomic.
CREATE OR REPLACE FUNCTION public.apply_influencer_tool_commission(_order UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_row public.tool_orders;
  _attribution public.referral_attributions;
  _amount NUMERIC(12,2);
  _inserted UUID;
BEGIN
  SELECT * INTO _order_row
  FROM public.tool_orders
  WHERE id = _order AND status = 'confirmed'
  FOR UPDATE;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT * INTO _attribution
  FROM public.referral_attributions
  WHERE referred_user_id = _order_row.user_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.influencer_profiles
    WHERE user_id = _attribution.referrer_user_id AND is_active = TRUE
  ) THEN RETURN 0; END IF;

  _amount := CASE _order_row.product_key
    WHEN 'financial_literacy' THEN 20
    WHEN 'qureo' THEN 30
    WHEN 'financial_literacy_qureo' THEN 50
    ELSE 0
  END;
  IF _amount = 0 THEN RETURN 0; END IF;

  INSERT INTO public.influencer_commissions(
    influencer_user_id, referred_user_id, tool_order_id, product_key, amount_egp
  ) VALUES (
    _attribution.referrer_user_id, _order_row.user_id, _order_row.id,
    _order_row.product_key, _amount
  ) ON CONFLICT (tool_order_id) DO NOTHING RETURNING id INTO _inserted;
  IF _inserted IS NULL THEN RETURN 0; END IF;

  INSERT INTO public.student_wallets(user_id)
  VALUES (_attribution.referrer_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.student_wallets
  SET cash_balance_egp = cash_balance_egp + _amount, updated_at = now()
  WHERE user_id = _attribution.referrer_user_id;

  INSERT INTO public.wallet_ledger(user_id, resource_type, delta, cash_delta_egp, reason, metadata)
  VALUES (
    _attribution.referrer_user_id, 'cash', 0, _amount, 'influencer_commission',
    jsonb_build_object(
      'referred_user_id', _order_row.user_id,
      'tool_order_id', _order_row.id,
      'product_key', _order_row.product_key
    )
  );

  INSERT INTO public.notifications(user_id, title, body, kind, metadata)
  VALUES (
    _attribution.referrer_user_id,
    'عمولة إنفلونسر جديدة',
    'اتضافت عمولة جديدة لمحفظتك بعد اعتماد اشتراك من خلال لينك الدعوة.',
    'influencer_commission',
    jsonb_build_object('amount_egp', _amount, 'referred_user_id', _order_row.user_id, 'tool_order_id', _order_row.id)
  );

  RETURN _amount;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_influencer_tool_commission(UUID) FROM PUBLIC, anon, authenticated;

-- Retire the previous 10%-of-first-paid-purchase reward. The new program
-- rewards normal referrers on accepted requests and influencers on tool orders.
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
BEGIN
  RETURN 0;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_first_paid_referral_reward(UUID, TEXT, UUID, NUMERIC)
  FROM PUBLIC, anon, authenticated;

-- Automatic hooks: no client-side code can trigger or duplicate a payout.
CREATE OR REPLACE FUNCTION public.trg_apply_referral_request_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted' THEN
    PERFORM public.apply_referral_request_reward(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_special_request_referral_reward ON public.special_requests;
CREATE TRIGGER trg_special_request_referral_reward
AFTER UPDATE OF status ON public.special_requests
FOR EACH ROW
EXECUTE FUNCTION public.trg_apply_referral_request_reward();

CREATE OR REPLACE FUNCTION public.trg_apply_influencer_tool_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmed' THEN
    PERFORM public.apply_influencer_tool_commission(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tool_order_influencer_commission ON public.tool_orders;
CREATE TRIGGER trg_tool_order_influencer_commission
AFTER UPDATE OF status ON public.tool_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_apply_influencer_tool_commission();

REVOKE ALL ON FUNCTION public.trg_apply_referral_request_reward() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_apply_influencer_tool_commission() FROM PUBLIC, anon, authenticated;
