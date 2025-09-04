# 国际销售数据分析系统

## 📊 项目概述

基于ThinkPHP 5.1框架的国际销售数据分析系统，使用SQLite数据库存储和分析销售数据，提供现代化的数据可视化界面。

## 🏗️ 技术栈

- **后端框架**: ThinkPHP 5.1
- **数据库**: SQLite 3
- **前端**: HTML5 + CSS3 + JavaScript + Chart.js
- **数据处理**: PHP流式处理

## 📁 目录结构

```
application/analysis18/
├── controller/
│   └── Index.php              # 主控制器
├── view/index/
│   ├── modern.html           # 现代风格仪表板
│   ├── business.html         # 商务风格仪表板
│   └── demo.html             # 功能演示
├── scripts/
│   └── import_data.php       # 数据导入脚本
├── static/                   # 静态资源目录
│   ├── css/                  # 样式文件
│   ├── js/                   # JavaScript文件
│   └── data/                 # 数据文件
├── database.php              # 数据库配置
└── README.md                 # 项目文档
```

## 🚀 快速开始

### 1. 部署文件
将项目文件上传到ThinkPHP应用目录

### 2. 初始化数据库
访问: `http://your-domain.com/analysis18.php/index/init_db`

### 3. 访问仪表板
- 现代风格: `http://your-domain.com/analysis18.php/index/modern`
- 商务风格: `http://your-domain.com/analysis18.php/index/business`

## 📊 主要功能

- 📈 实时数据可视化
- 🕐 多时间维度分析
- 🔄 时间段对比
- 🎯 流量来源分析
- 📱 响应式设计

## 🔧 API接口

- `GET /index/api_dashboard_summary` - 仪表板汇总数据
- `GET /index/api_daily_summary` - 日常汇总数据
- `GET /index/api_hourly_traffic` - 小时流量数据
- `GET /index/api_traffic_sources` - 流量来源数据

## 📄 许可证

MIT License

---

**版本**: v1.0.0  
**最后更新**: 2025-09-04