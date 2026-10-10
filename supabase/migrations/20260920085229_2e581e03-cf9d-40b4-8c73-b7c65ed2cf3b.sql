-- Backfill two columns that exist in the live WISO database but were never
-- represented in the migration chain, so a from-zero replay produces the exact
-- same schema. Both are IF NOT EXISTS: no-ops against the live database.
ALTER TABLE public.ai_credit_reservations
  ADD COLUMN IF NOT EXISTS committed_amount INTEGER;

ALTER TABLE public.ai_settings
  ADD COLUMN IF NOT EXISTS auto_routing_enabled BOOLEAN NOT NULL DEFAULT true;