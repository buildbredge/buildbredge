# BuildBridge 用户认证系统设置指南

## 🚀 技术架构

```
Frontend (Next.js) → Supabase (数据库+认证) → Resend (邮件服务)
```

## 📋 设置步骤

### 1. 创建Supabase项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目
3. 记录项目URL和API密钥：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. 设置数据库表

在Supabase SQL编辑器中运行以下SQL：

```sql
-- 用户资料表
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  suburb TEXT,
  user_type TEXT CHECK (user_type IN ('homeowner', 'tradie')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 技师信息表
CREATE TABLE tradie_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_name TEXT,
  specialties TEXT[],
  hourly_rate DECIMAL,
  experience_years INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradie_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own tradie profile" ON tradie_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own tradie profile" ON tradie_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own tradie profile" ON tradie_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. 配置Supabase认证

在Supabase Dashboard → Authentication → Settings：

1. **Site URL**: `https://buildbridge.nz` (生产环境)
2. **Redirect URLs**:
   - `https://buildbridge.nz/auth/callback` (生产环境)
   - `http://localhost:3000/auth/callback` (开发环境)
3. **启用邮箱确认**: ✅
4. **邮件模板**: 可自定义欢迎邮件和重置密码邮件

### 4. 设置Resend邮件服务

1. 访问 [https://resend.com](https://resend.com)
2. 创建账户并获取API密钥
3. 验证发送域名（可选，免费账户可用onboarding@resend.dev）

### 5. 环境变量配置

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

填入您的配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend邮件服务
RESEND_API_KEY=re_your-api-key

# 应用URL
NEXT_PUBLIC_APP_URL=https://buildbridge.nz
```

### 6. 测试认证流程

1. 启动开发服务器：
   ```bash
   bun run dev
   ```

2. 访问注册页面：`http://localhost:3000/auth/register`

3. 测试完整流程：
   - 用户注册
   - 邮箱验证
   - 登录
   - 仪表板访问

## 🔧 功能特性

### ✅ 已实现功能

- **用户注册**: 支持房主和技师两种账户类型
- **邮箱验证**: 自动发送验证邮件
- **安全登录**: 密码加密存储
- **个人资料**: 完整的用户信息管理
- **技师资料**: 技师专用的公司信息、技能、费率设置
- **响应式UI**: 移动端友好界面
- **多步骤表单**: 引导式注册流程

### 🔄 注册流程

1. **账户类型选择**: 房主 vs 技师
2. **基本信息**: 姓名、邮箱、密码
3. **联系信息**: 电话、地址、城区
4. **专业信息**: (仅技师) 公司、技能、经验、费率
5. **确认提交**: 条款同意、信息确认
6. **邮箱验证**: 自动发送验证链接
7. **账户激活**: 验证后可正常使用

### 📧 邮件功能

- **验证邮件**: 精美的HTML邮件模板
- **密码重置**: 安全的密码重置流程
- **欢迎消息**: 个性化的欢迎内容
- **中文支持**: 完全中文化的邮件内容

## 🔒 安全特性

- **行级安全**: 用户只能访问自己的数据
- **JWT认证**: 安全的会话管理
- **密码加密**: BCrypt哈希存储
- **邮箱验证**: 防止虚假注册
- **HTTPS支持**: 生产环境强制加密传输

## 🚀 部署建议

### 生产环境配置

1. **Supabase生产项目**: 创建独立的生产环境项目
2. **自定义域名**: 配置邮件发送域名
3. **SSL证书**: 确保HTTPS访问
4. **环境变量**: 更新生产环境配置

### 监控与维护

- **用户注册量**: 监控注册转化率
- **邮件送达率**: 检查邮件服务状态
- **数据库性能**: 优化查询和索引
- **安全日志**: 记录异常登录行为

## 📞 支持联系

如需技术支持或有疑问，请联系：
- 邮箱: support@buildbridge.nz
- 文档: [项目Wiki](./README.md)

---

## 🎯 下一步优化

1. **多重身份验证 (2FA)**
2. **社交登录集成** (Google, Facebook)
3. **用户行为分析**
4. **自动邮件营销**
5. **更多用户权限管理**
