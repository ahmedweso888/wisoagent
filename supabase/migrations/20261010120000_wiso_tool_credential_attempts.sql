BEGIN;

-- =========================================================
-- WISO Tool Credential Attempts
-- One credential submission per activation.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.tool_credential_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  access_id UUID NOT NULL,
  user_id UUID NOT NULL,
  tool_key TEXT NOT NULL
    CHECK (tool_key IN ('financial_literacy', 'qureo')),

  source_type TEXT NOT NULL,
  source_id UUID,

  consumed_at TIMESTAMPTZ,
  tool_account_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS
  idx_tool_credential_attempts_user_tool
ON public.tool_credential_attempts (
  user_id,
  tool_key,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  idx_tool_credential_attempts_access
ON public.tool_credential_attempts (
  access_id,
  created_at DESC
);

ALTER TABLE public.tool_credential_attempts
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.tool_credential_attempts
  FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.tool_credential_attempts
  TO service_role;


-- =========================================================
-- Create an attempt whenever a NEW activation is recorded.
--
-- tool_access is the current-access record. Its activation
-- source changes when a new payment/code is redeemed.
-- =========================================================

CREATE OR REPLACE FUNCTION public.wiso_record_tool_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_source_type TEXT;
  v_source_id UUID;
  v_new_activation BOOLEAN := FALSE;
BEGIN
  IF NEW.active IS DISTINCT FROM TRUE
     OR NEW.revoked_at IS NOT NULL
     OR (
       NEW.expires_at IS NOT NULL
       AND NEW.expires_at <= NOW()
     )
  THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_new_activation := TRUE;
  ELSE
    v_new_activation :=
      OLD.active IS DISTINCT FROM NEW.active
      OR OLD.revoked_at IS DISTINCT FROM NEW.revoked_at
      OR OLD.source_type IS DISTINCT FROM NEW.source_type
      OR OLD.source_order_id IS DISTINCT FROM NEW.source_order_id
      OR OLD.source_code_id IS DISTINCT FROM NEW.source_code_id;
  END IF;

  IF NOT v_new_activation THEN
    RETURN NEW;
  END IF;

  -- Identify the activation source.
  IF NEW.source_code_id IS NOT NULL THEN
    v_source_type := 'center_code';
    v_source_id := NEW.source_code_id;

  ELSIF NEW.source_order_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.tool_orders o
      WHERE o.id = NEW.source_order_id
    ) THEN
      v_source_type := 'tool_order';
    ELSE
      -- Legacy SPRIX payment activation.
      v_source_type := 'sprix_payment';
    END IF;

    v_source_id := NEW.source_order_id;

  ELSE
    v_source_type := 'admin_grant';
    v_source_id := NEW.id;
  END IF;

  INSERT INTO public.tool_credential_attempts (
    access_id,
    user_id,
    tool_key,
    source_type,
    source_id
  )
  VALUES (
    NEW.id,
    NEW.user_id,
    NEW.tool_key,
    v_source_type,
    v_source_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS
  trg_wiso_record_tool_attempt
ON public.tool_access;

CREATE TRIGGER trg_wiso_record_tool_attempt
AFTER INSERT OR UPDATE
ON public.tool_access
FOR EACH ROW
EXECUTE FUNCTION public.wiso_record_tool_attempt();


-- =========================================================
-- Backfill existing active entitlements.
--
-- If an account already exists, mark the current entitlement
-- as consumed so deployment doesn't grant a free attempt.
-- =========================================================

INSERT INTO public.tool_credential_attempts (
  access_id,
  user_id,
  tool_key,
  source_type,
  source_id,
  consumed_at,
  tool_account_id
)
SELECT
  a.id,
  a.user_id,
  a.tool_key,

  CASE
    WHEN a.source_code_id IS NOT NULL
      THEN 'center_code'

    WHEN a.source_order_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.tool_orders o
        WHERE o.id = a.source_order_id
      )
      THEN 'tool_order'

    WHEN a.source_order_id IS NOT NULL
      THEN 'sprix_payment'

    ELSE 'admin_grant'
  END,

  COALESCE(
    a.source_code_id,
    a.source_order_id,
    a.id
  ),

  CASE
    WHEN ta.id IS NOT NULL THEN COALESCE(
      ta.verified_at,
      ta.updated_at,
      ta.created_at,
      NOW()
    )
    ELSE NULL
  END,

  ta.id

FROM public.tool_access a

LEFT JOIN public.tool_accounts ta
  ON ta.user_id = a.user_id
 AND ta.tool_key = a.tool_key

