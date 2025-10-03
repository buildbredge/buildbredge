-- Migration: add service_area_id column to projects
-- Purpose: link projects to normalized service areas for tradie recommendations

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS service_area_id UUID REFERENCES service_areas(id);

CREATE INDEX IF NOT EXISTS idx_projects_service_area_id ON projects(service_area_id);

COMMENT ON COLUMN projects.service_area_id IS 'References the matched service area for this project';
