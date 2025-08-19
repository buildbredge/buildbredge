-- Migration: Add tradie hierarchy support
-- Date: 2025-01-19
-- Description: Adds parent_tradie_id field to users table to support tradie subordinate relationships

-- Add parent_tradie_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_tradie_id UUID REFERENCES users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_parent_tradie_id ON users(parent_tradie_id);

-- Add constraint to prevent self-referencing and circular relationships
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_no_self_parent 
  CHECK (parent_tradie_id != id);

-- Create function to get all subordinate tradies for a parent
CREATE OR REPLACE FUNCTION get_subordinate_tradies(parent_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  specialty TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  rating NUMERIC,
  review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.company,
    u.specialty,
    u.status,
    u.created_at,
    u.rating,
    u.review_count
  FROM users u
  INNER JOIN user_roles ur ON u.id = ur.user_id
  WHERE u.parent_tradie_id = parent_id
    AND ur.role_type = 'tradie'
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get parent tradie information
CREATE OR REPLACE FUNCTION get_parent_tradie(child_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  company TEXT,
  specialty TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.company,
    p.specialty
  FROM users u
  INNER JOIN users p ON u.parent_tradie_id = p.id
  INNER JOIN user_roles ur ON p.id = ur.user_id
  WHERE u.id = child_id
    AND ur.role_type = 'tradie';
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON COLUMN users.parent_tradie_id IS 'References the parent tradie ID for subordinate relationships';
COMMENT ON FUNCTION get_subordinate_tradies(UUID) IS 'Returns all subordinate tradies for a given parent tradie';
COMMENT ON FUNCTION get_parent_tradie(UUID) IS 'Returns parent tradie information for a given child tradie';

-- Migration complete
-- Remember to run this migration on your Supabase database