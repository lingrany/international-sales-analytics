# 🚀 Vercel 部署步骤

## 方法一：通过 Vercel 网站部署（最简单）

### 1. 准备工作
- 确保你的代码已推送到 GitHub
- 访问 [vercel.com](https://vercel.com)

### 2. 导入项目
1. 点击 "New Project"
2. 选择 "Import Git Repository"
3. 找到你的仓库：`lingrany/international-sales-analytics`
4. 点击 "Import"

### 3. 配置项目
- **Project Name**: `international-sales-analytics`
- **Framework Preset**: `Other`
- **Root Directory**: `./` (默认)
- **Build Command**: 留空（静态网站）
- **Output Directory**: 留空
- **Install Command**: 留空

### 4. 部署
- 点击 "Deploy" 按钮
- 等待部署完成（通常1-2分钟）

### 5. 访问你的网站
部署成功后，你会得到类似这样的地址：
- `https://international-sales-analytics.vercel.app`

## 方法二：通过 CLI 部署

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录
```bash
vercel login
```

### 3. 部署
在项目根目录运行：
```bash
vercel --prod
```

## 🎯 部署后的访问地址

- **主页**: `https://your-domain.vercel.app/`
- **现代版仪表板**: `https://your-domain.vercel.app/`
- **商务版仪表板**: `https://your-domain.vercel.app/business`
- **简化版仪表板**: `https://your-domain.vercel.app/simple`
- **功能演示**: `https://your-domain.vercel.app/demo`

## ⚡ 自动部署

连接 GitHub 后：
- 每次推送到 `main` 分支自动部署
- 预览分支：其他分支推送会创建预览版本
- 实时更新：代码更改后自动重新部署

## 🔧 高级配置

项目已包含 `vercel.json` 配置：
- 自定义路由
- 缓存优化
- 静态文件处理
- MIME 类型设置

## 📊 监控

在 Vercel Dashboard 可以查看：
- 访问统计
- 性能指标
- 错误日志
- 部署历史

## 🎉 完成！

部署成功后，你的国际销售分析仪表板就可以在全球范围内快速访问了！