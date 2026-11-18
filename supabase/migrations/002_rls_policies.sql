-- Row Level Security policies for OmniDev website
-- Run after 001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC READ POLICIES
-- ============================================

-- Anyone can read site content
CREATE POLICY "Public read site content" ON site_content
  FOR SELECT USING (true);

-- Anyone can read releases
CREATE POLICY "Public read releases" ON releases
  FOR SELECT USING (true);

-- Anyone can read roadmap items
CREATE POLICY "Public read roadmap" ON roadmap_items
  FOR SELECT USING (true);

-- ============================================
-- PUBLIC INSERT POLICIES (no auth required)
-- ============================================

-- Anyone can submit feedback
CREATE POLICY "Public insert feedback" ON feedback_submissions
  FOR INSERT WITH CHECK (true);

-- Anyone can submit security reports
CREATE POLICY "Public insert security" ON security_reports
  FOR INSERT WITH CHECK (true);

-- ============================================
-- ADMIN FULL ACCESS POLICIES
-- ============================================

-- Helper function to check if user is admin
-- (Used in policies below)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin full access to site_content
CREATE POLICY "Admin full access site_content" ON site_content
  FOR ALL USING (is_admin_or_editor());

-- Admin full access to releases
CREATE POLICY "Admin full access releases" ON releases
  FOR ALL USING (is_admin_or_editor());

-- Admin full access to roadmap_items
CREATE POLICY "Admin full access roadmap" ON roadmap_items
  FOR ALL USING (is_admin_or_editor());

-- Admin can read feedback submissions
CREATE POLICY "Admin read feedback" ON feedback_submissions
  FOR SELECT USING (is_admin_or_editor());

-- Admin can update feedback status
CREATE POLICY "Admin update feedback" ON feedback_submissions
  FOR UPDATE USING (is_admin_or_editor());

-- Admin full access to security reports (admin role only)
CREATE POLICY "Admin full access security" ON security_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins manage admin_users (admin role only)
CREATE POLICY "Admin manage admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STORAGE POLICIES (for R2 bucket assets if used)
-- ============================================

-- Note: Storage policies are managed in Supabase Dashboard
-- For R2 bucket, configure CORS in Cloudflare Dashboard