WHERE a.active = TRUE
  AND a.revoked_at IS NULL
  AND (
    a.expires_at IS NULL
    OR a.expires_at > NOW()
  )

  AND NOT EXISTS (
    SELECT 1
    FROM public.tool_credential_attempts existing
    WHERE existing.access_id = a.id
  );


-- =========================================================
-- Atomic credential save.
--
-- The current access row and the latest attempt are locked.
-- Credential save and attempt consumption occur in the same
-- transaction. A failure rolls back both operations.
-- =========================================================

CREATE OR REPLACE FUNCTION public.wiso_save_tool_account_with_attempt(
  _user_id UUID,
  _tool_key TEXT,
  _account_id_hash TEXT,
  _credential_ciphertext TEXT,
  _encryption_version INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_access public.tool_access%ROWTYPE;
  v_attempt public.tool_credential_attempts%ROWTYPE;
  v_existing public.tool_accounts%ROWTYPE;
  v_owner UUID;
  v_account public.tool_accounts%ROWTYPE;
BEGIN
  IF _user_id IS NULL
     OR _tool_key NOT IN ('financial_literacy', 'qureo')
     OR _account_id_hash IS NULL
     OR LENGTH(_account_id_hash) <> 64
     OR _credential_ciphertext IS NULL
     OR LENGTH(_credential_ciphertext) = 0
     OR _encryption_version <> 1
  THEN
    RAISE EXCEPTION 'TOOL_CREDENTIALS_INVALID';
  END IF;

  -- Serialize credential submissions for this user and tool.
  SELECT *
  INTO v_access
  FROM public.tool_access
  WHERE user_id = _user_id
    AND tool_key = _tool_key
  FOR UPDATE;

  IF NOT FOUND
     OR v_access.active IS DISTINCT FROM TRUE
     OR v_access.revoked_at IS NOT NULL
     OR (
       v_access.expires_at IS NOT NULL
       AND v_access.expires_at <= NOW()
     )
  THEN
    RAISE EXCEPTION 'TOOL_ACCESS_REQUIRED';
  END IF;

  -- Lock the latest attempt for this activation record.
  SELECT *
  INTO v_attempt
  FROM public.tool_credential_attempts
  WHERE access_id = v_access.id
    AND user_id = _user_id
    AND tool_key = _tool_key
  ORDER BY created_at DESC, id DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TOOL_ATTEMPT_NOT_AVAILABLE';
  END IF;

  IF v_attempt.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'TOOL_ATTEMPT_ALREADY_USED';
  END IF;

  -- Do not let an account be bound to multiple users.
  SELECT user_id
  INTO v_owner
  FROM public.tool_accounts
  WHERE tool_key = _tool_key
    AND account_id_hash = _account_id_hash
    AND user_id <> _user_id
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'TOOL_ACCOUNT_ALREADY_BOUND';
  END IF;

  -- Preserve the existing account-rebinding restriction.
  SELECT *
  INTO v_existing
  FROM public.tool_accounts
  WHERE user_id = _user_id
    AND tool_key = _tool_key
  FOR UPDATE;

  IF FOUND
     AND v_existing.verification_status = 'verified'
     AND v_existing.account_id_hash IS NOT NULL
     AND v_existing.account_id_hash <> _account_id_hash
  THEN
    RAISE EXCEPTION 'TOOL_ACCOUNT_REBIND_NOT_ALLOWED';
  END IF;

  INSERT INTO public.tool_accounts (
    user_id,
    tool_key,
    account_id_hash,
    credential_ciphertext,
    encryption_version,
    verification_status,
    verified_at,
    updated_at
  )
  VALUES (
    _user_id,
    _tool_key,
    _account_id_hash,
    _credential_ciphertext,
    _encryption_version,
    'verified',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, tool_key)
  DO UPDATE SET
    account_id_hash = EXCLUDED.account_id_hash,
    credential_ciphertext = EXCLUDED.credential_ciphertext,
    encryption_version = EXCLUDED.encryption_version,
    verification_status = 'verified',
    verified_at = NOW(),
    updated_at = NOW()
  RETURNING *
  INTO v_account;

  UPDATE public.tool_credential_attempts
  SET
    consumed_at = NOW(),
    tool_account_id = v_account.id
  WHERE id = v_attempt.id
    AND consumed_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TOOL_ATTEMPT_ALREADY_USED';
  END IF;

  RETURN jsonb_build_object(
    'id', v_account.id,
    'tool_key', v_account.tool_key,
    'verification_status', v_account.verification_status,
    'verified_at', v_account.verified_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.wiso_save_tool_account_with_attempt(
  UUID, TEXT, TEXT, TEXT, INTEGER
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.wiso_save_tool_account_with_attempt(
  UUID, TEXT, TEXT, TEXT, INTEGER
) TO service_role;

COMMIT;