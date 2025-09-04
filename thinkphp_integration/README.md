# 国际销售数据分析系统

## 📊 项目概述

基于ThinkPHP 5.1框架的国际销售数据分析系统，使用SQLite数据库存储和分析销售数据，提供现代化的数据可视化界面。

## 🏗️ 系统架构

### 技术栈
- **后端框架**: ThinkPHP 5.1
- **数据库**: SQLite 3
- **前端**: HTML5 + CSS3 + JavaScript + Chart.js
- **数据处理**: PHP流式处理

### 目录结构
```
application/analysis18/
├── controller/
│   └── Index.php              # 主控制器 - API接口和页面路由
├── view/index/
│   ├── index.html            # 首页模板
│   ├── modern.html           # 现代风格仪表板
│   └── business.html         # 商务风格仪表板
├── scripts/
│   └── import_data.php       # 数据导入处理脚本
├── static/                   # 静态资源目录
│   ├── css/                  # 样式文件
│   ├── js/                   # JavaScript文件
│   └── data/
│       └── b_analytics.json  # 原始JSON数据文件
├── data/
│   └── analytics.db          # SQLite数据库文件
├── database.php              # 数据库配置文件
└── README.md                 # 项目文档
```

## 📈 数据处理流程

### 1. 原始数据
- **数据源**: `b_analytics.json` (94,598条原始记录)
- **数据格式**: JSON数组，包含用户访问、页面浏览、流量来源等信息
- **数据字段**: timestamp, page_url, page_views, session_duration, traffic_source等

### 2. 数据处理策略

#### 🔄 流式处理技术
为了处理大文件(94,598条记录)而不超出PHP内存限制，采用流式读取：

```php
// 逐字符读取JSON文件，避免一次性加载到内存
$handle = fopen($dataPath, 'r');
while (!feof($handle)) {
    $char = fgetc($handle);
    // 解析完整的JSON对象后立即处理
    if ($braceCount === 0) {
        $record = json_decode($buffer, true);
        processRecord($record, $dailyData, $hourlyData, $sourceData, $pageData);
    }
}
```

#### 📊 数据分类汇总
将原始数据按业务需求分类处理：

**日常汇总 (Daily Summary)**
```php
$dailyData[$date] = [
    'date' => $date,
    'total_visits' => 累计访问量,
    'unique_visitors' => 独立访客数,
    'page_views' => 页面浏览量,
    'bounce_rate' => 跳出率,
    'avg_session_duration' => 平均会话时长
];
```

**小时流量 (Hourly Traffic)**
```php
$hourlyData[$date_$hour] = [
    'date' => $date,
    'hour' => $hour,
    'visits' => 该小时访问量,
    'unique_visitors' => 该小时独立访客
];
```

**流量来源 (Traffic Sources)**
```php
$sourceData[$date_$source] = [
    'date' => $date,
    'source_type' => 'referral',
    'source_name' => $source,
    'visits' => 来源访问量,
    'conversions' => 转化量
];
```

**页面性能 (Page Performance)**
```php
$pageData[$date_$pageHash] = [
    'date' => $date,
    'page_url' => $page,
    'page_views' => 页面浏览量,
    'unique_page_views' => 独立页面浏览量,
    'avg_time_on_page' => 平均停留时间,
    'bounce_rate' => 页面跳出率
];
```

### 3. 数据库设计

#### 📋 表结构设计
采用垂直分表策略，将不同维度的分析数据存储在独立表中：

**analytics_daily_summary** - 日常汇总表
- 存储每日的访问统计数据
- 用于趋势分析和总体概览

**analytics_hourly_traffic** - 小时流量表  
- 存储每小时的流量分布
- 用于流量高峰分析

**analytics_traffic_sources** - 流量来源表
- 存储不同来源的流量数据
- 用于渠道效果分析

**analytics_page_performance** - 页面性能表
- 存储页面级别的性能数据
- 用于页面优化分析

#### 🔧 数据库优化
- **索引策略**: 在date字段上创建索引，提高查询性能
- **数据类型**: 使用适当的数据类型减少存储空间
- **事务处理**: 使用事务确保数据导入的原子性

### 4. 处理结果

经过处理后的数据分布：
- **日常汇总**: 26条记录 (按日期聚合)
- **小时流量**: 575条记录 (按日期+小时聚合)  
- **流量来源**: 26条记录 (按日期+来源聚合)
- **页面性能**: 26条记录 (按日期+页面聚合)

## 🚀 系统功能

### API接口
- `GET /index/test_db` - 数据库连接测试
- `GET /index/init_db` - 数据库初始化和数据导入
- `GET /index/api_dashboard_summary` - 仪表板汇总数据
- `GET /index/api_daily_summary` - 日常汇总数据
- `GET /index/api_hourly_traffic` - 小时流量数据
- `GET /index/api_traffic_sources` - 流量来源数据
- `GET /index/api_page_performance` - 页面性能数据

### 页面路由
- `GET /index/index` - 系统首页
- `GET /index/modern` - 现代风格仪表板
- `GET /index/business` - 商务风格仪表板

## 🔧 部署说明

### 1. 环境要求
- PHP 7.0+
- SQLite3 扩展
- ThinkPHP 5.1框架

### 2. 部署步骤

**上传文件**
```bash
# 上传到ThinkPHP应用目录
application/analysis18/
├── controller/Index.php
├── scripts/import_data.php  
├── database.php
└── static/data/b_analytics.json
```

**初始化数据库**
```bash
# 访问初始化接口
http://your-domain.com/analysis18.php/index/init_db
```

**验证部署**
```bash
# 测试数据库连接
http://your-domain.com/analysis18.php/index/test_db

# 访问仪表板
http://your-domain.com/analysis18.php/index/business
```

### 3. 性能优化

**内存管理**
- 流式处理避免内存溢出
- 分批处理大数据集
- 及时释放不需要的变量

**查询优化**  
- 使用索引提高查询速度
- 限制查询结果集大小
- 缓存常用查询结果

## 📊 数据可视化

### Chart.js集成
- 折线图: 显示访问趋势
- 柱状图: 显示流量分布  
- 饼图: 显示来源占比
- 面积图: 显示累计数据

### 响应式设计
- 支持桌面和移动设备
- 自适应图表大小
- 现代化UI界面

## 🔍 故障排除

### 常见问题

**内存不足错误**
```php
// 解决方案：使用流式处理
ini_set('memory_limit', '512M');
set_time_limit(0);
```

**数据库连接失败**
```php
// 检查SQLite扩展
if (!extension_loaded('sqlite3')) {
    echo "需要安装SQLite3扩展";
}
```

**JSON文件不存在**
```bash
# 确保文件路径正确
application/analysis18/static/data/b_analytics.json
```

## 📈 系统优势

- ✅ **高性能**: SQLite本地数据库，查询速度快
- ✅ **可扩展**: 模块化设计，易于扩展新功能
- ✅ **低维护**: 无需复杂的数据库服务器配置
- ✅ **数据安全**: 本地存储，数据完全可控
- ✅ **实时分析**: 支持实时数据查询和可视化

## 🎯 未来规划

- [ ] 添加数据导出功能
- [ ] 实现数据自动更新
- [ ] 增加更多图表类型
- [ ] 添加用户权限管理
- [ ] 支持多数据源集成

---

**项目状态**: ✅ 生产就绪  
**最后更新**: 2025-09-03  
**版本**: v1.0.0