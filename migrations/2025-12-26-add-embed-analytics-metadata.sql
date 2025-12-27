-- Add richer metadata for embed analytics tracking
ALTER TABLE embed_analytics ADD COLUMN page_host TEXT;
ALTER TABLE embed_analytics ADD COLUMN page_path TEXT;
ALTER TABLE embed_analytics ADD COLUMN page_title TEXT;
ALTER TABLE embed_analytics ADD COLUMN referrer_host TEXT;
ALTER TABLE embed_analytics ADD COLUMN utm_source TEXT;
ALTER TABLE embed_analytics ADD COLUMN utm_medium TEXT;
ALTER TABLE embed_analytics ADD COLUMN utm_campaign TEXT;
ALTER TABLE embed_analytics ADD COLUMN utm_term TEXT;
ALTER TABLE embed_analytics ADD COLUMN utm_content TEXT;
ALTER TABLE embed_analytics ADD COLUMN embed_version TEXT;
ALTER TABLE embed_analytics ADD COLUMN embed_variant TEXT;
ALTER TABLE embed_analytics ADD COLUMN embed_size TEXT;
ALTER TABLE embed_analytics ADD COLUMN embed_theme TEXT;
ALTER TABLE embed_analytics ADD COLUMN embed_position TEXT;
ALTER TABLE embed_analytics ADD COLUMN embed_align TEXT;
ALTER TABLE embed_analytics ADD COLUMN embed_instance_id TEXT;
ALTER TABLE embed_analytics ADD COLUMN is_auto INTEGER DEFAULT 0;
ALTER TABLE embed_analytics ADD COLUMN language TEXT;
ALTER TABLE embed_analytics ADD COLUMN timezone_offset INTEGER;
ALTER TABLE embed_analytics ADD COLUMN viewport_width INTEGER;
ALTER TABLE embed_analytics ADD COLUMN viewport_height INTEGER;
ALTER TABLE embed_analytics ADD COLUMN device_type TEXT;
ALTER TABLE embed_analytics ADD COLUMN connection_type TEXT;

CREATE INDEX IF NOT EXISTS idx_embed_page_host ON embed_analytics(page_host);
CREATE INDEX IF NOT EXISTS idx_embed_event_type ON embed_analytics(event_type);

-- Normalize legacy event type
UPDATE embed_analytics
SET event_type = 'impression'
WHERE event_type = 'view';

-- Backfill page_host and page_path where possible
UPDATE embed_analytics
SET page_host = CASE
  WHEN page_url LIKE 'http%' THEN
    substr(
      page_url,
      instr(page_url, '://') + 3,
      CASE
        WHEN instr(substr(page_url, instr(page_url, '://') + 3), '/') = 0
          THEN length(substr(page_url, instr(page_url, '://') + 3))
        ELSE instr(substr(page_url, instr(page_url, '://') + 3), '/') - 1
      END
    )
  ELSE NULL
END,
page_path = CASE
  WHEN page_url LIKE 'http%' THEN
    CASE
      WHEN instr(substr(page_url, instr(page_url, '://') + 3), '/') = 0
        THEN '/'
      ELSE substr(
        page_url,
        instr(page_url, '://') + 3 + instr(substr(page_url, instr(page_url, '://') + 3), '/')
      )
    END
  ELSE NULL
END
WHERE page_url IS NOT NULL AND (page_host IS NULL OR page_path IS NULL);

-- Backfill referrer_host where possible
UPDATE embed_analytics
SET referrer_host = CASE
  WHEN referrer LIKE 'http%' THEN
    substr(
      referrer,
      instr(referrer, '://') + 3,
      CASE
        WHEN instr(substr(referrer, instr(referrer, '://') + 3), '/') = 0
          THEN length(substr(referrer, instr(referrer, '://') + 3))
        ELSE instr(substr(referrer, instr(referrer, '://') + 3), '/') - 1
      END
    )
  ELSE NULL
END
WHERE referrer IS NOT NULL AND referrer_host IS NULL;
