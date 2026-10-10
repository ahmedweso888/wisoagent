REVOKE EXECUTE ON FUNCTION public.contest_state() FROM anon;
GRANT SELECT ON public.contest_settings TO anon;
DROP POLICY IF EXISTS "contest settings public read" ON public.contest_settings;
CREATE POLICY "contest settings public read" ON public.contest_settings
  FOR SELECT TO anon USING (visible);