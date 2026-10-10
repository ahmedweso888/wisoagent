DO $$
DECLARE f RECORD;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, PUBLIC', f.sig);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "own files read" ON storage.objects;
DROP POLICY IF EXISTS "own files insert" ON storage.objects;
DROP POLICY IF EXISTS "own files update" ON storage.objects;
DROP POLICY IF EXISTS "own files delete" ON storage.objects;

CREATE POLICY "own files read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('study-materials','payment-proofs')
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));
CREATE POLICY "own files insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('study-materials','payment-proofs')
  AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('study-materials','payment-proofs')
  AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id IN ('study-materials','payment-proofs')
  AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('study-materials','payment-proofs')
  AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.admin_audit_logs (admin_id, target_user_id, action, metadata)
  VALUES (_uid, _uid, 'claim_first_admin', '{}'::jsonb);
  RETURN true;
END; $$;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;