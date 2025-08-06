-- 创建用户系统相关表
-- 在Supabase控制台的SQL编辑器中执行此脚本

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建统一用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- 使用Supabase auth.users的id
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户角色表（支持多角色）
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('owner', 'tradie', 'admin')),
  is_primary BOOLEAN DEFAULT false, -- 是否为主要角色
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保每个用户每种角色只能有一个记录
  UNIQUE(user_id, role_type)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_coordinates ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON user_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_primary ON user_roles(is_primary) WHERE is_primary = true;

-- 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为users表添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 设置行级安全策略（RLS）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 创建策略允许管理员访问所有数据
DROP POLICY IF EXISTS "Allow admin to manage users" ON users;
CREATE POLICY "Allow admin to manage users" ON users FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin to manage user_roles" ON user_roles;
CREATE POLICY "Allow admin to manage user_roles" ON user_roles FOR ALL USING (true);

-- 允许匿名用户读取用户信息（用于公开展示）
DROP POLICY IF EXISTS "Allow anonymous to read users" ON users;
CREATE POLICY "Allow anonymous to read users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous to read user_roles" ON user_roles;
CREATE POLICY "Allow anonymous to read user_roles" ON user_roles FOR SELECT USING (true);

-- 允许匿名用户插入用户记录（注册时需要）
DROP POLICY IF EXISTS "Allow anonymous to insert users" ON users;
CREATE POLICY "Allow anonymous to insert users" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous to insert user_roles" ON user_roles;
CREATE POLICY "Allow anonymous to insert user_roles" ON user_roles FOR INSERT WITH CHECK (true);

-- 添加注释
COMMENT ON TABLE users IS '统一用户表 - 存储所有平台用户的基本信息';
COMMENT ON TABLE user_roles IS '用户角色表 - 支持用户拥有多种角色（业主、技师、管理员）';

COMMENT ON COLUMN users.id IS '用户ID - 与Supabase auth.users.id关联';
COMMENT ON COLUMN users.latitude IS '用户纬度坐标';
COMMENT ON COLUMN users.longitude IS '用户经度坐标';
COMMENT ON COLUMN user_roles.is_primary IS '是否为用户的主要角色';