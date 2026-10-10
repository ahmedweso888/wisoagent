UPDATE public.user_roles SET role = 'student' WHERE role = 'user';

CREATE OR REPLACE FUNCTION public.admin_set_role(_target UUID, _role public.app_role, _enabled BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _role NOT IN ('admin', 'student') THEN RAISE EXCEPTION 'invalid_role'; END IF;
  IF _enabled THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_target, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _target AND role = _role;
  END IF;
  PERFORM public.admin_log(_target, 'set_role', jsonb_build_object('role', _role, 'enabled', _enabled));
END; $$;
REVOKE ALL ON FUNCTION public.admin_set_role(UUID, public.app_role, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(UUID, public.app_role, BOOLEAN) TO authenticated;

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
    RETURN _row;
  END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  INSERT INTO public.profiles (id, email, full_name) VALUES (_uid, _email, NULLIF(_full_name,'')) RETURNING * INTO _row;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'student') ON CONFLICT DO NOTHING;
  RETURN _row;
END; $$;
REVOKE EXECUTE ON FUNCTION public.ensure_profile(TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_profile(TEXT) TO authenticated;