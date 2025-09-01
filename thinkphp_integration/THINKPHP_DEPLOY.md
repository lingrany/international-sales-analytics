# ThinkPHP 集成部署指南

## 📁 文件部署位置

### 1. 控制器文件
```
application/analysis18/controller/Index.php
```

### 2. 视图模板文件
```
application/analysis18/view/index/
├── index.html          ← 主页模板
├── modern.html         ← 现代版仪表板
├── business.html       ← 商务版仪表板
└── demo.html          ← 功能演示
```

### 3. 静态资源文件
```
public/static/analysis18/
├── src/                ← JavaScript文件
├── data/               ← JSON数据文件
├── tailwind.min.css    ← 样式文件
└── *.png              ← 图片文件
```

### 4. 路由配置（可选）
```
application/analysis18/route.php
```

## 🚀 部署步骤

### 步骤1：创建模块目录
```bash
mkdir application/analysis18
mkdir application/analysis18/controller
mkdir application/analysis18/view
mkdir application/analysis18/view/index
mkdir public/static/analysis18
```

### 步骤2：复制文件
1. 将 `Index.php` 复制到 `application/analysis18/controller/`
2. 将所有 `.html` 模板文件复制到 `application/analysis18/view/index/`
3. 将静态资源复制到 `public/static/analysis18/`

### 步骤3：修改模板中的资源路径
在模板文件中，将资源路径修改为：
```html
<!-- CSS文件 -->
<link rel="stylesheet" href="/static/analysis18/tailwind.min.css">

<!-- JavaScript文件 -->
<script src="/static/analysis18/src/utils/data-processor.js"></script>
<script src="/static/analysis18/src/analysis/international-analytics.js"></script>

<!-- 数据文件 -->
fetch('/static/analysis18/data/external/test_honeywhale_.json')

<!-- 图片文件 -->
<img src="/static/analysis18/time.png" alt="时间">
```

### 步骤4：配置路由（可选）
如果使用自定义路由，将 `route.php` 复制到 `application/analysis18/`

## 🌐 访问地址

部署完成后，可以通过以下地址访问：

- **主页**: http://test.honeywhale.co.nz/analysis18.php/Index
- **现代版仪表板**: http://test.honeywhale.co.nz/analysis18.php/Index/modern
- **商务版仪表板**: http://test.honeywhale.co.nz/analysis18.php/Index/business
- **功能演示**: http://test.honeywhale.co.nz/analysis18.php/Index/demo
- **API接口**: http://test.honeywhale.co.nz/analysis18.php/Index/getSalesData

## 🔧 可能需要的调整

### 1. 数据库连接
如果需要连接数据库，在控制器中添加：
```php
use think\Db;

// 获取销售数据
$salesData = Db::table('sales')->select();
```

### 2. 权限控制
如果需要登录验证，在控制器中添加：
```php
public function _initialize()
{
    parent::_initialize();
    // 检查用户登录状态
    if (!session('user_id')) {
        $this->redirect('login/index');
    }
}
```

### 3. 配置文件
在 `application/analysis18/config.php` 中添加模块配置：
```php
return [
    'template' => [
        'layout_on' => false,
        'layout_name' => 'layout',
    ],
];
```

## 📊 数据集成

当前使用的是静态JSON数据，如需集成真实数据：

1. **修改控制器中的数据获取方法**
2. **连接现有数据库表**
3. **实现实时数据更新**

## 🎯 完成后效果

用户访问 `http://test.honeywhale.co.nz/analysis18.php/Index` 将看到：
- 专业的销售分析仪表板入口页面
- 两个不同风格的仪表板选项
- 完整的数据可视化功能
- 响应式设计，支持各种设备