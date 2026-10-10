ALTER TABLE public.ai_settings
  ADD COLUMN IF NOT EXISTS ai_mode_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_emergency_disabled BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.admin_set_ai_switches(_ai_mode_enabled boolean DEFAULT NULL::boolean, _emergency_disabled boolean DEFAULT NULL::boolean)
RETURNS public.ai_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _row public.ai_settings;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.ai_settings SET
    ai_mode_enabled = COALESCE(_ai_mode_enabled, ai_mode_enabled),
    ai_emergency_disabled = COALESCE(_emergency_disabled, ai_emergency_disabled),
    updated_at = now(),
    updated_by = auth.uid()
  WHERE id RETURNING * INTO _row;
  PERFORM public.admin_log(NULL, 'ai_switches',
    jsonb_build_object('ai_mode_enabled', _ai_mode_enabled, 'emergency_disabled', _emergency_disabled));
  RETURN _row;
END; $function$;

REVOKE EXECUTE ON FUNCTION public.admin_set_ai_switches(boolean, boolean) FROM anon;