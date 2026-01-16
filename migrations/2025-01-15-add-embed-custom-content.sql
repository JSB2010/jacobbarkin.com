-- Embed Custom Content Table
-- This table stores custom HTML content to replace the entire page when the embed is loaded on specific domains/URLs

CREATE TABLE IF NOT EXISTS embed_custom_content (
  id TEXT PRIMARY KEY,
  url_pattern TEXT NOT NULL,
  match_type TEXT DEFAULT 'exact' CHECK(match_type IN ('exact', 'domain', 'regex')),
  content_html TEXT NOT NULL,
  preset_type TEXT,
  custom_text TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_embed_custom_content_active ON embed_custom_content(is_active);
CREATE INDEX IF NOT EXISTS idx_embed_custom_content_url_pattern ON embed_custom_content(url_pattern);
