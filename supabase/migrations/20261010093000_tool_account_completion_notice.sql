-- Track local-agent tool-account requests as completed without deleting their
-- encrypted credentials. Completed rows are hidden from the active admin queue.
ALTER TABLE public.tool_accounts
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tool_accounts_pending_admin
  ON public.tool_accounts(updated_at DESC)
  WHERE completed_at IS NULL;

CREATE OR REPLACE FUNCTION public.admin_complete_tool_account(
  _account_id UUID,
  _admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account public.tool_accounts%ROWTYPE;
  v_title TEXT;
  v_body TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _admin_id)
     OR NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'admin_required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_account
  FROM public.tool_accounts
  WHERE id = _account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tool_account_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_account.completed_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'already_completed', true, 'account_id', v_account.id);
  END IF;

  UPDATE public.tool_accounts
  SET completed_at = now(), updated_at = now()
  WHERE id = _account_id
  RETURNING * INTO v_account;

  IF v_account.tool_key = 'qureo' THEN
    v_title := 'تم حل طلب وكيل Qureo';
    v_body := 'تم الانتهاء من حل طلبك الخاص بوكيل Qureo. يمكنك الآن مراجعة النتيجة.';
  ELSE
    v_title := 'تم حل طلب وكيل SPRIX';
    v_body := 'تم الانتهاء من حل طلبك الخاص بوكيل SPRIX للثقافة المالية. يمكنك الآن مراجعة النتيجة.';
  END IF;

  INSERT INTO public.notifications(user_id, title, body, kind, metadata)
  VALUES (
    v_account.user_id,
    v_title,
    v_body,
    'tool_request_completed',
    jsonb_build_object('tool_account_id', v_account.id, 'tool_key', v_account.tool_key, 'status', 'completed')
  );

  INSERT INTO public.admin_audit_logs(admin_id, target_user_id, action, metadata)
  VALUES (
    _admin_id,
    v_account.user_id,
    'complete_tool_account_request',
    jsonb_build_object('tool_account_id', v_account.id, 'tool_key', v_account.tool_key)
  );

  RETURN jsonb_build_object('success', true, 'already_completed', false, 'account_id', v_account.id, 'tool_key', v_account.tool_key);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_complete_tool_account(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_complete_tool_account(UUID, UUID) TO service_role;
