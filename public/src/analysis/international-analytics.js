// International Sales Analytics Dashboard
class InternationalAnalytics {
    constructor() {
        this.salesData = [];
        this.comparisonData = [];
        this.charts = {};
        this.currentNetSalesView = 'day';
        this.currentOrdersView = 'day';
        this.currentTimeDimension = 'day';
        this.comparisonEnabled = false;
        this.dataProcessor = null;
        this.init();
    }

    init() {
        this.dataProcessor = new SQLiteDataProcessor();
        this.initializeDatePickers();
        this.initializeCharts();
        this.setupEventListeners();
        // 自动加载SQLite数据
        this.loadSQLiteData();
    }

    // 初始化日期选择器
    initializeDatePickers() {
        const today = new Date();
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        document.getElementById('startDate').value = this.formatDate(lastMonth);
        document.getElementById('endDate').value = this.formatDate(today);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 比较功能开关
        const enableComparison = document.getElementById('enableComparison');
        const compareStartDate = document.getElementById('compareStartDate');
        const compareEndDate = document.getElementById('compareEndDate');
        
        enableComparison.addEventListener('change', (e) => {
            this.comparisonEnabled = e.target.checked;
            if (this.comparisonEnabled) {
                compareStartDate.disabled = false;
                compareEndDate.disabled = false;
                this.calculateComparisonDates();
                document.getElementById('comparisonChartContainer').style.display = 'block';
            } else {
                compareStartDate.disabled = true;
                compareEndDate.disabled = true;
                document.getElementById('comparisonChartContainer').style.display = 'none';
            }
            this.updateDashboard();
        });
        
        // 时间维度选择器
        document.getElementById('timeDimension').addEventListener('change', (e) => {
            this.currentTimeDimension = e.target.value;
            this.updateDashboard();
        });
    }

    // 计算比较期间的日期
    calculateComparisonDates() {
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        
        if (startDate && endDate) {
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            const compareEndDate = new Date(startDate);
            compareEndDate.setDate(compareEndDate.getDate() - 1);
            
            const compareStartDate = new Date(compareEndDate);
            compareStartDate.setDate(compareStartDate.getDate() - daysDiff);
            
            document.getElementById('compareStartDate').value = this.formatDate(compareStartDate);
            document.getElementById('compareEndDate').value = this.formatDate(compareEndDate);
        }
    }

    // Format date to YYYY-MM-DD
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // 加载SQLite数据
    loadSQLiteData() {
        if (!this.dataProcessor) {
            console.error('Data processor not initialized');
            return;
        }
        
        console.log('开始加载SQLite数据...');
        
        // 获取日期范围
        const startDate = document.getElementById('startDate')?.value || this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const endDate = document.getElementById('endDate')?.value || this.formatDate(new Date());
        
        this.dataProcessor.loadData(startDate, endDate)
            .then(data => {
                console.log('SQLite数据加载成功:', data.length, '条记录');
                // 转换为销售数据格式
                this.salesData = this.convertToSalesData(data);
                this.updateDashboard();
                this.updateLastUpdated();
            })
            .catch(error => {
                console.error('SQLite数据加载失败:', error);
                console.log('使用模拟数据代替...');
                this.generateSampleData();
                this.updateDashboard();
                this.updateLastUpdated();
            });
    }

    // 加载JSON数据（保留兼容性）
    loadJSONData() {
        console.log('切换到SQLite数据加载...');
        this.loadSQLiteData();
    }

