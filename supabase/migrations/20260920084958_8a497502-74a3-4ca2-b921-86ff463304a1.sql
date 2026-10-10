-- Cleanup of legacy Lovable AI/subscription model-selection architecture.
-- Non-destructive: no production table, policy, bucket or row is dropped.

-- 1. Legacy plan-level model selection enum (Model A / Model B). Guarded:
--    it does not exist in the current WISO database.
DROP TYPE IF EXISTS public.plan_ai_model;

-- 2. WISO uses exactly one AI foundation: the GPT-5.6 family behind the
--    server-side gateway. Normalise any legacy value first, then tighten.
UPDATE public.ai_settings
   SET provider = 'openai',
       model = CASE
         WHEN model IN ('openai/gpt-5.6-luna','openai/gpt-5.6-terra','openai/gpt-5.6-sol')
           THEN model
         ELSE 'openai/gpt-5.6-sol'
       END,
       fallback_enabled = false,
       fallback_provider = NULL,
       updated_at = now()
 WHERE provider <> 'openai'
    OR model NOT IN ('openai/gpt-5.6-luna','openai/gpt-5.6-terra','openai/gpt-5.6-sol')
    OR fallback_provider IS NOT NULL;

ALTER TABLE public.ai_settings DROP CONSTRAINT IF EXISTS ai_settings_provider_check;
ALTER TABLE public.ai_settings DROP CONSTRAINT IF EXISTS ai_settings_fallback_provider_check;
ALTER TABLE public.ai_settings DROP CONSTRAINT IF EXISTS ai_settings_model_check;

ALTER TABLE public.ai_settings
  ADD CONSTRAINT ai_settings_provider_check CHECK (provider = 'openai'),
  ADD CONSTRAINT ai_settings_fallback_provider_check CHECK (fallback_provider IS NULL OR fallback_provider = 'openai'),
  ADD CONSTRAINT ai_settings_model_check CHECK (
    model IN ('openai/gpt-5.6-luna','openai/gpt-5.6-terra','openai/gpt-5.6-sol')
  );

ALTER TABLE public.ai_settings ALTER COLUMN provider SET DEFAULT 'openai';
ALTER TABLE public.ai_settings ALTER COLUMN model SET DEFAULT 'openai/gpt-5.6-sol';

-- 3. Guarantee the singleton settings row exists.
INSERT INTO public.ai_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;