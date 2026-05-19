# 党员管理系统 - 部署指南

## 部署方式一：Vercel（推荐，免费且快速）

### 准备工作
1. 注册 Vercel 账号：https://vercel.com
2. 安装 Vercel CLI：
   ```bash
   npm install -g vercel
   ```

### 部署步骤

1. **打开命令行**，进入项目目录：
   ```bash
   cd 党员管理系统-deploy
   ```

2. **登录 Vercel**：
   ```bash
   vercel login
   ```
   按提示输入邮箱完成登录

3. **部署项目**：
   ```bash
   vercel
   ```
   按照提示选择：
   - Set up and deploy? → **Y**
   - Which scope? → 选择你的用户名
   - Link to existing project? → **N**
   - Project name? → `party-member-system`（或自定义）
   - Directory? → 直接回车（当前目录）
   - Override settings? → **N**

4. **等待部署完成**，最后会显示访问地址，例如：
   ```
   ✓ Production URL: https://party-member-system.vercel.app
   ```

5. **以后更新部署**：
   ```bash
   vercel --prod
   ```

---

## 部署方式二：Netlify（备选方案）

### 部署步骤

1. 注册 Netlify：https://netlify.com

2. 进入 Netlify Dashboard，点击 **"Add new site"** → **"Deploy manually"**

3. 将 `party-member-system-deploy` 文件夹拖拽到上传区域

4. 等待几秒，自动生成访问地址

---

## 部署方式三：GitHub Pages（免费）

### 步骤

1. 创建 GitHub 仓库：https://github.com/new
   - Repository name: `party-member-system`

2. 将 `party-member-system-deploy` 文件夹内容上传到仓库

3. 进入仓库 **Settings** → **Pages**

4. Source 选择 **Deploy from a branch**，Branch 选择 **main**

5. 保存后等待 1-2 分钟，获得地址：`https://你的用户名.github.io/party-member-system`

---

## 部署后注意事项

### 1. Supabase 连接
部署后系统会自动连接到您的 Supabase 数据库，数据实时同步。

### 2. 首次访问
首次打开时可能需要：
- 确认 Supabase 配置正确
- 检查浏览器控制台是否有错误

### 3. 分享给其他人
将生成的 URL 分享给同事，他们也可以：
- 查看党员数据
- 添加/编辑党员信息
- 实时同步数据

### 4. 数据安全
当前使用的是公开策略（无密码保护）。如需保护，可后续添加用户认证。

---

## 常见问题

**Q: 部署后显示空白页面？**
A: 检查是否所有文件（HTML、JS、CSS）都上传成功

**Q: 数据不显示？**
A: 打开浏览器控制台（F12），查看是否有 Supabase 连接错误

**Q: 如何更新网站内容？**
A: 修改本地文件后，重新执行 `vercel --prod` 即可更新
