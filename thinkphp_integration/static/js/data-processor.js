// 数据处理工具类
class DataProcessor {
    constructor() {
        this.rawData = null;
        this.processedData = null;
    }

    // 加载并处理JSON数据
    async loadData(jsonFile = '/analysis18.php/index/static_file/data/test_honeywhale_.json') {
        try {
            console.log('开始加载数据文件...');
            const response = await fetch(jsonFile);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.rawData = data;
            
            console.log('数据加载成功，开始处理...');
            this.processData();
            
            return this.processedData;
        } catch (error) {
            console.error('数据加载失败:', error);
            console.log('使用模拟数据代替...');
            this.generateMockData();
            return this.processedData;
        }
    }

    // 处理原始JSON数据
    processData() {
        if (!this.rawData) {
            console.error('没有原始数据可处理');
            return;
        }

        console.log('原始数据结构:', this.rawData);
        
        // 查找访问日志数据
        const analyticsLogs = this.extractAnalyticsLogs();
        
        // 查找统计数据
        const statisticsData = this.extractStatisticsData();
        
        console.log('提取到访问日志:', analyticsLogs.length, '条');
        console.log('提取到统计数据:', statisticsData.length, '条');

        // 如果有统计数据，直接使用；否则从日志数据生成
        if (statisticsData.length > 0) {
            this.processedData = this.formatStatisticsData(statisticsData);
        } else if (analyticsLogs.length > 0) {
            this.processedData = this.generateStatisticsFromLogs(analyticsLogs);
        } else {
            console.warn('没有找到有效数据，生成模拟数据');
            this.generateMockData();
        }

        console.log('数据处理完成，共', this.processedData.length, '条记录');
    }

    // 提取访问日志数据
    extractAnalyticsLogs() {
        const logs = [];
        
        if (Array.isArray(this.rawData)) {
            for (const item of this.rawData) {
                if (item.type === 'table' && item.name === 'b_analytics' && item.data) {
                    return item.data;
                }
            }
        }
        
        return logs;
    }

    // 提取统计数据
    extractStatisticsData() {
        const stats = [];
        
        if (Array.isArray(this.rawData)) {
            for (const item of this.rawData) {
                if (item.type === 'table' && item.data && Array.isArray(item.data)) {
                    // 检查是否包含统计字段
                    for (const record of item.data) {
                        if (record.date && record.referer && record.hour !== undefined) {
                            stats.push(record);
                        }
                    }
                }
            }
        }
        
        return stats;
    }

    // 格式化统计数据
    formatStatisticsData(data) {
        return data.map(record => ({
            date: record.date,
            referer: this.normalizeReferer(record.referer),
            hour: parseInt(record.hour),
            request_times: parseInt(record.request_times || 0),
            unique_visitors: parseInt(record.unique_visitors || 0)
        }));
    }

    // 从访问日志生成统计数据
    generateStatisticsFromLogs(logs) {
        const stats = new Map();
        
        logs.forEach(log => {
            if (!log.timestamp || !log.referrer) return;
            
            const date = this.extractDate(log.timestamp);
            const hour = this.extractHour(log.timestamp);
            const referer = this.classifyReferer(log.referrer);
            
            const key = `${date}-${hour}-${referer}`;
            
            if (!stats.has(key)) {
                stats.set(key, {
                    date,
                    referer,
                    hour,
                    request_times: 0,
                    unique_visitors: new Set()
                });
            }
            
            const stat = stats.get(key);
            stat.request_times++;
            if (log.ip) {
                stat.unique_visitors.add(log.ip);
            }
        });
        
        // 转换为最终格式
        return Array.from(stats.values()).map(stat => ({
            date: stat.date,
            referer: stat.referer,
            hour: stat.hour,
            request_times: stat.request_times,
            unique_visitors: stat.unique_visitors.size
        }));
    }

    // 提取日期
    extractDate(timestamp) {
        const date = new Date(timestamp);
        return date.toISOString().split('T')[0];
    }

    // 提取小时
    extractHour(timestamp) {
        const date = new Date(timestamp);
        return date.getHours();
    }

    // 分类来源
    classifyReferer(referrer) {
        if (!referrer || referrer === '') {
            return 'direct';
        }
        
        const ref = referrer.toLowerCase();
        
        if (ref.includes('google.com') || ref.includes('bing.com') || ref.includes('yahoo.com')) {
            return 'search_engine';
        }
        
        if (ref.includes('facebook.com') || ref.includes('twitter.com') || ref.includes('instagram.com')) {
            return 'social_media';
        }
        
        return 'referral';
    }

