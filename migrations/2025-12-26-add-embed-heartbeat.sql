-- Add heartbeat storage and rollup tables for embed presence tracking
CREATE TABLE IF NOT EXISTS embed_heartbeat (
  id TEXT PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_host TEXT,
  page_path TEXT,
  page_title TEXT,
  referrer TEXT,
  referrer_host TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  embed_version TEXT,
  embed_variant TEXT,
  embed_size TEXT,
  embed_theme TEXT,
  embed_position TEXT,
  embed_align TEXT,
  embed_instance_id TEXT,
  is_auto INTEGER DEFAULT 0,
  language TEXT,
  timezone_offset INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  device_type TEXT,
  connection_type TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS embed_sites (
  page_host TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  last_page_url TEXT,
  last_page_title TEXT,
  last_referrer TEXT,
  last_referrer_host TEXT,
  last_embed_version TEXT,
  last_embed_variant TEXT,
  last_embed_size TEXT,
  last_embed_theme TEXT,
  last_embed_position TEXT,
  last_embed_align TEXT,
  last_embed_instance_id TEXT,
  last_is_auto INTEGER DEFAULT 0,
  last_language TEXT,
  last_timezone_offset INTEGER,
  last_viewport_width INTEGER,
  last_viewport_height INTEGER,
  last_device_type TEXT,
  last_connection_type TEXT,
  heartbeat_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_embed_heartbeat_created_at ON embed_heartbeat(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embed_heartbeat_page_host ON embed_heartbeat(page_host);
CREATE INDEX IF NOT EXISTS idx_embed_sites_last_seen ON embed_sites(last_seen DESC);