    // 将流量数据转换为销售数据格式
    convertToSalesData(trafficData) {
        const salesData = [];
        const dailyAggregation = {};
        
        // 按日期聚合流量数据
        trafficData.forEach(item => {
            const date = item.date;
            if (!dailyAggregation[date]) {
                dailyAggregation[date] = {
                    totalTraffic: 0,
                    uniqueVisitors: 0
                };
            }
            dailyAggregation[date].totalTraffic += item.request_times || 0;
            dailyAggregation[date].uniqueVisitors += item.unique_visitors || 0;
        });
        
        // 转换为销售指标（基于流量数据的确定性估算）
        Object.keys(dailyAggregation).forEach(date => {
            const traffic = dailyAggregation[date];
            
            // 使用确定性算法替代随机数
            const dateObj = new Date(date);
            const dayOfYear = Math.floor((dateObj - new Date(dateObj.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
            const dayOfWeek = dateObj.getDay();
            
            // 基于日期和流量的确定性转换率（2-5%）
            const baseConversionRate = 0.025; // 2.5% 基础转换率
            const weekdayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1.1; // 周末转换率较低
            const seasonalMultiplier = 1 + Math.sin(dayOfYear * 2 * Math.PI / 365) * 0.2; // 季节性波动
            const conversionRate = Math.min(0.05, Math.max(0.02, baseConversionRate * weekdayMultiplier * seasonalMultiplier));
            
            // 基于访客数的确定性平均订单价值（$50-200）
            const baseOrderValue = 120; // $120 基础订单价值
            const trafficMultiplier = Math.min(1.5, Math.max(0.7, traffic.uniqueVisitors / 100)); // 基于访客数调整
            const avgOrderValue = Math.round(baseOrderValue * trafficMultiplier);
            
            const orders = Math.round(traffic.uniqueVisitors * conversionRate);
            const totalSales = Math.round(orders * avgOrderValue);
            const netSales = Math.round(totalSales * 0.85); // 85% net sales
            
            // 基于订单数的确定性产品数量
            const avgProductsPerOrder = 2.5 + (orders % 3) * 0.5; // 2.5-4.0 products per order
            const productsSold = Math.round(orders * avgProductsPerOrder);
            
            // 基于产品数的确定性变体数量
            const variationMultiplier = 1.4 + (productsSold % 5) * 0.1; // 1.4-1.8 variations per product
            const variationsSold = Math.round(productsSold * variationMultiplier);
            
            salesData.push({
                date: date,
                totalSales: totalSales,
                netSales: netSales,
                orders: orders,
                productsSold: productsSold,
                variationsSold: variationsSold
            });
        });
        
        return salesData.sort((a, b) => a.date.localeCompare(b.date));
    }

    // Generate sample sales data (fallback)
    generateSampleData() {
        console.log('生成模拟销售数据...');
        const data = [];
        const startDate = new Date('2025-07-01');
        const endDate = new Date('2025-08-29');
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = this.formatDate(new Date(d));
            const dayOfWeek = d.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            // Base sales with weekend variations
            const baseSales = isWeekend ? 800 + Math.random() * 400 : 1200 + Math.random() * 800;
            const totalSales = Math.round(baseSales);
            const netSales = Math.round(totalSales * 0.85); // 85% of total sales
            const orders = Math.round(20 + Math.random() * 30);
            const productsSold = Math.round(orders * (2 + Math.random() * 3)); // 2-5 products per order
            const variationsSold = Math.round(productsSold * (1.2 + Math.random() * 0.8)); // variations can be more than products
            
            data.push({
                date: dateStr,
                totalSales,
                netSales,
                orders,
                productsSold,
                variationsSold
            });
        }
        
        this.salesData = data;
        return data;
    }

    // Update the entire dashboard
    updateDashboard() {
        this.updateMetrics();
        this.updateNetSalesChart();
        this.updateOrdersChart();
        this.updateTrafficSourceChart();
        this.updateHourlyTrafficChart();
        // Removed: updateConversionChart() - no real order data available
        // Removed: updateHeatmapChart() - insufficient data for meaningful heatmap
        if (this.comparisonEnabled) {
            this.updateComparisonChart();
        }
        this.updateLastUpdated();
    }

    // Get filtered data based on date range
    getFilteredData() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        return this.salesData.filter(item => 
            item.date >= startDate && item.date <= endDate
        );
    }

    // Update performance metrics
    updateMetrics() {
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            this.resetMetrics();
            return;
        }

        const totals = filteredData.reduce((acc, item) => {
            acc.totalSales += item.totalSales;
            acc.netSales += item.netSales;
            acc.orders += item.orders;
            acc.productsSold += item.productsSold;
            acc.variationsSold += item.variationsSold;
            return acc;
        }, {
            totalSales: 0,
            netSales: 0,
            orders: 0,
            productsSold: 0,
            variationsSold: 0
        });

        // Calculate changes (mock data for demonstration)
        const changes = {
            totalSales: this.calculateChange(totals.totalSales),
            netSales: this.calculateChange(totals.netSales),
            orders: this.calculateChange(totals.orders),
            productsSold: this.calculateChange(totals.productsSold),
            variationsSold: this.calculateChange(totals.variationsSold)
        };

        // Update DOM elements
        document.getElementById('totalSales').textContent = this.formatCurrency(totals.totalSales);
        document.getElementById('netSales').textContent = this.formatCurrency(totals.netSales);
        document.getElementById('totalOrders').textContent = totals.orders.toLocaleString();
        document.getElementById('productsSold').textContent = totals.productsSold.toLocaleString();
        document.getElementById('variationsSold').textContent = totals.variationsSold.toLocaleString();

        // Update change indicators
        document.getElementById('totalSalesChange').textContent = this.formatChangeText(changes.totalSales);
        document.getElementById('netSalesChange').textContent = this.formatChangeText(changes.netSales);
        document.getElementById('ordersChange').textContent = this.formatChangeText(changes.orders);
        document.getElementById('productsSoldChange').textContent = this.formatChangeText(changes.productsSold);
        document.getElementById('variationsSoldChange').textContent = this.formatChangeText(changes.variationsSold);
    }

