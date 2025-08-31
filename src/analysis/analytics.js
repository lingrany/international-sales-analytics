// 全局变量
let analyticsData = [];
let charts = {};
let dataProcessor = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    dataProcessor = new DataProcessor();
    initializeDatePickers();
    initializeCharts();
    // 自动加载数据
    loadDefaultData();
});

// 初始化日期选择器
function initializeDatePickers() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('startDate').value = formatDate(lastWeek);
    document.getElementById('endDate').value = formatDate(today);
}

// 格式化日期
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// 加载JSON数据
function loadDefaultData() {
    if (!dataProcessor) {
        console.error('数据处理器未初始化');
        return;
    }
    
    console.log('开始加载数据...');
    
    dataProcessor.loadData('test_honeywhale_.json')
        .then(data => {
            console.log('数据加载成功:', data.length, '条记录');
            analyticsData = data;
            updateCharts();
            updateMetrics();
            updateTable();
        })
        .catch(error => {
            console.error('数据加载失败:', error);
            // 如果无法加载JSON，生成模拟数据
            generateMockData();
            updateCharts();
            updateMetrics();
            updateTable();
        });
}

// 生成模拟数据（当JSON加载失败时使用）
function generateMockData() {
    if (dataProcessor) {
        dataProcessor.generateMockData();
        analyticsData = dataProcessor.getData();
        console.log('模拟数据生成成功:', analyticsData.length, '条记录');
    } else {
        // 后备方案
        analyticsData = [];
        const sources = ['search_engine', 'social_media', 'direct', 'referral'];
        const startDate = new Date('2025-08-01');
        const endDate = new Date('2025-08-13');
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            for (let hour = 0; hour < 24; hour++) {
                for (let source of sources) {
                    const baseTraffic = Math.random() * 100 + 10;
                    const hourMultiplier = getHourMultiplier(hour);
                    const sourceMultiplier = getSourceMultiplier(source);
                    
                    analyticsData.push({
                        date: formatDate(new Date(d)),
                        referer: source,
                        hour: hour,
                        request_times: Math.floor(baseTraffic * hourMultiplier * sourceMultiplier),
                        unique_visitors: Math.floor(baseTraffic * hourMultiplier * sourceMultiplier * 0.7)
                    });
                }
            }
        }
    }
}

// 获取小时权重
function getHourMultiplier(hour) {
    // 模拟真实的访问模式：工作时间和晚上访问量较高
    if (hour >= 9 && hour <= 18) return 1.5;
    if (hour >= 19 && hour <= 22) return 1.8;
    if (hour >= 0 && hour <= 6) return 0.3;
    return 1.0;
}

// 获取来源权重
function getSourceMultiplier(source) {
    const multipliers = {
        'search_engine': 2.0,
        'social_media': 1.2,
        'direct': 1.5,
        'referral': 0.8
    };
    return multipliers[source] || 1.0;
}

// 初始化图表
function initializeCharts() {
    // 流量来源分布 - 饼图
    const sourceCtx = document.getElementById('trafficSourceChart').getContext('2d');
    charts.sourceChart = new Chart(sourceCtx, {
        type: 'doughnut',
        data: {
            labels: ['搜索引擎', '社交媒体', '直接访问', '推荐网站'],
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

    // 24小时流量趋势 - 线图
    const hourlyCtx = document.getElementById('hourlyTrafficChart').getContext('2d');
    charts.hourlyChart = new Chart(hourlyCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: '访问量',
                data: new Array(24).fill(0),
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: '独立访客',
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

    // 日流量趋势 - 柱状图
    const dailyCtx = document.getElementById('dailyTrafficChart').getContext('2d');
    charts.dailyChart = new Chart(dailyCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '访问量',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: '#36A2EB',
                borderWidth: 1
            }, {
                label: '独立访客',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: '#FF6384',
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
            }
        }
    });

    // 访客vs访问量对比 - 散点图
    const visitorCtx = document.getElementById('visitorVsViewChart').getContext('2d');
    charts.visitorChart = new Chart(visitorCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '访客 vs 访问量',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: '#FF6384',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '独立访客数'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '访问量'
                    }
                }
            }
        }
    });

    // 热力图 - 柱状图模拟
    const heatmapCtx = document.getElementById('heatmapChart').getContext('2d');
    charts.heatmapChart = new Chart(heatmapCtx, {
        type: 'bar',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '平均访问量',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 205, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)'
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
            }
        }
    });
}

// 更新图表数据
function updateCharts() {
    if (analyticsData.length === 0) {
        console.log('没有数据，生成模拟数据');
        generateMockData();
    }

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // 过滤日期范围内的数据
    const filteredData = analyticsData.filter(item => 
        item.date >= startDate && item.date <= endDate
    );

    // 更新流量来源分布
    updateSourceChart(filteredData);
    
    // 更新24小时趋势
    updateHourlyChart(filteredData);
    
    // 更新日趋势
    updateDailyChart(filteredData);
    
    // 更新访客vs访问量
    updateVisitorChart(filteredData);
    
    // 更新热力图
    updateHeatmapChart(filteredData);
}

