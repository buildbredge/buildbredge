-- 创建管理员表 - BuildBridge Admin Table
-- 在Supabase控制台的SQL编辑器中执行此脚本

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions JSONB DEFAULT '[]'::jsonb,
  avatar TEXT,
  phone VARCHAR(50),
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);
CREATE INDEX IF NOT EXISTS idx_admins_department ON admins(department);
CREATE INDEX IF NOT EXISTS idx_admins_created_at ON admins(created_at DESC);

-- 为管理员表添加更新时间触发器
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at 
  BEFORE UPDATE ON admins 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建管理员活动记录表
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建管理员活动记录表的索引
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_resource ON admin_activity_logs(resource_type, resource_id);

-- 启用行级安全策略
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 创建管理员访问策略 - 只有活跃管理员可以访问
DROP POLICY IF EXISTS "Admins can manage admins" ON admins;
CREATE POLICY "Admins can manage admins" ON admins 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()::uuid 
      AND is_active = true
    )
  );

-- 超级管理员可以管理所有管理员
DROP POLICY IF EXISTS "Super admins can manage all admins" ON admins;
CREATE POLICY "Super admins can manage all admins" ON admins 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()::uuid 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- 管理员活动记录策略
DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_logs;
CREATE POLICY "Admins can view activity logs" ON admin_activity_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()::uuid 
      AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert activity logs" ON admin_activity_logs;
CREATE POLICY "Admins can insert activity logs" ON admin_activity_logs 
  FOR INSERT WITH CHECK (
    admin_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()::uuid 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- 创建函数：记录管理员活动
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO admin_activity_logs (
    admin_id, action, resource_type, resource_id, 
    details, ip_address, user_agent
  ) VALUES (
    p_admin_id, p_action, p_resource_type, p_resource_id, 
    p_details, p_ip_address, p_user_agent
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：更新管理员最后登录时间
CREATE OR REPLACE FUNCTION update_admin_login(p_admin_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE admins 
  SET 
    last_login_at = NOW(),
    login_count = login_count + 1
  WHERE id = p_admin_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：验证管理员权限
CREATE OR REPLACE FUNCTION check_admin_permission(
  p_admin_id UUID,
  p_permission VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_role VARCHAR(20);
  admin_permissions JSONB;
BEGIN
  SELECT role, permissions INTO admin_role, admin_permissions
  FROM admins 
  WHERE id = p_admin_id AND is_active = true;
  
  -- 超级管理员拥有所有权限
  IF admin_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- 检查特定权限
  IF admin_permissions ? p_permission THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 插入默认超级管理员账户
-- 注意：这里使用bcrypt加密的密码 "buildbridge2025"
-- 实际使用时应该通过应用程序生成加密的密码
INSERT INTO admins (
  email, 
  password_hash, 
  name, 
  role, 
  permissions,
  department,
  is_active
) VALUES (
  'admin@buildbridge.nz',
  '$2b$10$rOdMvT7jOqKYnJ5yGKZr3OzQVgLFXhZC1vNmBWVNJx8FgYhGHLZFy', -- buildbridge2025
  '系统管理员',
  'super_admin',
  '["user_management", "project_management", "tradie_management", "review_management", "system_settings", "admin_management", "activity_logs", "database_management"]'::jsonb,
  'IT部门',
  true
),
(
  'support@buildbridge.nz',
  '$2b$10$rOdMvT7jOqKYnJ5yGKZr3OzQVgLFXhZC1vNmBWVNJx8FgYhGHLZFy', -- buildbridge2025
  '客服管理员',
  'admin',
  '["user_management", "project_management", "review_management", "support_tickets"]'::jsonb,
  '客服部门',
  true
),
(
  'moderator@buildbridge.nz',
  '$2b$10$rOdMvT7jOqKYnJ5yGKZr3OzQVgLFXhZC1vNmBWVNJx8FgYhGHLZFy', -- buildbridge2025
  '内容审核员',
  'moderator',
  '["review_management", "content_moderation"]'::jsonb,
  '内容部门',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 创建视图：管理员统计信息
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  a.*,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE admin_id = a.id) as total_activities,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE admin_id = a.id AND created_at > NOW() - INTERVAL '30 days') as recent_activities,
  (SELECT action FROM admin_activity_logs WHERE admin_id = a.id ORDER BY created_at DESC LIMIT 1) as last_action
FROM admins a;

-- 添加表注释
COMMENT ON TABLE admins IS '管理员表 - 存储网站管理员信息';
COMMENT ON TABLE admin_activity_logs IS '管理员活动记录表 - 记录管理员操作日志';

COMMENT ON COLUMN admins.password_hash IS '密码哈希值 - 使用bcrypt加密';
COMMENT ON COLUMN admins.role IS '管理员角色 - super_admin/admin/moderator';
COMMENT ON COLUMN admins.permissions IS 'JSON格式的权限列表';
COMMENT ON COLUMN admins.is_active IS '账户是否激活';
COMMENT ON COLUMN admins.login_count IS '登录次数统计';

COMMENT ON FUNCTION log_admin_activity IS '记录管理员活动日志';
COMMENT ON FUNCTION update_admin_login IS '更新管理员登录信息';
COMMENT ON FUNCTION check_admin_permission IS '检查管理员权限';
COMMENT ON VIEW admin_stats IS '管理员统计信息视图';