/*
# WISO AI Engine — Tier Tracking & Atomic Quota Reservation

## Purpose
Adds intelligence-tier tracking and race-safe quota reservation to the existing
AI usage logging system. No existing columns are dropped or renamed; all changes
are additive and backwards-compatible.

## Changes

### 1. `ai_usage_logs` — new columns
- `tier` (text, nullable): which WISO intelligence tier served the request
  ('luna' | 'terra' | 'sol'). Nullable so existing rows remain valid.
- `request_id` (text, nullable): correlation ID for tracing a single user
  request across multiple AI calls (batch, retry, escalation).
- `questions_approved` (integer, default 0): how many questions passed
  validation and dedup in this request.
- `questions_rejected` (integer, default 0): how many were discarded.
- `retries` (integer, default 0): number of Terra retries for this request.
- `escalations` (integer, default 0): number of Sol escalations for this request.
- `input_tokens` (integer, nullable): prompt tokens if the provider reports them.
- `output_tokens` (integer, nullable): completion tokens if the provider reports them.

### 2. `ai_credit_reservations` — new table
Atomic, race-safe credit reservation ledger. Each row represents a hold on
quota before an AI call. Status transitions: reserved → committed | released.

- `id` (uuid PK)
- `user_id` (uuid, references auth.users)
- `request_id` (text): correlation ID
- `resource_type` (text): 'questions' | 'images' | 'pdfs' | 'documents'
- `amount` (integer): how many units reserved
- `status` (text): 'reserved' | 'committed' | 'released'
- `created_at`, `updated_at` (timestamptz)
- `committed_at`, `released_at` (timestamptz, nullable)

### 3-5. Credit reservation / commit / release
Originally defined here on the deprecated Lovable `student_subscriptions`
plan-limit architecture; removed in the legacy-migration cleanup. The current
WISO wallet-based `reserve_ai_credits` / `commit_ai_credits` /
`release_ai_credits` (student_wallets + wallet_ledger) are defined in
20260911013941, 20260915115614 and 20260918015108.

### 6. Indexes
- `idx_ai_usage_tier_day` on ai_usage_logs(user_id, tier, created_at)
- `idx_ai_usage_request` on ai_usage_logs(request_id)
- `idx_credit_res_user_status` on ai_credit_reservations(user_id, status)
- `idx_credit_res_user_day` on ai_credit_reservations(user_id, created_at)

## Security
- RLS enabled on `ai_credit_reservations`.
- Owner-scoped SELECT/INSERT policies (authenticated, auth.uid() = user_id).
- No direct INSERT/UPDATE allowed from the client — all mutations go through
  the SECURITY DEFINER functions which use auth.uid() internally.
- All functions REVOKE FROM PUBLIC/anon, GRANT TO authenticated only.
*/

-- ═══════════════════════════════════════════
-- 1. Extend ai_usage_logs
-- ═══════════════════════════════════════════

ALTER TABLE public.ai_usage_logs
  ADD COLUMN IF NOT EXISTS tier text;

ALTER TABLE public.ai_usage_logs
  ADD COLUMN IF NOT EXISTS request_id text;

ALTER TABLE public.ai_usage_logs
  ADD COLUMN IF NOT EXISTS questions_approved integer NOT NULL DEFAULT 0;

ALTER TABLE public.ai_usage_logs
  ADD COLUMN IF NOT EXISTS questions_rejected integer NOT NULL DEFAULT 0;

ALTER TABLE public.ai_usage_logs
  ADD COLUMN IF NOT EXISTS retries integer NOT NULL DEFAULT 0;

ALTER TABLE public.ai_usage_logs
  ADD COLUMN IF NOT EXISTS escalations integer NOT NULL DEFAULT 0;

ALTER TABLE public.ai_usage_logs
  ADD COLUMN IF NOT EXISTS input_tokens integer;

ALTER TABLE public.ai_usage_logs
  ADD COLUMN IF NOT EXISTS output_tokens integer;

CREATE INDEX IF NOT EXISTS idx_ai_usage_tier_day
  ON public.ai_usage_logs (user_id, tier, created_at);

CREATE INDEX IF NOT EXISTS idx_ai_usage_request
  ON public.ai_usage_logs (request_id);

-- ═══════════════════════════════════════════
-- 2. Credit reservation ledger
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_credit_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('questions','images','pdfs','documents')),
  amount integer NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','committed','released')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  committed_at timestamptz,
  released_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_credit_res_user_status
  ON public.ai_credit_reservations (user_id, status);

CREATE INDEX IF NOT EXISTS idx_credit_res_user_day
  ON public.ai_credit_reservations (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_credit_res_request
  ON public.ai_credit_reservations (request_id);

ALTER TABLE public.ai_credit_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_res_read_own" ON public.ai_credit_reservations;
CREATE POLICY "credit_res_read_own" ON public.ai_credit_reservations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- No direct INSERT/UPDATE/DELETE policies — all mutations via SECURITY DEFINER functions

-- ═══════════════════════════════════════════
-- 3-5. Credit reservation / commit / release
-- ═══════════════════════════════════════════
-- Removed during the legacy-migration cleanup: the original definitions here
-- were built on the deprecated Lovable `student_subscriptions` architecture
-- (plan-level daily limits). The current WISO wallet-based implementations
-- (reserve/commit/release against student_wallets + wallet_ledger) are defined
-- in 20260911013941, 20260915115614 and 20260918015108.


-- ═══════════════════════════════════════════
-- 6. Admin: tier usage stats
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.admin_ai_tier_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _r FROM (
    SELECT
      tier,
      status,
      count(*) AS request_count,
      sum(tokens_used) AS total_tokens,
      sum(questions_generated) AS total_questions_generated,
      sum(questions_approved) AS total_questions_approved,
      sum(questions_rejected) AS total_questions_rejected,
      sum(retries) AS total_retries,
      sum(escalations) AS total_escalations,
      round(avg(latency_ms)) AS avg_latency_ms
    FROM public.ai_usage_logs
    WHERE created_at >= now() - interval '30 days'
    GROUP BY tier, status
    ORDER BY tier, status
  ) t;

  RETURN _r;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_ai_tier_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_ai_tier_stats() TO authenticated;
