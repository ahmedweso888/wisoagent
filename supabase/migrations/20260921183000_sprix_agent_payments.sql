-- WISO SPRIX Agent payments and access.
-- Independent from generic wallet/payment_requests and WISO question systems.

CREATE TABLE IF NOT EXISTS public.sprix_payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('vodafone_cash', 'instapay')),
  amount_egp NUMERIC(10,2) NOT NULL CHECK (amount_egp > 0),
  sender_number TEXT NOT NULL CHECK (char_length(sender_number) BETWEEN 8 AND 30),
  screenshot_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  reject_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sprix_payment_requests_user
  ON public.sprix_payment_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sprix_payment_requests_status
  ON public.sprix_payment_requests(status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sprix_one_pending_payment_per_user
  ON public.sprix_payment_requests(user_id)
  WHERE status = 'pending';

ALTER TABLE public.sprix_payment_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sprix_payment_requests FROM anon, authenticated;
GRANT SELECT ON public.sprix_payment_requests TO authenticated;
GRANT ALL ON public.sprix_payment_requests TO service_role;

DROP POLICY IF EXISTS "students read own SPRIX payments" ON public.sprix_payment_requests;
CREATE POLICY "students read own SPRIX payments"
  ON public.sprix_payment_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE TRIGGER trg_sprix_payment_requests_updated
BEFORE UPDATE ON public.sprix_payment_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.sprix_agent_access (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT false,
  payment_request_id UUID UNIQUE REFERENCES public.sprix_payment_requests(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sprix_agent_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sprix_agent_access FROM anon, authenticated;
GRANT SELECT ON public.sprix_agent_access TO authenticated;
GRANT ALL ON public.sprix_agent_access TO service_role;

DROP POLICY IF EXISTS "students read own SPRIX access" ON public.sprix_agent_access;
CREATE POLICY "students read own SPRIX access"
  ON public.sprix_agent_access
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE TRIGGER trg_sprix_agent_access_updated
BEFORE UPDATE ON public.sprix_agent_access
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.sprix_payment_requests IS
  'Dedicated payment requests for the WISO SPRIX Agent. Not the generic wallet payment system.';
COMMENT ON TABLE public.sprix_agent_access IS
  'Server-controlled entitlement for the independent WISO SPRIX Agent.';
