# 党员管理系统 - Supabase 云端部署指南

## 📋 部署概览

本指南将帮助你把党员管理系统从纯本地存储升级为云端同步版本，实现多设备数据共享。

```
┌─────────────────────────────────────────────────────────┐
│                    部署架构图                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐        │
│   │ PC 浏览器 │ ←──→ │ Supabase │ ←──→ │ 手机浏览器 │        │
│   └─────────┘      └─────────┘      └─────────┘        │
│        ↓                ↓                ↓             │
│   localStorage      Cloud DB         localStorage       │
│        └──────────────┴──────────────┘                  │
│                      数据同步                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始（10分钟部署）

### 第一步：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 点击 **Start your project**
3. 使用 GitHub 账号登录
4. 点击 **New project**
5. 填写项目信息：
   - **Organization**: 选择你的组织
   - **Name**: `party-member-system`（或你喜欢的名字）
   - **Database Password**: 自动生成，保存好
   - **Region**: 选择 `Northeast Asia`（日本/韩国）或 `Southeast Asia`（新加坡）
6. 点击 **Create new project**
7. 等待项目创建完成（约2分钟）

### 第二步：创建数据库表

1. 在 Supabase 控制台左侧菜单点击 **SQL Editor**
2. 点击 **New query**
3. 复制 `backend/supabase/schema.sql` 的全部内容
4. 粘贴到编辑器中
5. 点击 **Run** 执行

✅ 验证：左侧 **Table Editor** 中应看到 4 个表：
- `members`（党员信息）
- `partners`（合作伙伴）
- `activities`（活动记录）
- `member_behavior`（行为追踪）

### 第三步：获取 API 密钥

1. 进入 **Settings → API**
2. 找到以下信息：

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. 打开 `js/supabase-client.js`
4. 替换配置：

```javascript
const SUPABASE_CONFIG = {
  url: 'https://你的项目ID.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

### 第四步：测试连接

1. 在浏览器中打开 `settings.html`
2. 页面会显示当前连接状态
3. 如果显示"连接成功"，配置正确！

### 第五步：数据迁移

如果你已有本地数据：

1. 在设置页面点击 **导出数据** 备份
2. 切换到 **云端同步模式**
3. 点击 **导入数据** 上传备份文件
4. 数据将自动同步到云端

---

## 📱 使用云端功能

### 在设置页面你可以：

| 功能 | 说明 |
|------|------|
| 查看同步状态 | 实时显示当前连接状态 |
| 切换同步模式 | 在本地/云端之间切换 |
| 立即同步 | 手动触发数据同步 |
| 导出数据 | 下载 JSON 格式备份 |
| 导入数据 | 从备份文件恢复 |

### 多设备使用：

1. 所有设备使用相同的 Supabase 配置
2. 打开系统后会自动同步最新数据
3. 任何设备的修改都会实时同步

---

## 🔒 安全配置（重要）

### 当前配置说明

当前使用的是**公开策略**（RLS disabled）：
- ✅ 任何人都可读取数据
- ✅ 任何人都可写入数据
- ⚠️ 不适合生产环境

### 推荐安全配置

#### 方案一：启用邮箱认证（推荐）

```sql
-- 在 SQL Editor 中运行

-- 1. 启用邮箱认证
ALTER AUTHENTICATION NONE TO EMAIL;

-- 2. 创建一个 profiles 表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 修改 RLS 策略（只有本人可读写）
DROP POLICY IF EXISTS "Allow public read members" ON members;
CREATE POLICY "Members are viewable by authenticated users" 
  ON members FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Allow insert members" ON members;
CREATE POLICY "Members can be inserted by authenticated users" 
  ON members FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
```

#### 方案二：使用 Row Level Security

```sql
-- 启用更严格的 RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 只允许读取自己的数据
CREATE POLICY "Users can read own data" ON members
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 只允许创建自己的数据
CREATE POLICY "Users can insert own data" ON members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

---

## 🌐 部署到云端静态托管

### Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 进入项目目录
cd party-member-system

# 3. 部署
vercel

# 4. 按提示操作
# - Set up and deploy? Y
# - Which scope? 选择你的账号
# - Link to existing project? N
# - Project name? party-member-system
# - Directory? ./
# - Override settings? N
```

### Netlify

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 部署
netlify deploy --dir . --prod
```

### GitHub Pages

1. 创建 GitHub 仓库
2. 上传所有文件
3. Settings → Pages → Source: main branch
4. 访问 `https://用户名.github.io/仓库名/`

---

## 🔧 常见问题

### Q1: 同步失败怎么办？

**检查清单：**
- [ ] Supabase URL 和 Key 是否正确？
- [ ] 数据库表是否已创建？
- [ ] 网络连接是否正常？
- [ ] 浏览器控制台是否有报错？

### Q2: 数据丢失怎么办？

**恢复步骤：**
1. 打开浏览器的开发者工具（F12）
2. 切换到 Application → Local Storage
3. 检查是否有残留数据
4. 如果有，从备份文件恢复

### Q3: 如何添加新字段？

1. 在 Supabase Table Editor 中添加
2. 更新 schema.sql 保持同步
3. 修改前端代码处理新字段

### Q4: 如何备份数据库？

在 Supabase 控制台：
1. **Database → Backups**
2. 查看自动备份
3. 或手动创建备份点

---

## 📞 获取帮助

- **Supabase 文档**: [supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [discord.gg/supabase](https://discord.gg/supabase)
- **官方示例**: [github.com/supabase/supabase](https://github.com/supabase/supabase)

---

## 📝 后续优化建议

1. **添加用户认证系统**
   - 支持多用户登录
   - 区分管理员/普通用户权限

2. **实时订阅**
   - 使用 Supabase Realtime
   - 实现多人同时编辑

3. **数据可视化增强**
   - Supabase + Chart.js 集成
   - 实时仪表盘

4. **文件存储**
   - 使用 Supabase Storage
   - 党员照片上传功能

5. **通知系统**
   - 入党纪念日提醒
   - 党费缴纳提醒
