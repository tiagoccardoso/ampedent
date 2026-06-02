-- Migration 009: Subscription and trial support
-- Adds trial/subscription columns to "user" table. Idempotent.

ALTER TABLE public."user"
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_plan text
    CHECK (subscription_plan IN ('monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS subscription_status text
    CHECK (subscription_status IN ('active', 'canceled', 'expired')),
  ADD COLUMN IF NOT EXISTS subscription_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;

-- Backfill: existing users get trial_started_at = created_at
UPDATE public."user"
SET trial_started_at = created_at
WHERE trial_started_at IS NULL;

-- New users will get trial_started_at = NOW() automatically
ALTER TABLE public."user"
  ALTER COLUMN trial_started_at SET DEFAULT NOW();
