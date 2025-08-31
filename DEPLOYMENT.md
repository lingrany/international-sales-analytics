# 🚀 Vercel 部署指南

## 快速部署到 Vercel

### 方法一：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel --prod
   ```

### 方法二：通过 GitHub 集成

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库：`international-sales-analytics`
4. 点击 "Deploy"

## 🔧 配置说明

项目已包含 `vercel.json` 配置文件，包含以下设置：

- **路由配置**：
  - `/` → 主仪表板页面
  - `/demo` → 功能演示页面
  - `/business` → 商务版仪表板
  - `/simple` → 简化版仪表板

- **静态文件处理**：
  - HTML、CSS、JS 文件
  - 图片和数据文件
  - 自动缓存优化

## 📊 部署后的访问地址

部署成功后，你将获得类似以下的访问地址：

- **主页面**：`https://your-project.vercel.app/`
- **功能演示**：`https://your-project.vercel.app/demo`
- **商务版**：`https://your-project.vercel.app/business`
- **简化版**：`https://your-project.vercel.app/simple`

## ⚡ 性能优化

Vercel 自动提供：
- 全球 CDN 加速
- 自动 HTTPS
- 图片优化
- 缓存策略
- 压缩优化

## 🔄 自动部署

连接 GitHub 后，每次推送到 `main` 分支都会自动触发部署。

## 📈 监控和分析

在 Vercel Dashboard 中可以查看：
- 访问统计
- 性能指标
- 错误日志
- 部署历史

## 🛠️ 故障排除

如果遇到问题：

1. **检查构建日志**：在 Vercel Dashboard 查看部署日志
2. **验证文件路径**：确保所有引用路径正确
3. **检查数据文件**：确认 JSON 数据文件可访问
4. **测试本地环境**：先在本地确保项目正常运行

## 📞 支持

如需帮助，可以：
- 查看 [Vercel 文档](https://vercel.com/docs)
- 检查项目的 GitHub Issues
- 联系项目维护者