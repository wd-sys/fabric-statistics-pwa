# GitHub Pages 部署指南

## 步骤1：创建GitHub仓库

1. 访问 [GitHub](https://github.com) 并登录您的账号
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `fabric-statistics-pwa`
   - **Description**: `布料统计管理系统 - PWA版本`
   - **Public**: 选择 Public（免费用户只能用Public仓库部署GitHub Pages）
   - **Initialize this repository with**: 不要勾选任何选项
4. 点击 "Create repository"

## 步骤2：上传代码到GitHub

在终端中执行以下命令（已在当前目录准备好）：

```bash
# 添加远程仓库（替换YOUR_USERNAME为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/fabric-statistics-pwa.git

# 推送代码到GitHub
git branch -M main
git push -u origin main
```

## 步骤3：启用GitHub Pages

1. 在GitHub仓库页面，点击 "Settings" 标签
2. 在左侧菜单中找到 "Pages"
3. 在 "Source" 部分：
   - 选择 "Deploy from a branch"
   - Branch: 选择 "main"
   - Folder: 选择 "/ (root)"
4. 点击 "Save"

## 步骤4：访问您的应用

几分钟后，您的应用将在以下地址可用：
```
https://YOUR_USERNAME.github.io/fabric-statistics-pwa/pdf.html
```

## 重要说明

### 应用特性
- ✅ **完全静态**：无需服务器，纯前端运行
- ✅ **PWA支持**：可安装到手机桌面
- ✅ **离线功能**：支持离线使用
- ✅ **响应式设计**：完美适配手机和电脑
- ✅ **数据本地存储**：使用localStorage，数据安全

### 功能完整性
- ✅ 布料信息管理（添加、编辑、删除）
- ✅ 出库记录管理
- ✅ 统计分析功能
- ✅ 数据导入导出
- ✅ 搜索和筛选
- ✅ 移动端优化

### 使用注意事项
1. **数据存储**：所有数据存储在浏览器本地，不会上传到服务器
2. **数据备份**：建议定期使用"导出数据"功能备份
3. **浏览器兼容**：支持所有现代浏览器
4. **安装应用**：在手机浏览器中访问时，可以"添加到主屏幕"

### 自动更新
每次您推送新代码到GitHub，GitHub Pages会自动更新部署的应用。

### 自定义域名（可选）
如果您有自己的域名，可以在GitHub Pages设置中配置自定义域名。

---

**恭喜！** 您的布料统计软件现在可以被全世界任何人访问使用了！