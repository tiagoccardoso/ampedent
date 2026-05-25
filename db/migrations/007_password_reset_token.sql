-- Add reset token columns to user table for password recovery
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;
