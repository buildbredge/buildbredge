-- Migration: Add tradie hierarchy support (Simplified Version)
-- Date: 2025-01-19
-- Description: Adds parent_tradie_id field to users table to support tradie subordinate relationships

-- Add parent_tradie_id column to users table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'parent_tradie_id') THEN
        ALTER TABLE users ADD COLUMN parent_tradie_id UUID REFERENCES users(id);
    END IF;
END $$;

-- Create index for better query performance (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_parent_tradie_id') THEN
        CREATE INDEX idx_users_parent_tradie_id ON users(parent_tradie_id);
    END IF;
END $$;

-- Add constraint to prevent self-referencing (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'chk_no_self_parent') THEN
        ALTER TABLE users ADD CONSTRAINT chk_no_self_parent 
          CHECK (parent_tradie_id != id);
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN users.parent_tradie_id IS 'References the parent tradie ID for subordinate relationships';

-- Migration complete
-- Note: This simplified version only adds the column and constraints
-- The API will handle queries using standard SQL rather than stored functions