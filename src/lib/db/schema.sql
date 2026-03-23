-- Cloudflare D1 Database Schema
-- Contact Form Submissions

CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'replied', 'archived')),
  priority INTEGER DEFAULT 1 CHECK(priority >= 1 AND priority <= 5),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'website_contact_form'
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON contact_submissions(email);

-- Embed Analytics Table
CREATE TABLE IF NOT EXISTS embed_analytics (
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
  user_agent TEXT,
  ip_address TEXT,
  event_type TEXT DEFAULT 'impression',
  embed_version TEXT,
  embed_variant TEXT,
  embed_size TEXT,
  embed_theme TEXT,
  embed_position TEXT,
  embed_align TEXT,
  embed_instance_id TEXT,
  is_auto INTEGER DEFAULT 0,
  installation_id TEXT,
  session_id TEXT,
  page_view_id TEXT,
  event_name TEXT,
  site_key TEXT,
  page_group TEXT,
  experiment_id TEXT,
  variant_key TEXT,
  rule_id TEXT,
  template_id TEXT,
  action_type TEXT,
  load_ms INTEGER,
  render_ms INTEGER,
  error_code TEXT,
  language TEXT,
  timezone_offset INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  device_type TEXT,
  connection_type TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create index for embed analytics
CREATE INDEX IF NOT EXISTS idx_embed_created_at ON embed_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embed_page_url ON embed_analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_embed_page_host ON embed_analytics(page_host);
CREATE INDEX IF NOT EXISTS idx_embed_event_type ON embed_analytics(event_type);

-- Embed Heartbeat Table
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
  installation_id TEXT,
  session_id TEXT,
  page_view_id TEXT,
  event_name TEXT,
  site_key TEXT,
  page_group TEXT,
  experiment_id TEXT,
  variant_key TEXT,
  rule_id TEXT,
  template_id TEXT,
  action_type TEXT,
  load_ms INTEGER,
  render_ms INTEGER,
  error_code TEXT,
  language TEXT,
  timezone_offset INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  device_type TEXT,
  connection_type TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Rollup table for heartbeat health
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

-- Embed vNext event store
CREATE TABLE IF NOT EXISTS embed_events (
  id TEXT PRIMARY KEY,
  installation_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_view_id TEXT NOT NULL,
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
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  embed_version TEXT,
  embed_variant TEXT,
  embed_size TEXT,
  embed_theme TEXT,
  embed_position TEXT,
  embed_align TEXT,
  embed_instance_id TEXT,
  is_auto INTEGER DEFAULT 0,
  site_key TEXT,
  page_group TEXT,
  experiment_id TEXT,
  variant_key TEXT,
  rule_id TEXT,
  template_id TEXT,
  action_type TEXT,
  error_code TEXT,
  load_ms INTEGER,
  render_ms INTEGER,
  device_type TEXT,
  language TEXT,
  timezone_offset INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  connection_type TEXT,
  session_fingerprint TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_embed_events_created_at ON embed_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embed_events_installation_id ON embed_events(installation_id);
CREATE INDEX IF NOT EXISTS idx_embed_events_event_name ON embed_events(event_name);
CREATE INDEX IF NOT EXISTS idx_embed_events_page_host ON embed_events(page_host);
CREATE INDEX IF NOT EXISTS idx_embed_events_session_id ON embed_events(session_id);
CREATE INDEX IF NOT EXISTS idx_embed_events_rule_id ON embed_events(rule_id);

CREATE TABLE IF NOT EXISTS embed_installations (
  installation_id TEXT PRIMARY KEY,
  site_key TEXT,
  page_host TEXT NOT NULL,
  label TEXT,
  environment TEXT DEFAULT 'prod' CHECK(environment IN ('prod', 'staging', 'dev')),
  notes TEXT,
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
  last_is_auto INTEGER DEFAULT 0,
  last_language TEXT,
  last_timezone_offset INTEGER,
  last_viewport_width INTEGER,
  last_viewport_height INTEGER,
  last_device_type TEXT,
  last_connection_type TEXT,
  last_session_id TEXT,
  event_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  heartbeat_count INTEGER DEFAULT 0,
  last_rule_id TEXT,
  last_template_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_embed_installations_last_seen ON embed_installations(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_embed_installations_page_host ON embed_installations(page_host);

CREATE TABLE IF NOT EXISTS embed_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  schema_json TEXT,
  render_mode TEXT DEFAULT 'unsafe_html' CHECK(render_mode IN ('system', 'structured', 'unsafe_html')),
  html_shell TEXT,
  css_theme TEXT,
  config_json TEXT,
  is_system INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_embed_templates_category ON embed_templates(category);

CREATE TABLE IF NOT EXISTS embed_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'preview', 'scheduled', 'active', 'paused', 'archived')),
  priority INTEGER DEFAULT 100,
  match_type TEXT DEFAULT 'conditions',
  conditions_json TEXT,
  action_type TEXT DEFAULT 'page_takeover' CHECK(action_type IN ('banner', 'inline_replace', 'page_takeover', 'redirect', 'credit_variant_override')),
  template_id TEXT,
  unsafe_html TEXT,
  config_json TEXT,
  rollout_percent INTEGER DEFAULT 100,
  start_at TEXT,
  end_at TEXT,
  notes TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_embed_rules_status_priority ON embed_rules(status, priority);

CREATE TABLE IF NOT EXISTS embed_daily_metrics (
  metric_date TEXT NOT NULL,
  installation_id TEXT NOT NULL,
  page_host TEXT NOT NULL DEFAULT '',
  page_group TEXT NOT NULL DEFAULT '',
  embed_variant TEXT NOT NULL DEFAULT '',
  embed_version TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT '',
  is_auto INTEGER NOT NULL DEFAULT 0,
  rule_id TEXT NOT NULL DEFAULT '',
  template_id TEXT NOT NULL DEFAULT '',
  experiment_id TEXT NOT NULL DEFAULT '',
  variant_key TEXT NOT NULL DEFAULT '',
  loads INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  heartbeats INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  replacement_applied INTEGER DEFAULT 0,
  replacement_skipped INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (
    metric_date,
    installation_id,
    page_host,
    page_group,
    embed_variant,
    embed_version,
    device_type,
    is_auto,
    rule_id,
    template_id,
    experiment_id,
    variant_key
  )
);

CREATE INDEX IF NOT EXISTS idx_embed_daily_metrics_date ON embed_daily_metrics(metric_date DESC);

-- Embed Custom Content Table
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

CREATE INDEX IF NOT EXISTS idx_embed_custom_content_active ON embed_custom_content(is_active);
CREATE INDEX IF NOT EXISTS idx_embed_custom_content_url_pattern ON embed_custom_content(url_pattern);