// 更新流量来源图表
function updateSourceChart(data) {
    const sourceMap = {
        'search_engine': 0,
        'social_media': 1, 
        'direct': 2,
        'referral': 3
    };
    
    const sourceTotals = [0, 0, 0, 0];
    
    data.forEach(item => {
        const index = sourceMap[item.referer];
        if (index !== undefined) {
            sourceTotals[index] += item.request_times;
        }
    });
    
    charts.sourceChart.data.datasets[0].data = sourceTotals;
    charts.sourceChart.update();
}

// 更新24小时趋势图表
function updateHourlyChart(data) {
    const hourlyViews = new Array(24).fill(0);
    const hourlyVisitors = new Array(24).fill(0);
    
    data.forEach(item => {
        hourlyViews[item.hour] += item.request_times;
        hourlyVisitors[item.hour] += item.unique_visitors;
    });
    
    charts.hourlyChart.data.datasets[0].data = hourlyViews;
    charts.hourlyChart.data.datasets[1].data = hourlyVisitors;
    charts.hourlyChart.update();
}

// 更新日趋势图表
function updateDailyChart(data) {
    const dailyData = {};
    
    data.forEach(item => {
        if (!dailyData[item.date]) {
            dailyData[item.date] = { views: 0, visitors: 0 };
        }
        dailyData[item.date].views += item.request_times;
        dailyData[item.date].visitors += item.unique_visitors;
    });
    
    const dates = Object.keys(dailyData).sort();
    const views = dates.map(date => dailyData[date].views);
    const visitors = dates.map(date => dailyData[date].visitors);
    
    charts.dailyChart.data.labels = dates;
    charts.dailyChart.data.datasets[0].data = views;
    charts.dailyChart.data.datasets[1].data = visitors;
    charts.dailyChart.update();
}

// 更新访客vs访问量图表
function updateVisitorChart(data) {
    const scatterData = [];
    const dailyData = {};
    
    data.forEach(item => {
        if (!dailyData[item.date]) {
            dailyData[item.date] = { views: 0, visitors: 0 };
        }
        dailyData[item.date].views += item.request_times;
        dailyData[item.date].visitors += item.unique_visitors;
    });
    
    Object.values(dailyData).forEach(day => {
        scatterData.push({
            x: day.visitors,
            y: day.views
        });
    });
    
    charts.visitorChart.data.datasets[0].data = scatterData;
    charts.visitorChart.update();
}

// 更新热力图
function updateHeatmapChart(data) {
    const weeklyData = new Array(7).fill(0);
    const weeklyCount = new Array(7).fill(0);
    
    data.forEach(item => {
        const date = new Date(item.date);
        const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ...
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 转换为0=周一
        
        weeklyData[adjustedDay] += item.request_times;
        weeklyCount[adjustedDay]++;
    });
    
    // 计算平均值
    const avgWeeklyData = weeklyData.map((total, index) => 
        weeklyCount[index] > 0 ? Math.round(total / weeklyCount[index]) : 0
    );
    
    charts.heatmapChart.data.datasets[0].data = avgWeeklyData;
    charts.heatmapChart.update();
}

// 更新关键指标
function updateMetrics() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const filteredData = analyticsData.filter(item => 
        item.date >= startDate && item.date <= endDate
    );
    
    const totalViews = filteredData.reduce((sum, item) => sum + item.request_times, 0);
    const totalVisitors = filteredData.reduce((sum, item) => sum + item.unique_visitors, 0);
    
    document.getElementById('totalViews').textContent = totalViews.toLocaleString();
    document.getElementById('uniqueVisitors').textContent = totalVisitors.toLocaleString();
    
    // 计算平均访问时长（模拟）
    const avgDuration = Math.round((totalViews / totalVisitors) * 2.5) || 0;
    document.getElementById('avgDuration').textContent = `${avgDuration}分钟`;
    
    // 计算跳出率（模拟）
    const bounceRate = Math.round((1 - (totalVisitors / totalViews)) * 100) || 0;
    document.getElementById('bounceRate').textContent = `${bounceRate}%`;
}

// 更新数据表格
function updateTable() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const filteredData = analyticsData.filter(item => 
        item.date >= startDate && item.date <= endDate
    ).slice(0, 100); // 限制显示前100条
    
    const tableBody = document.getElementById('dataTable');
    tableBody.innerHTML = '';
    
    filteredData.forEach(item => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td class="px-4 py-2 border-b">${item.date}</td>
            <td class="px-4 py-2 border-b">${getSourceName(item.referer)}</td>
            <td class="px-4 py-2 border-b">${item.hour}:00</td>
            <td class="px-4 py-2 border-b">${item.request_times}</td>
            <td class="px-4 py-2 border-b">${item.unique_visitors}</td>
        `;
    });
}

// 获取来源中文名称
function getSourceName(referer) {
    const nameMap = {
        'search_engine': '搜索引擎',
        'social_media': '社交媒体',
        'direct': '直接访问',
        'referral': '推荐网站'
    };
    return nameMap[referer] || referer;
}

// 导出数据
function exportData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const filteredData = analyticsData.filter(item => 
        item.date >= startDate && item.date <= endDate
    );
    
    const csv = [
        ['日期', '来源', '小时', '访问次数', '独立访客'],
        ...filteredData.map(item => [
            item.date,
            getSourceName(item.referer),
            item.hour,
            item.request_times,
            item.unique_visitors
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `honeywhale_analytics_${startDate}_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}