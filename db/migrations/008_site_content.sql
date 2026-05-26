-- CMS: tables for managing public page content
CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  section    TEXT        NOT NULL,
  key        TEXT        NOT NULL,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (section, key)
);

CREATE TABLE IF NOT EXISTS site_blocks (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  section     TEXT        NOT NULL,
  title       TEXT,
  subtitle    TEXT,
  description TEXT,
  image_url   TEXT,
  image_alt   TEXT,
  extra       JSONB       NOT NULL DEFAULT '{}',
  order_index INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_blocks_section_idx
  ON site_blocks (section, is_active, order_index);

CREATE OR REPLACE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER set_site_blocks_updated_at
  BEFORE UPDATE ON site_blocks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
