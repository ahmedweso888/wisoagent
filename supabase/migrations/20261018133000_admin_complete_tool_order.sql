-- Allow admins to mark a reviewed purchase order as resolved and hide it
-- from the active admin queue without deleting credentials or order history.
ALTER TABLE public.tool_orders
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tool_orders_active_admin_queue
  ON public.tool_orders(created_at DESC)
  WHERE completed_at IS NULL;

CREATE OR REPLACE FUNCTION public.admin_complete_tool_order(
  _order_id UUID,
  _admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_order public.tool_orders%ROWTYPE;
  v_title TEXT;
  v_body TEXT;
BEGIN
  IF _admin_id IS NULL OR NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'admin_required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_order
  FROM public.tool_orders
  WHERE id = _order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tool_order_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_order.status = 'pending' THEN
    RAISE EXCEPTION 'tool_order_must_be_reviewed_first';
  END IF;
  IF v_order.completed_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'already_completed', true, 'order_id', v_order.id);
  END IF;

  UPDATE public.tool_orders
  SET completed_at = now(), updated_at = now()
  WHERE id = _order_id;

  v_title := 'تم حل طلب أداة WISO';
  v_body := CASE
    WHEN v_order.product_key = 'financial_literacy_qureo'
      THEN 'تم الانتهاء من حل طلب SPRIX + Qureo.'
    WHEN v_order.product_key = 'qureo'
      THEN 'تم الانتهاء من حل طلب Qureo.'
    ELSE 'تم الانتهاء من حل طلب SPRIX للثقافة المالية.'
  END;

  INSERT INTO public.notifications(user_id, title, body, kind, metadata)
  VALUES (v_order.user_id, v_title, v_body, 'tool_request_completed',
    jsonb_build_object('tool_order_id', v_order.id, 'product_key', v_order.product_key, 'status', 'completed'));

  INSERT INTO public.admin_audit_logs(admin_id, target_user_id, action, metadata)
  VALUES (_admin_id, v_order.user_id, 'complete_tool_order',
    jsonb_build_object('tool_order_id', v_order.id, 'product_key', v_order.product_key));

  RETURN jsonb_build_object('success', true, 'already_completed', false, 'order_id', v_order.id);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_complete_tool_order(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_complete_tool_order(UUID, UUID) TO service_role;
