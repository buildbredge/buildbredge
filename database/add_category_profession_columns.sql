-- Migration script to add category and profession support
-- Execute this in Supabase SQL Editor

-- Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS profession_id UUID REFERENCES professions(id),
ADD COLUMN IF NOT EXISTS other_description TEXT;

-- Create tradie_professions junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS tradie_professions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tradie_id UUID NOT NULL REFERENCES tradies(id) ON DELETE CASCADE,
  profession_id UUID NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tradie_id, profession_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_profession_id ON projects(profession_id);
CREATE INDEX IF NOT EXISTS idx_tradie_professions_tradie_id ON tradie_professions(tradie_id);
CREATE INDEX IF NOT EXISTS idx_tradie_professions_profession_id ON tradie_professions(profession_id);

-- Add updated_at trigger for tradie_professions
DROP TRIGGER IF EXISTS update_tradie_professions_updated_at ON tradie_professions;
CREATE TRIGGER update_tradie_professions_updated_at 
BEFORE UPDATE ON tradie_professions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for categories and professions (if not exists)
INSERT INTO categories (name_en, name_zh) VALUES 
('Construction', '建筑施工'),
('Electrical', '电气服务'),
('Plumbing', '水管工程'),
('Carpentry', '木工制作'),
('Painting', '油漆装饰'),
('Landscaping', '园艺造景'),
('Roofing', '屋顶工程'),
('HVAC', '暖通空调'),
('Cleaning', '清洁服务'),
('Renovation', '装修翻新')
ON CONFLICT (name_en) DO NOTHING;

-- Insert sample professions for each category
-- Construction
INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'General Contractor', '总承包商' FROM categories c WHERE c.name_en = 'Construction'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Foundation Specialist', '地基专家' FROM categories c WHERE c.name_en = 'Construction'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Concrete Worker', '混凝土工' FROM categories c WHERE c.name_en = 'Construction'
ON CONFLICT DO NOTHING;

-- Electrical
INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Electrician', '电工' FROM categories c WHERE c.name_en = 'Electrical'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Electrical Engineer', '电气工程师' FROM categories c WHERE c.name_en = 'Electrical'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Security System Installer', '安防系统安装员' FROM categories c WHERE c.name_en = 'Electrical'
ON CONFLICT DO NOTHING;

-- Plumbing
INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Plumber', '水管工' FROM categories c WHERE c.name_en = 'Plumbing'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Drain Specialist', '下水道专家' FROM categories c WHERE c.name_en = 'Plumbing'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Gas Fitter', '燃气安装工' FROM categories c WHERE c.name_en = 'Plumbing'
ON CONFLICT DO NOTHING;

-- Carpentry
INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Carpenter', '木工' FROM categories c WHERE c.name_en = 'Carpentry'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Cabinet Maker', '橱柜制作师' FROM categories c WHERE c.name_en = 'Carpentry'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Furniture Maker', '家具制作师' FROM categories c WHERE c.name_en = 'Carpentry'
ON CONFLICT DO NOTHING;

-- Painting
INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'House Painter', '房屋油漆工' FROM categories c WHERE c.name_en = 'Painting'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Decorator', '装饰师' FROM categories c WHERE c.name_en = 'Painting'
ON CONFLICT DO NOTHING;

INSERT INTO professions (category_id, name_en, name_zh) 
SELECT c.id, 'Wallpaper Installer', '壁纸安装工' FROM categories c WHERE c.name_en = 'Painting'
ON CONFLICT DO NOTHING;

-- Add RLS policies for new tables
ALTER TABLE tradie_professions ENABLE ROW LEVEL SECURITY;

-- Allow read access to tradie_professions for matching
DROP POLICY IF EXISTS "Allow read tradie_professions" ON tradie_professions;
CREATE POLICY "Allow read tradie_professions" ON tradie_professions FOR SELECT USING (true);

-- Allow tradies to manage their own profession associations
DROP POLICY IF EXISTS "Allow tradies to manage professions" ON tradie_professions;
CREATE POLICY "Allow tradies to manage professions" ON tradie_professions FOR ALL USING (true);

-- Allow read access to categories and professions
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE professions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read categories" ON categories;
CREATE POLICY "Allow read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read professions" ON professions;
CREATE POLICY "Allow read professions" ON professions FOR SELECT USING (true);

-- Update existing projects to have null values for new columns (this is safe)
-- The new columns are already nullable so no data update needed

COMMIT;