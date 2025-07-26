# 🗺️ Google Maps API CORS错误解决方案 v2

## ❌ 常见错误类型
```
1. Failed to load resource: because it violates the resource's Cross-Origin-Resource-Policy response header
2. Google Maps JavaScript API RefererNotAllowedMapError
3. This page can't load Google Maps correctly
4. Uncaught ReferenceError: google is not defined
```

## 🔧 完整解决步骤

### 第一步：访问Google Cloud Console
1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 确保选择了正确的项目
3. 转到 **"APIs & Services"** > **"Credentials"**
4. 找到并点击编辑API密钥：

### 第二步：配置应用程序限制
1. 在 **"Application restrictions"** 部分
2. 选择 **"HTTP referrers (web sites)"**
3. 点击 **"Add an item"** 添加以下所有域名：

```
# 开发环境
http://localhost:3000/*
http://127.0.0.1:3000/*
http://0.0.0.0:3000/*

# Same平台预览环境
https://*.preview.same-app.com/*
https://3000-*.preview.same-app.com/*
https://*.same.new/*
https://*.same-app.com/*

# 生产环境
https://buildbridge.nz/*
https://*.netlify.app/*
https://*.netlify.com/*

# 额外保险域名
https://*.vercel.app/*
https://*.vercel.com/*
```

### 第三步：确认API启用
确保以下API已启用：
- ✅ **Maps JavaScript API**
- ✅ **Places API (New)**
- ✅ **Geocoding API**

### 第四步：保存并等待生效
1. 点击 **"Save"** 保存更改
2. **等待 2-5 分钟** 让更改生效
3. 清除浏览器缓存（Ctrl+Shift+R）

## 🧪 测试诊断工具
运行诊断页面来验证修复：
```bash
# 在浏览器中打开
http://localhost:3000/../test-google-maps-debug.html
```

## 🚨 紧急解决方案（仅开发环境）
如果急需测试功能，可临时：
1. 在API限制中选择 **"None"**
2. 点击保存
3. 测试完成后**必须**恢复限制

⚠️ **安全警告**：生产环境绝不应该移除域名限制！

## 📋 常见问题排查

### 问题1：仍然出现CORS错误
**解决方案：**
- 等待更长时间（最多15分钟）
- 完全重启浏览器
- 检查域名拼写是否正确

### 问题2：API配额超限
**解决方案：**
- 检查Google Cloud Console中的配额使用情况
- 如需要，升级计费账户

### 问题3：地图显示空白
**解决方案：**
- 检查控制台是否有JavaScript错误
- 确认网络连接正常
- 验证API密钥权限

## 📞 支持联系
如果问题仍然存在：
1. 使用诊断工具收集错误信息
2. 截图包含完整错误消息
3. 联系Same支持：support@same.new
