# 📊 International Sales Analytics Dashboard

> 一个功能强大的国际销售数据分析仪表板，提供实时数据监控和可视化分析

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-3.x-ff6384.svg)](https://www.chartjs.org/)

## ✨ 特性

- 📈 **实时数据可视化** - 支持多种图表类型展示销售数据
- 🕐 **多时间维度分析** - 按小时、天、周、月进行数据统计
- 🔄 **时间段对比** - 支持不同时间段的数据对比分析
- 🎯 **流量来源分析** - 详细的访问来源和用户行为分析
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **现代化UI** - 采用玻璃拟态设计和渐变色彩
- 🚀 **高性能数据处理** - SQLite数据库支持，性能提升10-20倍
- 💾 **智能缓存机制** - 减少重复查询，提升用户体验

## 🚀 快速开始

### 在线预览

```bash
# 克隆项目
git clone https://github.com/yourusername/international-sales-analytics.git
cd international-sales-analytics

# 启动服务器
python start_server.py
```

访问 http://localhost:8080/assets/international.html 查看仪表板

### 页面版本

- **主版本**: `assets/international.html` - 完整功能的现代化界面
- **商务版**: `assets/international-business.html` - 专业商务风格
- **简化版**: `assets/index.html` - 轻量级版本



## 🛠️ 技术栈

- **前端框架**: 原生JavaScript (ES6+)
- **图表库**: Chart.js 3.x
- **样式**: CSS3 + Tailwind CSS
- **数据处理**: SQLiteDataProcessor + DataProcessor类
- **数据库**: SQLite 3 (高性能数据存储)
- **后端API**: PHP (数据查询接口)
- **服务器**: Python HTTP Server

## 📁 项目结构

```
international-sales-analytics/
├── 📂 public/                 # 前端项目目录
│   ├── 📂 api/               # SQLite API接口
│   │   ├── analytics_api.php  # 数据查询API
│   │   ├── init_database.php  # 数据库初始化
│   │   ├── database.php       # 数据库配置
│   │   └── 📂 data/          # SQLite数据库文件
│   ├── 📂 src/               # 源代码
│   │   ├── 📂 analysis/      # 数据分析脚本
│   │   └── 📂 utils/         # 工具函数
│   │       ├── data-processor.js        # 原始数据处理器
│   │       └── sqlite-data-processor.js # SQLite数据处理器
│   ├── 📂 assets/            # 静态资源
│   │   ├── 🌐 *.html        # 页面文件
│   │   ├── 🎨 *.css         # 样式文件
│   │   └── 🖼️ *.png         # 图片资源
│   ├── 📂 data/external/     # 外部数据源
│   ├── sqlite_test.html      # SQLite系统测试页面
│   └── README_SQLite.md      # SQLite系统文档
├── 📂 thinkphp_integration/   # ThinkPHP集成版本
│   ├── 📂 controller/        # 控制器
│   ├── 📂 view/             # 视图模板
│   ├── 📂 static/           # 静态资源
│   └── 📂 scripts/          # 数据处理脚本
└── 📂 docs/                  # 项目文档
```

## 🎯 核心功能

### 📊 数据可视化
- 销售趋势图表
- 订单量统计
- 流量来源分布
- 24小时访问趋势

### 📅 时间分析
- 自定义时间范围选择
- 多时间维度切换
- 同比环比分析
- 实时数据更新

### 🔍 深度分析
- 转化漏斗分析
- 用户行为热力图
- 地域分布统计
- 设备来源分析

## 🚀 部署方式

### 本地开发
```bash
# 方式一：Python脚本（推荐）
python start_server.py

# 方式二：批处理文件（Windows）
start_server.bat

# 方式三：手动启动
python -m http.server 8080
```

### 生产部署
```bash
# 使用Nginx
sudo cp -r . /var/www/html/analytics/

# 或使用Apache
sudo cp -r . /var/www/html/analytics/
```

## 🚀 SQLite数据处理系统

### 高性能数据处理
为了解决直接处理大JSON文件的性能问题，项目引入了SQLite数据库支持：

- **性能提升**: 查询速度提升10-20倍
- **内存优化**: 内存占用减少5-10倍  
- **流式处理**: 支持处理几十MB的大文件
- **智能缓存**: 5分钟缓存机制，减少重复查询

### 快速开始
```bash
# 访问SQLite测试页面
http://localhost:8080/public/sqlite_test.html

# 初始化数据库
http://localhost:8080/public/api/analytics_api.php?action=init_db

# 查看详细文档
public/README_SQLite.md
```

### 两种数据处理方式

**传统方式** (适合小数据量)
```javascript
const processor = new DataProcessor();
await processor.loadData('../data/external/test_data.json');
```

**SQLite方式** (推荐，适合大数据量)
```javascript
const processor = new SQLiteDataProcessor();
await processor.loadData('2025-08-01', '2025-08-31');
```

## 📊 数据格式

支持JSON格式的数据输入，示例：

```json
{
  "date": "2025-08-31",
  "referer": "search_engine",
  "hour": 14,
  "request_times": 150,
  "unique_visitors": 120
}
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v1.2.0 (2025-09-04)
- 🚀 新增SQLite数据处理系统
- ⚡ 性能提升10-20倍，内存占用减少5-10倍
- 🔧 添加流式处理技术，支持大文件处理
- 📊 创建完整的API接口和测试工具
- 📚 完善项目文档和使用指南

### v1.1.0 (2025-09-03)
- 🔧 添加ThinkPHP 5.1集成支持
- 📁 规范化项目结构和文档
- 🛠️ 优化代码组织和配置管理

### v1.0.0 (2025-08-31)
- ✨ 初始版本发布
- 📊 完整的数据可视化功能
- 🎨 现代化UI设计
- 📱 响应式布局支持

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

- **lingrany** - *Initial work* - [lingrany](https://github.com/lingrany)

## 🙏 致谢

- [Chart.js](https://www.chartjs.org/) - 优秀的图表库
- [Tailwind CSS](https://tailwindcss.com/) - 实用的CSS框架
- 所有贡献者和用户的支持

---

⭐ 如果这个项目对你有帮助，请给它一个星标！

📧 有问题或建议？[提交Issue](https://github.com/lingrany/international-sales-analytics/issues)