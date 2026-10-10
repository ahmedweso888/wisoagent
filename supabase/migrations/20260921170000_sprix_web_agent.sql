-- WISO SPRIX Web Agent
-- Completely isolated from the WISO question-generation/question-bank systems.

CREATE TYPE public.sprix_answer_verification_status AS ENUM ('unresolved', 'ai_suggested', 'verified', 'rejected');
CREATE TYPE public.sprix_run_status AS ENUM ('queued', 'running', 'paused', 'completed', 'failed', 'needs_review', 'cancelled');

CREATE TABLE public.sprix_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_ciphertext TEXT NOT NULL,
  encryption_version SMALLINT NOT NULL DEFAULT 1 CHECK (encryption_version > 0),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sprix_credentials_user ON public.sprix_credentials(user_id);

ALTER TABLE public.sprix_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sprix_credentials FROM anon, authenticated;
GRANT ALL ON public.sprix_credentials TO service_role;

CREATE TRIGGER trg_sprix_credentials_updated
BEFORE UPDATE ON public.sprix_credentials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sprix_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL DEFAULT 'sprix' CHECK (platform = 'sprix'),
  subject TEXT NOT NULL,
  question_text TEXT NOT NULL,
  normalized_question_text TEXT NOT NULL,
  question_fingerprint TEXT NOT NULL,
  options JSONB NOT NULL CHECK (jsonb_typeof(options) = 'array'),
  correct_option_text TEXT,
  verification_status public.sprix_answer_verification_status NOT NULL DEFAULT 'unresolved',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, subject, question_fingerprint)
);

CREATE INDEX idx_sprix_questions_lookup ON public.sprix_questions(platform, subject, normalized_question_text);
CREATE INDEX idx_sprix_questions_status ON public.sprix_questions(verification_status, updated_at DESC);
CREATE INDEX idx_sprix_questions_verified ON public.sprix_questions(platform, subject) WHERE verification_status = 'verified';

ALTER TABLE public.sprix_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sprix_questions FROM anon, authenticated;
GRANT ALL ON public.sprix_questions TO service_role;

CREATE TRIGGER trg_sprix_questions_updated
BEFORE UPDATE ON public.sprix_questions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sprix_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id UUID REFERENCES public.sprix_credentials(id) ON DELETE SET NULL,
  platform TEXT NOT NULL DEFAULT 'sprix' CHECK (platform = 'sprix'),
  subject TEXT NOT NULL DEFAULT 'الثقافة المالية',
  status public.sprix_run_status NOT NULL DEFAULT 'queued',
  current_question_id UUID REFERENCES public.sprix_questions(id) ON DELETE SET NULL,
  current_question_fingerprint TEXT,
  questions_processed INTEGER NOT NULL DEFAULT 0 CHECK (questions_processed >= 0),
  questions_completed INTEGER NOT NULL DEFAULT 0 CHECK (questions_completed >= 0),
  unresolved_questions INTEGER NOT NULL DEFAULT 0 CHECK (unresolved_questions >= 0),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  worker_lease_until TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  error_code TEXT,
  error_message_safe TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sprix_runs_user_created ON public.sprix_agent_runs(user_id, created_at DESC);
CREATE INDEX idx_sprix_runs_queue ON public.sprix_agent_runs(status, worker_lease_until, created_at);
CREATE INDEX idx_sprix_runs_activity ON public.sprix_agent_runs(status, last_activity_at DESC);

ALTER TABLE public.sprix_agent_runs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.sprix_agent_runs TO authenticated;
GRANT ALL ON public.sprix_agent_runs TO service_role;
CREATE POLICY "students can read their own SPRIX runs"
  ON public.sprix_agent_runs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_sprix_agent_runs_updated
BEFORE UPDATE ON public.sprix_agent_runs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sprix_agent_run_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.sprix_agent_runs(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.sprix_questions(id) ON DELETE SET NULL,
  question_fingerprint TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('detected', 'submitted', 'completed', 'unresolved', 'failed')),
  selected_option_text TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (run_id, question_fingerprint)
);

CREATE INDEX idx_sprix_run_items_run ON public.sprix_agent_run_items(run_id, detected_at);
CREATE INDEX idx_sprix_run_items_question ON public.sprix_agent_run_items(question_id);

ALTER TABLE public.sprix_agent_run_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.sprix_agent_run_items TO authenticated;
GRANT ALL ON public.sprix_agent_run_items TO service_role;
CREATE POLICY "students can read their own SPRIX run items"
  ON public.sprix_agent_run_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sprix_agent_runs r
    WHERE r.id = run_id AND r.user_id = auth.uid()
  ));

-- Atomically claim one queued/recoverable job. No credentials are returned.
CREATE OR REPLACE FUNCTION public.claim_next_sprix_agent_run(_lease_seconds INTEGER DEFAULT 1500)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _run_id UUID;
BEGIN
  IF _lease_seconds < 60 OR _lease_seconds > 7200 THEN
    RAISE EXCEPTION 'invalid_lease_seconds';
  END IF;

  UPDATE public.sprix_agent_runs
  SET status = 'queued', worker_lease_until = NULL
  WHERE status = 'running'
    AND worker_lease_until IS NOT NULL
    AND worker_lease_until < now();

  SELECT id INTO _run_id
  FROM public.sprix_agent_runs
  WHERE status = 'queued'
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF _run_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.sprix_agent_runs
  SET status = 'running',
      attempt_count = attempt_count + 1,
      worker_lease_until = now() + make_interval(secs => _lease_seconds),
      started_at = COALESCE(started_at, now()),
      last_activity_at = now(),
      error_code = NULL,
      error_message_safe = NULL
  WHERE id = _run_id;

  RETURN _run_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_next_sprix_agent_run(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_next_sprix_agent_run(INTEGER) TO service_role;

COMMENT ON TABLE public.sprix_credentials IS 'Encrypted SPRIX credentials. Never expose through browser queries; server-only service role access.';
COMMENT ON TABLE public.sprix_questions IS 'Independent standardized SPRIX answer bank; unrelated to the WISO question bank.';
COMMENT ON TABLE public.sprix_agent_runs IS 'Durable execution state for the independent SPRIX web agent.';
