-- Admin authentication setup
-- Run after 002_rls_policies.sql

-- This migration sets up the initial admin user
-- Replace 'your-email@example.com' with your actual email

-- Note: The admin_users table references auth.users
-- You need to:
-- 1. Create a user in Supabase Auth (Dashboard → Authentication → Users → Add user)
-- 2. Copy the user's UUID
-- 3. Run this insert with the correct UUID

-- Example (run manually after creating auth user):
-- INSERT INTO admin_users (user_id, role)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Or use this function to promote a user to admin:
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT, user_role TEXT DEFAULT 'admin')
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  INSERT INTO admin_users (user_id, role)
  VALUES (target_user_id, user_role)
  ON CONFLICT (user_id) DO UPDATE SET role = user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage: SELECT promote_to_admin('your-email@example.com', 'admin');