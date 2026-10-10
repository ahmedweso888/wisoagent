BEGIN;

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
SET search_path TO 'public', 'pg_temp'
AS $function$
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

  -- Serialize submissions for this user and tool.
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

  -- Only the newest activation attempt can be used.
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

  -- Never allow the same external account to belong to another user.
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

  -- Lock the existing account, if any.
  SELECT *
  INTO v_existing
  FROM public.tool_accounts
  WHERE user_id = _user_id
    AND tool_key = _tool_key
  FOR UPDATE;

  -- A fresh, unused activation attempt permits rebinding.
  -- Without that attempt, the checks above reject the submission.
  -- Keep the cross-user account binding protection above.

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
$function$;

REVOKE ALL ON FUNCTION public.wiso_save_tool_account_with_attempt(
  UUID, TEXT, TEXT, TEXT, INTEGER
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.wiso_save_tool_account_with_attempt(
  UUID, TEXT, TEXT, TEXT, INTEGER
) TO service_role;

COMMIT;
