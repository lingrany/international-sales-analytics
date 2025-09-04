# SQLite数据库设置指南

## 🚀 快速开始

### 1. 上传文件到服务器
将以下文件上传到ThinkPHP应用目录：
```
application/analysis18/
├── database.php          # SQLite数据库配置
├── Index.php            # 更新的控制器（包含API接口）
├── init_sqlite.php      # 数据库初始化脚本
└── static/data/         # 确保这个目录存在
    └── b_analytics.json # JSON数据文件
```

### 2. 初始化SQLite数据库
在服务器上运行初始化脚本：

**方法1: 通过浏览器访问**
```
http://test.honeywhale.co.nz/analysis18/init_sqlite.php
```

**方法2: 通过命令行**
```bash
cd /path/to/your/application/analysis18/
php init_sqlite.php
```

### 3. 验证数据库连接
访问测试接口：
```
http://test.honeywhale.co.nz/analysis18.php/index/test_db
```

预期返回：
```json
{
  "status": "success",
  "message": "数据库连接成功！",
  "data": {
    "analytics_daily_summary": 25,
    "analytics_hourly_traffic": 574,
    "analytics_traffic_sources": 838,
    "analytics_page_performance": 433
  }
}
```

## 📊 可用的API接口

### 基础接口
- `test_db` - 测试数据库连接
- `api_dashboard_summary` - 获取仪表板汇总数据

### 数据接口
- `api_daily_summary` - 日常汇总数据（最近30天）
- `api_hourly_traffic` - 小时流量数据（最近7天）
- `api_traffic_sources` - 流量来源数据（最近30天）
- `api_page_performance` - 页面性能数据（最近30天，前20名）

### 使用示例
```javascript
// 获取仪表板汇总数据
fetch('/analysis18.php/index/api_dashboard_summary')
  .then(response => response.json())
  .then(data => {
    console.log('总访问量:', data.data.totalVisits);
    console.log('今日访问量:', data.data.todayVisits);
  });

// 获取日常汇总数据
fetch('/analysis18.php/index/api_daily_summary')
  .then(response => response.json())
  .then(data => {
    console.log('日常数据:', data.data);
  });
```

## 🔧 数据库结构

### analytics_daily_summary (日常汇总)
- `id` - 主键
- `date` - 日期
- `total_visits` - 总访问量
- `unique_visitors` - 独立访客
- `page_views` - 页面浏览量
- `bounce_rate` - 跳出率
- `avg_session_duration` - 平均会话时长

### analytics_hourly_traffic (小时流量)
- `id` - 主键
- `date` - 日期
- `hour` - 小时 (0-23)
- `visits` - 访问量
- `unique_visitors` - 独立访客

### analytics_traffic_sources (流量来源)
- `id` - 主键
- `date` - 日期
- `source_type` - 来源类型
- `source_name` - 来源名称
- `visits` - 访问量
- `conversions` - 转化量

### analytics_page_performance (页面性能)
- `id` - 主键
- `date` - 日期
- `page_url` - 页面URL
- `page_views` - 页面浏览量
- `unique_page_views` - 独立页面浏览量
- `avg_time_on_page` - 平均停留时间
- `bounce_rate` - 跳出率

## 🎯 优势

✅ **无网络依赖** - 完全本地数据库  
✅ **高性能** - SQLite查询速度快  
✅ **零配置** - 无需MySQL服务器  
✅ **数据安全** - 本地文件存储  
✅ **易于备份** - 单个数据库文件  

## 🔍 故障排除

### 问题1: 权限错误
确保data目录有写入权限：
```bash
chmod 755 application/analysis18/data/
```

### 问题2: JSON文件不存在
确保 `b_analytics.json` 文件存在于：
```
application/analysis18/static/data/b_analytics.json
```

### 问题3: SQLite扩展未安装
检查PHP是否支持SQLite：
```php
<?php
if (extension_loaded('sqlite3')) {
    echo "SQLite3 支持已启用";
} else {
    echo "需要安装SQLite3扩展";
}
?>
```

## 📈 下一步

1. **测试API接口** - 确保所有接口正常工作
2. **更新前端代码** - 修改JavaScript调用新的API
3. **数据可视化** - 在business.html中展示真实数据
4. **性能优化** - 根据需要添加索引和缓存

数据库设置完成后，你的分析系统就可以使用真实的数据进行可视化展示了！