    // 标准化来源
    normalizeReferer(referer) {
        const normalized = {
            'search_engine': 'search_engine',
            'social_media': 'social_media',
            'direct': 'direct',
            'referral': 'referral',
            'google': 'search_engine',
            'facebook': 'social_media',
            'twitter': 'social_media'
        };
        
        return normalized[referer] || 'referral';
    }

    // 生成模拟数据
    generateMockData() {
        console.log('生成模拟数据...');
        
        const data = [];
        const sources = ['search_engine', 'social_media', 'direct', 'referral'];
        const startDate = new Date('2025-08-01');
        const endDate = new Date('2025-08-13');
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            for (let hour = 0; hour < 24; hour++) {
                for (let source of sources) {
                    const baseTraffic = Math.random() * 50 + 5;
                    const hourMultiplier = this.getHourMultiplier(hour);
                    const sourceMultiplier = this.getSourceMultiplier(source);
                    
                    const requestTimes = Math.floor(baseTraffic * hourMultiplier * sourceMultiplier);
                    const uniqueVisitors = Math.floor(requestTimes * (0.6 + Math.random() * 0.3));
                    
                    data.push({
                        date: this.formatDate(new Date(d)),
                        referer: source,
                        hour: hour,
                        request_times: requestTimes,
                        unique_visitors: uniqueVisitors
                    });
                }
            }
        }
        
        this.processedData = data;
        console.log('模拟数据生成完成:', data.length, '条记录');
    }

    // 获取小时权重
    getHourMultiplier(hour) {
        // 基于真实用户行为的访问模式
        const multipliers = [
            0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.4, 0.6,  // 0-7
            0.8, 1.2, 1.4, 1.6, 1.5, 1.4, 1.6, 1.8,  // 8-15
            2.0, 1.9, 1.7, 2.2, 2.0, 1.5, 0.8, 0.4   // 16-23
        ];
        return multipliers[hour] || 1.0;
    }

    // 获取来源权重
    getSourceMultiplier(source) {
        const multipliers = {
            'search_engine': 2.5,
            'social_media': 1.8,
            'direct': 1.5,
            'referral': 0.8
        };
        return multipliers[source] || 1.0;
    }

    // 格式化日期
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // 获取处理后的数据
    getData() {
        return this.processedData || [];
    }

    // 按日期范围过滤数据
    filterByDateRange(startDate, endDate) {
        if (!this.processedData) return [];
        
        return this.processedData.filter(item => 
            item.date >= startDate && item.date <= endDate
        );
    }

    // 按来源分组统计
    groupBySource(data = null) {
        const targetData = data || this.processedData;
        if (!targetData) return {};
        
        const grouped = {};
        targetData.forEach(item => {
            if (!grouped[item.referer]) {
                grouped[item.referer] = {
                    total_requests: 0,
                    total_visitors: 0,
                    count: 0
                };
            }
            grouped[item.referer].total_requests += item.request_times;
            grouped[item.referer].total_visitors += item.unique_visitors;
            grouped[item.referer].count++;
        });
        
        return grouped;
    }

    // 按小时分组统计
    groupByHour(data = null) {
        const targetData = data || this.processedData;
        if (!targetData) return {};
        
        const grouped = {};
        for (let hour = 0; hour < 24; hour++) {
            grouped[hour] = {
                total_requests: 0,
                total_visitors: 0,
                count: 0
            };
        }
        
        targetData.forEach(item => {
            grouped[item.hour].total_requests += item.request_times;
            grouped[item.hour].total_visitors += item.unique_visitors;
            grouped[item.hour].count++;
        });
        
        return grouped;
    }

    // 按日期分组统计
    groupByDate(data = null) {
        const targetData = data || this.processedData;
        if (!targetData) return {};
        
        const grouped = {};
        targetData.forEach(item => {
            if (!grouped[item.date]) {
                grouped[item.date] = {
                    total_requests: 0,
                    total_visitors: 0,
                    count: 0
                };
            }
            grouped[item.date].total_requests += item.request_times;
            grouped[item.date].total_visitors += item.unique_visitors;
            grouped[item.date].count++;
        });
        
        return grouped;
    }
}

// 导出数据处理器
window.DataProcessor = DataProcessor;