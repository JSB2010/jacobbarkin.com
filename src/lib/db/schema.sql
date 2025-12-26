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
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  event_type TEXT DEFAULT 'view',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create index for embed analytics
CREATE INDEX IF NOT EXISTS idx_embed_created_at ON embed_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embed_page_url ON embed_analytics(page_url);

