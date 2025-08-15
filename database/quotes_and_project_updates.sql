-- Migration: Create quotes table and update projects table for quoting functionality
-- Date: $(date '+%Y-%m-%d %H:%M:%S')
-- Description: Adds quotes table and updates projects table to support tradie quoting system

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tradie_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  description TEXT NOT NULL CHECK (length(description) > 0),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a tradie can only submit one quote per project
  UNIQUE(project_id, tradie_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tradie_id ON quotes(tradie_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);

-- Add accepted_quote_id column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS accepted_quote_id UUID REFERENCES quotes(id);

-- Update project status constraints to include new statuses
-- First, drop the existing constraint if it exists
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Add the new constraint with updated status values
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('draft', 'published', 'negotiating', 'in_progress', 'completed', 'reviewed', 'cancelled'));

-- Create trigger to update quotes.updated_at on changes
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_quotes_updated_at ON quotes;
CREATE TRIGGER trigger_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_quotes_updated_at();

-- Create function to automatically reject other quotes when one is accepted
CREATE OR REPLACE FUNCTION handle_quote_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    -- If a quote is being accepted
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- Reject all other quotes for the same project
        UPDATE quotes 
        SET status = 'rejected', updated_at = NOW()
        WHERE project_id = NEW.project_id 
          AND id != NEW.id 
          AND status = 'pending';
        
        -- Update project status to 'in_progress' and set accepted_quote_id
        UPDATE projects 
        SET status = 'in_progress', 
            accepted_quote_id = NEW.id
        WHERE id = NEW.project_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quote acceptance
DROP TRIGGER IF EXISTS trigger_handle_quote_acceptance ON quotes;
CREATE TRIGGER trigger_handle_quote_acceptance
    AFTER UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION handle_quote_acceptance();

-- Create function to update project status when first quote is submitted
CREATE OR REPLACE FUNCTION handle_first_quote_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Update project status to 'negotiating' if it's currently 'published'
    UPDATE projects 
    SET status = 'negotiating'
    WHERE id = NEW.project_id 
      AND status = 'published';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for first quote submission
DROP TRIGGER IF EXISTS trigger_handle_first_quote_submission ON quotes;
CREATE TRIGGER trigger_handle_first_quote_submission
    AFTER INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION handle_first_quote_submission();

-- Add index for project accepted_quote_id
CREATE INDEX IF NOT EXISTS idx_projects_accepted_quote_id ON projects(accepted_quote_id);

-- Add comments for documentation
COMMENT ON TABLE quotes IS 'Stores quotes submitted by tradies for projects';
COMMENT ON COLUMN quotes.price IS 'Quote price in NZD';
COMMENT ON COLUMN quotes.description IS 'Detailed description of the quote and work to be done';
COMMENT ON COLUMN quotes.status IS 'Quote status: pending (default), accepted, or rejected';
COMMENT ON COLUMN projects.accepted_quote_id IS 'References the accepted quote for this project';

-- Grant necessary permissions (if using RLS)
-- Note: These would be adjusted based on your RLS policies
-- ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment and adjust as needed):
/*
-- Tradies can view and insert their own quotes
CREATE POLICY "Tradies can manage their own quotes" ON quotes
  FOR ALL USING (tradie_id = auth.uid());

-- Project owners can view quotes for their projects  
CREATE POLICY "Project owners can view quotes" ON quotes
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Project owners can update quote status (for accepting/rejecting)
CREATE POLICY "Project owners can update quote status" ON quotes
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
*/

-- Migration complete
-- Remember to run this migration on your Supabase database