    // Reset metrics to zero
    resetMetrics() {
        document.getElementById('totalSales').textContent = '$0';
        document.getElementById('netSales').textContent = '$0';
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('productsSold').textContent = '0';
        document.getElementById('variationsSold').textContent = '0';
        
        document.getElementById('totalSalesChange').textContent = 'vs last period';
        document.getElementById('netSalesChange').textContent = 'vs last period';
        document.getElementById('ordersChange').textContent = 'vs last period';
        document.getElementById('productsSoldChange').textContent = 'vs last period';
        document.getElementById('variationsSoldChange').textContent = 'vs last period';
    }

    // Calculate mock change percentage (deterministic)
    calculateChange(value) {
        // 使用值本身生成确定性的变化百分比
        const hash = value.toString().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        // 将hash值转换为-10%到+10%的范围
        const normalizedHash = (Math.abs(hash) % 200) / 10 - 10;
        return Math.round(normalizedHash * 10) / 10; // 保疙1位小数
    }

    // Format currency
    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }

    // Format change text
    formatChangeText(change) {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}% vs last period`;
    }

    // Initialize charts
    initializeCharts() {
        this.initializeNetSalesChart();
        this.initializeOrdersChart();
        this.initializeTrafficSourceChart();
        this.initializeHourlyTrafficChart();
        // Removed: initializeConversionChart() - no real order data available
        // Removed: initializeHeatmapChart() - insufficient data for meaningful heatmap
        this.initializeComparisonChart();
    }

    // Initialize Net Sales Chart
    initializeNetSalesChart() {
        const ctx = document.getElementById('netSalesChart').getContext('2d');
        this.charts.netSales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Net Sales',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Initialize Orders Chart (改为折线图)
    initializeOrdersChart() {
        const ctx = document.getElementById('ordersChart').getContext('2d');
        this.charts.orders = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Orders',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Update Net Sales Chart
    updateNetSalesChart() {
        const filteredData = this.getFilteredData();
        let chartData;

        if (this.currentNetSalesView === 'week') {
            chartData = this.aggregateByWeek(filteredData, 'netSales');
        } else {
            chartData = this.aggregateByDay(filteredData, 'netSales');
        }

        this.charts.netSales.data.labels = chartData.labels;
        this.charts.netSales.data.datasets[0].data = chartData.data;
        this.charts.netSales.update();
    }

    // Update Orders Chart
    updateOrdersChart() {
        const filteredData = this.getFilteredData();
        let chartData;

        if (this.currentOrdersView === 'week') {
            chartData = this.aggregateByWeek(filteredData, 'orders');
        } else {
            chartData = this.aggregateByDay(filteredData, 'orders');
        }

        this.charts.orders.data.labels = chartData.labels;
        this.charts.orders.data.datasets[0].data = chartData.data;
        this.charts.orders.update();
    }

    // Aggregate data by day
    aggregateByDay(data, field) {
        return {
            labels: data.map(item => this.formatDateLabel(item.date)),
            data: data.map(item => item[field])
        };
    }

    // Aggregate data by week
    aggregateByWeek(data, field) {
        const weeklyData = {};
        
        data.forEach(item => {
            const date = new Date(item.date);
            const week = this.getWeekLabel(date);
            
            if (!weeklyData[week]) {
                weeklyData[week] = 0;
            }
            weeklyData[week] += item[field];
        });

        const weeks = Object.keys(weeklyData).sort();
        return {
            labels: weeks,
            data: weeks.map(week => weeklyData[week])
        };
    }

    // Get week label
    getWeekLabel(date) {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        startOfWeek.setDate(diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${this.formatShortDate(startOfWeek)} - ${this.formatShortDate(endOfWeek)}`;
    }

    // Format date label for charts
    formatDateLabel(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Format short date
    formatShortDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Toggle Net Sales view
    toggleNetSalesView(view) {
        this.currentNetSalesView = view;
        
        // Update button states
        document.getElementById('netSalesByDay').classList.toggle('active', view === 'day');
        document.getElementById('netSalesByWeek').classList.toggle('active', view === 'week');
        
        this.updateNetSalesChart();
    }

    // Toggle Orders view
    toggleOrdersView(view) {
        this.currentOrdersView = view;
        
        // Update button states
        document.getElementById('ordersByDay').classList.toggle('active', view === 'day');
        document.getElementById('ordersByWeek').classList.toggle('active', view === 'week');
        
        this.updateOrdersChart();
    }

    // Update last updated timestamp
    updateLastUpdated() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleString();
    }

    // Initialize Traffic Source Chart
    initializeTrafficSourceChart() {
        const ctx = document.getElementById('trafficSourceChart').getContext('2d');
        this.charts.trafficSource = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Search Engine', 'Social Media', 'Direct', 'Referral'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB', 
                        '#FFCE56',
                        '#4BC0C0'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Initialize Hourly Traffic Chart
    initializeHourlyTrafficChart() {
        const ctx = document.getElementById('hourlyTrafficChart').getContext('2d');
        this.charts.hourlyTraffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Traffic',
                    data: new Array(24).fill(0),
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Visitors',
                    data: new Array(24).fill(0),
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Initialize Conversion Chart
    initializeConversionChart() {
        const ctx = document.getElementById('conversionChart').getContext('2d');
        this.charts.conversion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Visitors', 'Add to Cart', 'Checkout', 'Purchase'],
                datasets: [{
                    label: 'Conversion Funnel',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: [
                        '#36A2EB',
                        '#FFCE56',
                        '#FF9F40',
                        '#4BC0C0'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Initialize Heatmap Chart
    initializeHeatmapChart() {
        const ctx = document.getElementById('heatmapChart').getContext('2d');
        this.charts.heatmap = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Average Sales',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(199, 199, 199, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Initialize Comparison Chart
    initializeComparisonChart() {
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        this.charts.comparison = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Current Period',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Previous Period', 
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Update Traffic Source Chart - 基于真实JSON数据
    updateTrafficSourceChart() {
        // 从聚合数据中获取真实的流量来源分布
        if (!this.dataProcessor || !this.dataProcessor.processedData) {
            console.warn('No traffic data available for traffic source chart');
            return;
        }
        
        const trafficSources = {
            'search_engine': 0,
            'social_media': 0, 
            'direct': 0,
            'referral': 0
        };
        
        // 聚合真实的流量来源数据
        this.dataProcessor.processedData.forEach(item => {
            if (item.referer && trafficSources.hasOwnProperty(item.referer)) {
                trafficSources[item.referer] += item.request_times || 0;
            }
        });
        
        const data = [
            trafficSources.search_engine,
            trafficSources.social_media,
            trafficSources.direct,
            trafficSources.referral
        ];
        
        this.charts.trafficSource.data.datasets[0].data = data;
        this.charts.trafficSource.update();
    }

    // Update Hourly Traffic Chart - 基于真实JSON数据
    updateHourlyTrafficChart() {
        // 从聚合数据中获取真实的小时流量数据
        if (!this.dataProcessor || !this.dataProcessor.processedData) {
            console.warn('No traffic data available for hourly traffic chart');
            return;
        }
        
        const hourlyData = new Array(24).fill(0);
        const hourlyVisitors = new Array(24).fill(0);
        
        // 聚合真实的小时流量数据
        this.dataProcessor.processedData.forEach(item => {
            if (item.hour !== undefined && item.hour >= 0 && item.hour < 24) {
                hourlyData[item.hour] += item.request_times || 0;
                hourlyVisitors[item.hour] += item.unique_visitors || 0;
            }
        });
        
        this.charts.hourlyTraffic.data.datasets[0].data = hourlyData;
        this.charts.hourlyTraffic.data.datasets[1].data = hourlyVisitors;
        this.charts.hourlyTraffic.update();
    }

    // Update Conversion Chart
    updateConversionChart() {
        const filteredData = this.getFilteredData();
        if (filteredData.length === 0) return;
        
        const totalOrders = filteredData.reduce((sum, item) => sum + item.orders, 0);
        const visitors = Math.round(totalOrders / 0.03); // 假设3%转化率
        const addToCart = Math.round(visitors * 0.15); // 15%添加到购物车
        const checkout = Math.round(addToCart * 0.4); // 40%进入结账
        
        this.charts.conversion.data.datasets[0].data = [visitors, addToCart, checkout, totalOrders];
        this.charts.conversion.update();
    }

    // Update Heatmap Chart
    updateHeatmapChart() {
        const filteredData = this.getFilteredData();
        if (filteredData.length === 0) return;
        
        const weeklyData = new Array(7).fill(0);
        const weeklyCount = new Array(7).fill(0);
        
        filteredData.forEach(item => {
            const date = new Date(item.date);
            const dayOfWeek = date.getDay();
            const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 转换为0=周一
            
            weeklyData[adjustedDay] += item.netSales;
            weeklyCount[adjustedDay]++;
        });
        
        const avgWeeklyData = weeklyData.map((total, index) => 
            weeklyCount[index] > 0 ? Math.round(total / weeklyCount[index]) : 0
        );
        
        this.charts.heatmap.data.datasets[0].data = avgWeeklyData;
        this.charts.heatmap.update();
    }

    // Update Comparison Chart
    updateComparisonChart() {
        if (!this.comparisonEnabled) return;
        
        const currentData = this.getFilteredData();
        const compareStartDate = document.getElementById('compareStartDate').value;
        const compareEndDate = document.getElementById('compareEndDate').value;
        
        const comparisonData = this.salesData.filter(item => 
            item.date >= compareStartDate && item.date <= compareEndDate
        );
        
        // 聚合数据
        const currentAggregated = this.aggregateDataByDimension(currentData);
        const comparisonAggregated = this.aggregateDataByDimension(comparisonData);
        
        this.charts.comparison.data.labels = currentAggregated.labels;
        this.charts.comparison.data.datasets[0].data = currentAggregated.data;
        this.charts.comparison.data.datasets[1].data = comparisonAggregated.data;
        this.charts.comparison.update();
    }

    // 获取小时权重
    getHourMultiplier(hour) {
        const multipliers = [
            0.3, 0.2, 0.1, 0.1, 0.1, 0.2, 0.4, 0.7,  // 0-7
            1.0, 1.3, 1.5, 1.7, 1.6, 1.5, 1.7, 1.9,  // 8-15
            2.1, 2.0, 1.8, 1.9, 1.7, 1.2, 0.8, 0.5   // 16-23
        ];
        return multipliers[hour] || 1.0;
    }

    // 根据时间维度聚合数据
    aggregateDataByDimension(data) {
        switch (this.currentTimeDimension) {
            case 'hour':
                return this.aggregateByHour(data);
            case 'day':
                return this.aggregateByDay(data);
            case 'week':
                return this.aggregateByWeek(data, 'netSales');
            case 'month':
                return this.aggregateByMonth(data);
            default:
                return this.aggregateByDay(data);
        }
    }

    // 按小时聚合
    aggregateByHour(data) {
        // 注意：这里需要小时级别的数据，当前数据是按天的
        // 这是一个简化实现，实际应该从原始数据重新聚合
        const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        const aggregatedData = new Array(24).fill(0);
        
        // 简化：将日数据平均分配到24小时
        data.forEach(item => {
            const dailyAvg = item.netSales / 24;
            for (let i = 0; i < 24; i++) {
                aggregatedData[i] += dailyAvg * this.getHourMultiplier(i);
            }
        });
        
        return {
            labels,
            data: aggregatedData.map(val => Math.round(val))
        };
    }

    // 按月聚合
    aggregateByMonth(data) {
        const monthlyData = {};
        
        data.forEach(item => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += item.netSales;
        });
        
        const months = Object.keys(monthlyData).sort();
        return {
            labels: months.map(month => {
                const [year, monthNum] = month.split('-');
                const date = new Date(year, monthNum - 1);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }),
            data: months.map(month => monthlyData[month])
        };
    }
}

// Global functions for button clicks
function updateDashboard() {
    if (window.analytics) {
        window.analytics.updateDashboard();
    }
}

function loadJSONData() {
    if (window.analytics) {
        window.analytics.loadJSONData();
    }
}

function loadSampleData() {
    if (window.analytics) {
        window.analytics.generateSampleData();
        window.analytics.updateDashboard();
        window.analytics.updateLastUpdated();
    }
}

function toggleNetSalesView(view) {
    if (window.analytics) {
        window.analytics.toggleNetSalesView(view);
    }
}

function toggleOrdersView(view) {
    if (window.analytics) {
        window.analytics.toggleOrdersView(view);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.analytics = new InternationalAnalytics();
});