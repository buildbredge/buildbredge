-- BuildBridge数据库模式 - 增强版本
-- 在Supabase控制台的SQL编辑器中执行此脚本

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建项目表（增加坐标字段）
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  detailed_description TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  images TEXT[] DEFAULT '{}',
  video TEXT,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'draft', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL
);

-- 创建业主表（增加坐标字段）
CREATE TABLE IF NOT EXISTS owners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'closed')),
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建技师表（增加坐标字段）
CREATE TABLE IF NOT EXISTS tradies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  company VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  service_radius INTEGER DEFAULT 50, -- 服务半径（公里）
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'closed')),
  balance DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0, -- 平均评分
  review_count INTEGER DEFAULT 0, -- 评论数量
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  tradie_id UUID NOT NULL REFERENCES tradies(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  video TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. 创建分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(100) NOT NULL,
  name_zh VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建职业表
CREATE TABLE professions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name_en VARCHAR(100) NOT NULL,
  name_zh VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);
CREATE INDEX IF NOT EXISTS idx_projects_coordinates ON projects(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_owners_status ON owners(status);
CREATE INDEX IF NOT EXISTS idx_owners_email ON owners(email);
CREATE INDEX IF NOT EXISTS idx_owners_coordinates ON owners(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tradies_status ON tradies(status);
CREATE INDEX IF NOT EXISTS idx_tradies_email ON tradies(email);
CREATE INDEX IF NOT EXISTS idx_tradies_specialty ON tradies(specialty);
CREATE INDEX IF NOT EXISTS idx_tradies_rating ON tradies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tradies_coordinates ON tradies(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_tradie_id ON reviews(tradie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_owner_id ON reviews(owner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_owners_updated_at ON owners;
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tradies_updated_at ON tradies;
CREATE TRIGGER update_tradies_updated_at BEFORE UPDATE ON tradies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建函数：更新技师平均评分
CREATE OR REPLACE FUNCTION update_tradie_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE tradies
        SET
            rating = (
                SELECT COALESCE(AVG(rating::DECIMAL), 0)
                FROM reviews
                WHERE tradie_id = NEW.tradie_id AND is_approved = true
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE tradie_id = NEW.tradie_id AND is_approved = true
            )
        WHERE id = NEW.tradie_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tradies
        SET
            rating = (
                SELECT COALESCE(AVG(rating::DECIMAL), 0)
                FROM reviews
                WHERE tradie_id = OLD.tradie_id AND is_approved = true
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE tradie_id = OLD.tradie_id AND is_approved = true
            )
        WHERE id = OLD.tradie_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建触发器：当评论变化时自动更新技师评分
DROP TRIGGER IF EXISTS trigger_update_tradie_rating ON reviews;
CREATE TRIGGER trigger_update_tradie_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_tradie_rating();

-- 创建函数：计算两点间距离（公里）
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    -- 使用Haversine公式计算地球上两点间的距离
    RETURN (
        6371 * acos(
            cos(radians(lat1)) *
            cos(radians(lat2)) *
            cos(radians(lon2) - radians(lon1)) +
            sin(radians(lat1)) *
            sin(radians(lat2))
        )
    );
END;
$$ language 'plpgsql';

-- 插入示例数据（包含坐标）
INSERT INTO owners (name, phone, email, status, balance, latitude, longitude, address) VALUES
('张女士', '+64-21-123456', 'zhang@buildbridge.nz', 'approved', 1000.00, -36.8485, 174.7633, '奥克兰CBD'),
('李先生', '+1-647-234567', 'li@buildbridge.nz', 'pending', 0.00, 43.6532, -79.3832, '多伦多市中心'),
('王女士', '+61-4-345678', 'wang@buildbridge.nz', 'approved', 500.00, -33.8688, 151.2093, '悉尼市中心')
ON CONFLICT (email) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    address = EXCLUDED.address;

INSERT INTO tradies (name, phone, email, company, specialty, status, balance, latitude, longitude, address, service_radius) VALUES
('张师傅', '+64-21-789012', 'zhang.electrician@buildbridge.nz', '奥克兰专业电气公司', '电气服务', 'approved', 2500.00, -36.8509, 174.7645, '奥克兰Ponsonby', 30),
('王师傅', '+64-21-890123', 'wang.plumber@buildbridge.nz', '个人服务', '水管维修', 'approved', 1800.00, -36.8485, 174.7500, '奥克兰CBD', 25),
('李建筑队', '+64-9-234567', 'li.construction@buildbridge.nz', '李氏建筑有限公司', '建筑施工', 'pending', 0.00, -36.8600, 174.7800, '奥克兰Mount Eden', 50),
('陈师傅', '+1-416-345678', 'chen.painter@buildbridge.nz', '多伦多装修公司', '油漆装饰', 'approved', 1200.00, 43.6510, -79.3470, '多伦多East York', 20),
('刘师傅', '+61-2-456789', 'liu.carpenter@buildbridge.nz', '悉尼木工工作室', '木工制作', 'approved', 3000.00, -33.8650, 151.2094, '悉尼Darlinghurst', 35)
ON CONFLICT (email) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    address = EXCLUDED.address,
    service_radius = EXCLUDED.service_radius;

-- 插入示例项目（包含坐标）
INSERT INTO projects (description, location, detailed_description, email, phone, images, video, status, user_id, latitude, longitude) VALUES
('厨房水龙头更换', '新西兰-奥克兰-CBD', '需要更换厨房水龙头，现有的已经漏水。希望使用优质材料，工作需要在周末完成。', 'zhang@buildbridge.nz', '+64-21-123456', '{}', null, 'published', 'demo-user-1', -36.8485, 174.7633),
('客厅灯具安装', '新西兰-奥克兰-Ponsonby', '新买了一套客厅吊灯，需要专业电工安装。包括移除旧灯具和安装新的。', 'li@buildbridge.nz', '+1-647-234567', '{}', null, 'published', 'demo-user-2', -36.8509, 174.7645);

-- 插入示例评论数据
INSERT INTO reviews (project_id, owner_id, tradie_id, rating, comment, images, video)
SELECT
    p.id,
    o.id,
    t.id,
    5,
    '张师傅工作非常专业，准时到达，工作质量很高。强烈推荐！',
    '{}',
    null
FROM projects p, owners o, tradies t
WHERE p.email = 'zhang@buildbridge.nz'
  AND o.email = 'zhang@buildbridge.nz'
  AND t.email = 'zhang.electrician@buildbridge.nz'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (project_id, owner_id, tradie_id, rating, comment, images, video)
SELECT
    p.id,
    o.id,
    t.id,
    4,
    '王师傅技术不错，价格合理，就是稍微晚到了一点。整体还是很满意的。',
    '{}',
    null
FROM projects p, owners o, tradies t
WHERE p.email = 'li@buildbridge.nz'
  AND o.email = 'li@buildbridge.nz'
  AND t.email = 'wang.plumber@buildbridge.nz'
ON CONFLICT DO NOTHING;

-- 设置行级安全策略（RLS）
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 创建策略允许匿名用户读取和插入项目
DROP POLICY IF EXISTS "Allow anonymous to read projects" ON projects;
CREATE POLICY "Allow anonymous to read projects" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous to insert projects" ON projects;
CREATE POLICY "Allow anonymous to insert projects" ON projects FOR INSERT WITH CHECK (true);

-- 创建策略允许管理员访问所有数据
DROP POLICY IF EXISTS "Allow admin to manage owners" ON owners;
CREATE POLICY "Allow admin to manage owners" ON owners FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin to manage tradies" ON tradies;
CREATE POLICY "Allow admin to manage tradies" ON tradies FOR ALL USING (true);

-- 允许匿名用户读取业主和技师信息（用于公开展示）
DROP POLICY IF EXISTS "Allow anonymous to read owners" ON owners;
CREATE POLICY "Allow anonymous to read owners" ON owners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous to read tradies" ON tradies;
CREATE POLICY "Allow anonymous to read tradies" ON tradies FOR SELECT USING (true);

-- 评论表策略
DROP POLICY IF EXISTS "Allow anonymous to read reviews" ON reviews;
CREATE POLICY "Allow anonymous to read reviews" ON reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Allow anonymous to insert reviews" ON reviews;
CREATE POLICY "Allow anonymous to insert reviews" ON reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin to manage reviews" ON reviews;
CREATE POLICY "Allow admin to manage reviews" ON reviews FOR ALL USING (true);

-- 创建视图：技师统计信息
CREATE OR REPLACE VIEW tradie_stats AS
SELECT
    t.*,
    COALESCE(r.avg_rating, 0) as calculated_rating,
    COALESCE(r.total_reviews, 0) as calculated_review_count,
    COALESCE(r.recent_reviews, 0) as recent_review_count
FROM tradies t
LEFT JOIN (
    SELECT
        tradie_id,
        AVG(rating::DECIMAL) as avg_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_reviews
    FROM reviews
    WHERE is_approved = true
    GROUP BY tradie_id
) r ON t.id = r.tradie_id;

-- 添加注释
COMMENT ON TABLE projects IS '项目表 - 存储客户发布的需求项目';
COMMENT ON TABLE owners IS '业主表 - 存储平台业主用户信息';
COMMENT ON TABLE tradies IS '技师表 - 存储平台技师用户信息';
COMMENT ON TABLE reviews IS '评论表 - 存储客户对技师的评价';

COMMENT ON COLUMN projects.latitude IS '项目纬度坐标';
COMMENT ON COLUMN projects.longitude IS '项目经度坐标';
COMMENT ON COLUMN owners.latitude IS '业主纬度坐标';
COMMENT ON COLUMN owners.longitude IS '业主经度坐标';
COMMENT ON COLUMN tradies.latitude IS '技师纬度坐标';
COMMENT ON COLUMN tradies.longitude IS '技师经度坐标';
COMMENT ON COLUMN tradies.service_radius IS '技师服务半径（公里）';
COMMENT ON COLUMN reviews.is_approved IS '评论是否已审核通过';

COMMENT ON FUNCTION calculate_distance IS '计算两个地理坐标之间的距离（公里）';
COMMENT ON VIEW tradie_stats IS '技师统计信息视图 - 包含评分和评论统计';
