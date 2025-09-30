-- Migration: Add service area tables
-- Description: Introduces reference data for NZ service areas and tradie selections
-- Notes: Populate service_areas via scripts/import-service-areas.ts after running this migration

-- Ensure pgcrypto is available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reference table for service areas (city + suburb)
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL DEFAULT 'New Zealand',
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep city + area unique to avoid duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_areas_city_area ON service_areas (city, area);
CREATE INDEX IF NOT EXISTS idx_service_areas_city ON service_areas (city);

-- Trigger to maintain updated_at on changes
CREATE OR REPLACE FUNCTION set_service_areas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_areas_updated_at ON service_areas;
CREATE TRIGGER trg_service_areas_updated_at
  BEFORE UPDATE ON service_areas
  FOR EACH ROW
  EXECUTE FUNCTION set_service_areas_updated_at();

COMMENT ON TABLE service_areas IS 'Reference data of NZ cities and suburbs for tradie service coverage';
COMMENT ON COLUMN service_areas.city IS 'City or major urban area name (major_name)';
COMMENT ON COLUMN service_areas.area IS 'Suburb or locality name (name_ascii)';

-- Join table linking tradies to their service areas (multi-select)
CREATE TABLE IF NOT EXISTS tradie_service_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tradie_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_area_id UUID NOT NULL REFERENCES service_areas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tradie_service_areas_unique
  ON tradie_service_areas (tradie_id, service_area_id);

CREATE INDEX IF NOT EXISTS idx_tradie_service_areas_service_area
  ON tradie_service_areas (service_area_id);

COMMENT ON TABLE tradie_service_areas IS 'Maps tradie users to the suburbs they service';
COMMENT ON COLUMN tradie_service_areas.tradie_id IS 'References users.id for tradie role';
COMMENT ON COLUMN tradie_service_areas.service_area_id IS 'References service_areas.id';
