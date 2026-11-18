-- Initial database schema for OmniDev website
-- Run with: supabase migration up

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Site content (singleton values for CMS)
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Release notes (from GitHub + Admin CMS)
CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  tag_name TEXT UNIQUE,
  source TEXT NOT NULL DEFAULT 'cms',
  published_at TIMESTAMPTZ,
  body TEXT,
  html_url TEXT,
  assets JSONB DEFAULT '[]',
  is_prerelease BOOLEAN DEFAULT FALSE,
  is_latest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_releases_published_at ON releases (published_at DESC);
CREATE INDEX idx_releases_is_latest ON releases (is_latest) WHERE is_latest = TRUE;

-- Roadmap items
CREATE TABLE roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_roadmap_status ON roadmap_items (status);
CREATE INDEX idx_roadmap_display_order ON roadmap_items (display_order, created_at DESC);

-- Feedback submissions (public)
CREATE TABLE feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('Bug Report', 'Feature Request', 'General Feedback')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'in-progress', 'closed')),
  github_issue_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_status ON feedback_submissions (status);
CREATE INDEX idx_feedback_created_at ON feedback_submissions (created_at DESC);

-- Security reports (private, admin only)
CREATE TABLE security_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  details TEXT NOT NULL,
  reporter_email TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_security_status ON security_reports (status);
CREATE INDEX idx_security_created_at ON security_reports (created_at DESC);

-- Admin users (via Supabase Auth, but we track roles)
CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_items_updated_at
  BEFORE UPDATE ON roadmap_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();