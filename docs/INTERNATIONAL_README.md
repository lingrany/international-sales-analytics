# International Sales Analytics Dashboard

## 概述
为海外客户创建的销售数据分析仪表盘，提供实时销售数据监控和分析功能，支持多维度数据对比和深度分析。

## 功能特性

### 1. 📅 Date Range & Comparison（日期范围和对比）
**当前周期设置：**
- 开始日期和结束日期选择器
- 支持自定义时间跨度查询
- 默认显示最近30天数据

**对比功能：**
- ✅ **启用/禁用对比功能**
- 自动计算对比周期（上一个相同长度的周期）
- 支持自定义对比周期设置
- 对比数据可视化展示

**时间维度选择：**
- ✅ **By Hour**（按小时）- 24小时数据分析
- ✅ **By Day**（按天）- 日度趋势分析
- ✅ **By Week**（按周）- 周度对比分析  
- ✅ **By Month**（按月）- 月度增长分析

### 2. 📈 Performance（性能指标）
包含五个核心销售指标，分两行显示：

**第一行（3个指标）：**
- **Total Sales** - 总销售额（含税收和费用）
- **Net Sales** - 净销售额（扣除税收和费用后）
- **Orders** - 订单数量

**第二行（2个指标）：**
- **Products Sold** - 已售产品数量
- **Variations Sold** - 已售产品变体数量

每个指标都显示：
- 当前周期数值
- 与上一周期的变化百分比

### 3. 📊 Charts（图表分析）
提供两个主要图表，垂直排列：

**Net Sales Chart（净销售额图表）：**
- 线性图表显示趋势
- 右上角切换按钮：By Day / By Week
- 支持日视图和周视图切换

**Orders Chart（订单图表）：**
- 柱状图显示数据
- 右上角切换按�tml:parameter>
- 支持日视图和周视图切换

## 技术实现

### 文件结构
- `international.html` - 主页面文件
- `international-analytics.js` - 数据处理和图表逻辑

### 使用的技术栈
- **Chart.js** - 图表渲染
- **Tailwind CSS** - 样式框架
- **Vanilla JavaScript** - 交互逻辑
- **HTML5** - 页面结构

### 数据处理
- 自动生成模拟销售数据
- 支持日期范围过滤
- 支持日/周数据聚合
- 实时计算性能指标

## 使用方法

### 1. 启动服务器
```bash
cd d:\Codebuddylab\Dataanlylist
python -m http.server 8080
```

### 2. 访问页面
在浏览器中打开：`http://localhost:8080/international.html`

### 3. 操作步骤
1. 点击"Load Sample Data"加载示例数据
2. 选择日期范围
3. 点击"Update Data"更新显示
4. 使用图表右上角的"By Day"/"By Week"按钮切换视图

## 数据说明

### 模拟数据特征
- 时间范围：2025年7月1日 - 2025年8月29日
- 周末销售额相对较低
- 包含真实的业务关系（如订单数与产品销量的关联）
- 变体数量通常大于产品数量

### 指标计算
- **Net Sales** = Total Sales × 85%（模拟扣除费用）
- **Products Sold** = Orders × 2-5（每订单平均产品数）
- **Variations Sold** = Products Sold × 1.2-2.0（变体倍数）

## 未来扩展

根据 `time.png` 和 `weidu.png` 的要求，后续将添加：
- 时间维度分析
- 地理维度分析
- 更多业务指标
- 高级筛选功能
- 数据导出功能

## 注意事项
- 当前使用模拟数据，实际部署时需要连接真实数据源
- 图表自适应不同屏幕尺寸
- 支持现代浏览器（Chrome, Firefox, Safari, Edge）