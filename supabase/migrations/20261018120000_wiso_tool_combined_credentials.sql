-- Store purchase credentials encrypted with the existing SPRIX key and v1 format.
ALTER TABLE public.tool_orders
  ADD COLUMN IF NOT EXISTS account_id_hash TEXT,
  ADD COLUMN IF NOT EXISTS credential_ciphertext TEXT,
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER;

ALTER TABLE public.tool_orders
  DROP CONSTRAINT IF EXISTS tool_orders_encryption_version_check;
ALTER TABLE public.tool_orders
  ADD CONSTRAINT tool_orders_encryption_version_check
  CHECK (encryption_version IS NULL OR encryption_version = 1);

-- One database transaction for linking one credential set to both tool activations.
-- Calling the existing RPC twice within this function means a failure for either tool
-- rolls back both account writes and both attempt consumptions.
CREATE OR REPLACE FUNCTION public.wiso_save_tool_accounts_atomically(
  _user_id UUID,
  _tool_keys TEXT[],
  _account_id_hash TEXT,
  _credential_ciphertext TEXT,
  _encryption_version INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_key TEXT;
  v_result JSONB;
  v_results JSONB := '[]'::jsonb;
  v_seen TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF _user_id IS NULL
     OR _tool_keys IS NULL
     OR cardinality(_tool_keys) <> 2
     OR _account_id_hash IS NULL
     OR length(_account_id_hash) <> 64
     OR _credential_ciphertext IS NULL
     OR length(_credential_ciphertext) = 0
     OR _encryption_version <> 1
  THEN
    RAISE EXCEPTION 'TOOL_CREDENTIALS_INVALID';
  END IF;

  FOREACH v_key IN ARRAY _tool_keys LOOP
    IF v_key NOT IN ('financial_literacy', 'qureo') OR v_key = ANY(v_seen) THEN
      RAISE EXCEPTION 'TOOL_CREDENTIALS_INVALID';
    END IF;
    v_seen := array_append(v_seen, v_key);
    v_result := public.wiso_save_tool_account_with_attempt(
      _user_id, v_key, _account_id_hash, _credential_ciphertext, _encryption_version
    );
    v_results := v_results || jsonb_build_array(v_result);
  END LOOP;

  RETURN jsonb_build_object('saved', true, 'accounts', v_results);
END;
$function$;

REVOKE ALL ON FUNCTION public.wiso_save_tool_accounts_atomically(UUID, TEXT[], TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wiso_save_tool_accounts_atomically(UUID, TEXT[], TEXT, TEXT, INTEGER) TO service_role;
