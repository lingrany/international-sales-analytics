# 🔧 Vercel部署故障排除

## 当前问题：生产域未提供流量

### 可能的原因和解决方案

#### 1. 检查部署状态
在Vercel Dashboard中：
- 查看 "Deployments" 标签
- 确认最新部署是否成功
- 查看构建日志是否有错误

#### 2. 强制重新部署
```bash
# 方法1：通过CLI强制部署
vercel --prod --force

# 方法2：在Vercel Dashboard点击 "Redeploy"
```

#### 3. 检查域名设置
- 在Vercel Dashboard的 "Settings" > "Domains"
- 确认域名配置正确
- 如果使用自定义域名，检查DNS设置

#### 4. 验证文件结构
确保以下文件存在且正确：
```
/
├── index.html          ← 主入口文件
├── vercel.json         ← 配置文件
├── assets/
│   ├── international.html
│   ├── international-business.html
│   └── index.html
├── src/
├── data/
└── simple_demo.html
```

#### 5. 测试本地构建
```bash
# 安装Vercel CLI
npm i -g vercel

# 本地测试
vercel dev
```

#### 6. 检查vercel.json配置
当前配置已简化，应该可以正常工作：
```json
{
  "version": 2,
  "routes": [
    { "src": "/", "dest": "/index.html" },
    { "src": "/demo", "dest": "/simple_demo.html" },
    { "src": "/business", "dest": "/assets/international-business.html" },
    { "src": "/simple", "dest": "/assets/index.html" },
    { "src": "/main", "dest": "/assets/international.html" }
  ]
}
```

## 🚀 重新部署步骤

### 方法1：通过GitHub触发
1. 推送任何小改动到main分支
2. Vercel会自动重新部署

### 方法2：手动重新部署
1. 登录Vercel Dashboard
2. 找到你的项目
3. 点击最新部署旁的 "..." 菜单
4. 选择 "Redeploy"

### 方法3：删除项目重新导入
1. 在Vercel Dashboard删除项目
2. 重新导入GitHub仓库
3. 使用默认设置部署

## 📞 如果问题持续

1. **检查Vercel状态页面**: https://vercel-status.com
2. **查看Vercel文档**: https://vercel.com/docs
3. **联系Vercel支持**: 通过Dashboard提交支持请求

## ✅ 部署成功的标志

- Dashboard显示绿色的 "Ready" 状态
- 可以访问 `https://your-domain.vercel.app`
- 所有路由都能正常工作
- 静态资源正常加载

## 🔍 调试技巧

1. **查看浏览器开发者工具**
   - 检查网络请求
   - 查看控制台错误

2. **使用Vercel CLI调试**
   ```bash
   vercel logs your-deployment-url
   ```

3. **检查函数日志**（如果使用）
   - 在Dashboard的Functions标签查看