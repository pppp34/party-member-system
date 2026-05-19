# Vercel 部署指南

## 方式一：通过 GitHub 部署（推荐）

### 第1步：创建 GitHub 仓库

1. 访问 https://github.com 并登录
2. 点击右上角 **「+」** → **「New repository」**
3. 仓库名称填写：`party-member-system`
4. 选择 **「Private」**（私有）
5. 点击 **「Create repository」**

### 第2步：上传代码到 GitHub

在部署目录打开终端，执行：

```bash
cd E:\WorkBuddy\workspace\2026-05-19-task-8\party-member-system-deploy

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "党员管理系统"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/party-member-system.git

# 推送
git branch -M main
git push -u origin main
```

### 第3步：在 Vercel 部署

1. 访问 https://vercel.com 并登录（可用 GitHub 账号）
2. 点击 **「Add New...」** → **「Project」**
3. 选择 **「Import Git Repository」**
4. 找到 `party-member-system` 仓库，点击 **「Import」**
5. 配置项目：
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: 留空
   - **Output Directory**: `./`
6. 点击 **「Deploy」**
7. 等待约 30 秒，部署完成！

### 第4步：访问你的网站

部署完成后，Vercel 会提供一个 `.vercel.app` 域名，例如：
`https://party-member-system.vercel.app`

---

## 方式二：通过 Vercel CLI 部署

### 第1步：安装 Vercel CLI

```bash
npm install -g vercel
```

### 第2步：登录 Vercel

```bash
vercel login
```

### 第3步：部署

```bash
cd E:\WorkBuddy\workspace\2026-05-19-task-8\party-member-system-deploy
vercel
```

按提示操作：
- Set up and deploy? → **Y**
- Which scope? → 选择你的账号
- Link to existing project? → **N**
- Project name? → `party-member-system`
- Directory? → `./` → **Enter**
- Override settings? → **N**

### 第4步：正式环境部署

```bash
vercel --prod
```

---

## 注意事项

1. **Supabase 连接**：Vercel 部署后，Supabase 连接配置保持不变，系统会自动连接云端数据库。

2. **自定义域名（可选）**：
   - 在 Vercel 项目设置 → Domains 添加你的域名
   - 按提示配置 DNS 记录

3. **环境变量**：如果未来需要，可以在 Vercel 项目设置中配置环境变量。

---

## 部署状态

| 平台 | 状态 | 访问地址 |
|------|------|----------|
| 阿里云 OSS | ✅ 已部署 | https://party-member-system.oss-cn-shanghai.aliyuncs.com |
| Vercel | 待部署 | https://party-member-system.vercel.app |
