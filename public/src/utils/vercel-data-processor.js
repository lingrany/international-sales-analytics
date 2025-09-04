// Vercel环境数据处理工具类
// 专为Vercel静态部署环境设计，不依赖PHP后端
class VercelDataProcessor {
    constructor() {
        this.processedData = null;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
        this.isVercelEnvironment = this.detectVercelEnvironment();
    }

    /**
     * 检测是否在Vercel环境中
     */
    detectVercelEnvironment() {
        return window.location.hostname.includes('vercel.app') || 
               window.location.hostname.includes('vercel.com') ||
               window.location.protocol === 'https:';
    }

    /**
     * 加载数据（主要入口方法）
     */
    async loadData(startDate = null, endDate = null) {
        try {
            // 设置默认日期范围
            if (!startDate) {
                const today = new Date();
                const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                startDate = this.formatDate(lastMonth);
            }
            if (!endDate) {
                endDate = this.formatDate(new Date());
            }

            console.log(`Vercel环境加载数据: ${startDate} 到 ${endDate}`);

            // 检查缓存
            const cacheKey = `${startDate}_${endDate}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log('使用缓存数据');
                    this.processedData = cached.data;
                    return this.processedData;
                }
            }

            // 尝试加载预处理的JSON数据
            const data = await this.loadPreprocessedData(startDate, endDate);
            
            // 缓存数据
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            this.processedData = data;
            console.log('Vercel数据加载完成，共', data.length, '条记录');
            return data;

        } catch (error) {
            console.error('Vercel数据加载失败:', error);
            console.log('使用模拟数据代替...');
            this.generateMockData();
            return this.processedData;
        }
    }

    /**
     * 加载预处理的JSON数据
     */
    async loadPreprocessedData(startDate, endDate) {
        try {
            // 尝试加载预处理的汇总数据
            const response = await fetch('../data/processed/analytics_summary.json');
            
            if (response.ok) {
                const summaryData = await response.json();
                console.log('加载预处理数据成功');
                return this.filterDataByDateRange(summaryData, startDate, endDate);
            } else {
                throw new Error('预处理数据不存在');
            }
        } catch (error) {
            console.log('预处理数据加载失败，尝试原始数据...');
            return await this.loadAndProcessRawData(startDate, endDate);
        }
    }

    /**
     * 加载并处理原始数据（优化版本）
     */
    async loadAndProcessRawData(startDate, endDate) {
        try {
            console.log('开始加载原始JSON数据...');
            
            // 使用流式处理或分块加载
            const response = await fetch('../data/external/test_honeywhale_.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 检查文件大小
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
                console.log('文件较大，使用分块处理...');
                return await this.processLargeFile(response, startDate, endDate);
            } else {
                const data = await response.json();
                return this.processRawData(data, startDate, endDate);
            }

        } catch (error) {
            console.error('原始数据加载失败:', error);
            throw error;
        }
    }

    /**
     * 处理大文件（分块读取）
     */
    async processLargeFile(response, startDate, endDate) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let processedCount = 0;
        const results = [];

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // 处理完整的JSON对象
                let braceCount = 0;
                let start = 0;
                
                for (let i = 0; i < buffer.length; i++) {
                    if (buffer[i] === '{') braceCount++;
                    if (buffer[i] === '}') braceCount--;
                    
                    if (braceCount === 0 && buffer[i] === '}') {
                        const jsonStr = buffer.substring(start, i + 1);
                        try {
                            const record = JSON.parse(jsonStr);
                            if (this.isInDateRange(record, startDate, endDate)) {
                                results.push(this.processRecord(record));
                            }
                            processedCount++;
                            
                            if (processedCount % 1000 === 0) {
                                console.log(`已处理 ${processedCount} 条记录`);
                            }
                        } catch (e) {
                            // 忽略解析错误的记录
                        }
                        start = i + 1;
                    }
                }
                
                buffer = buffer.substring(start);
            }
            
            console.log(`分块处理完成，共处理 ${processedCount} 条记录`);
            return this.aggregateResults(results);
            
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * 处理原始数据
     */
    processRawData(rawData, startDate, endDate) {
        console.log('开始处理原始数据...');
        
        let records = [];
        
        // 提取数据记录
        if (Array.isArray(rawData)) {
            for (const item of rawData) {
                if (item.type === 'table' && item.data && Array.isArray(item.data)) {
                    records = records.concat(item.data);
                }
            }
        } else if (rawData.data && Array.isArray(rawData.data)) {
            records = rawData.data;
        } else if (Array.isArray(rawData)) {
            records = rawData;
        }

        console.log(`提取到 ${records.length} 条原始记录`);

        // 过滤日期范围并处理
        const filteredRecords = records.filter(record => 
            this.isInDateRange(record, startDate, endDate)
        );

        console.log(`日期范围内记录: ${filteredRecords.length} 条`);

        // 转换为兼容格式
        return this.convertToCompatibleFormat(filteredRecords);
    }

    /**
     * 检查记录是否在日期范围内
     */
    isInDateRange(record, startDate, endDate) {
        const recordDate = record.date || this.extractDateFromTimestamp(record.timestamp);
        return recordDate && recordDate >= startDate && recordDate <= endDate;
    }

    /**
     * 从时间戳提取日期
     */
    extractDateFromTimestamp(timestamp) {
        if (!timestamp) return null;
        try {
            return new Date(timestamp).toISOString().split('T')[0];
        } catch (e) {
            return null;
        }
    }

    /**
     * 转换为兼容格式
     */
    convertToCompatibleFormat(records) {
        const aggregated = new Map();
        
        records.forEach(record => {
            const date = record.date || this.extractDateFromTimestamp(record.timestamp);
            const hour = record.hour !== undefined ? record.hour : 
                         (record.timestamp ? new Date(record.timestamp).getHours() : 0);
            const referer = this.normalizeReferer(record.referer || record.referrer || 'direct');
            
            const key = `${date}_${hour}_${referer}`;
            
            if (!aggregated.has(key)) {
                aggregated.set(key, {
                    date: date,
                    referer: referer,
                    hour: hour,
                    request_times: 0,
                    unique_visitors: 0
                });
            }
            
            const item = aggregated.get(key);
            item.request_times += parseInt(record.request_times || record.visits || 1);
            item.unique_visitors += parseInt(record.unique_visitors || record.visitors || 1);
        });
        
        return Array.from(aggregated.values());
    }

    /**
     * 标准化来源
     */
    normalizeReferer(referer) {
        if (!referer || referer === '') return 'direct';
        
        const ref = referer.toLowerCase();
        
        if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) {
            return 'search_engine';
        }
        
        if (ref.includes('facebook') || ref.includes('twitter') || ref.includes('instagram')) {
            return 'social_media';
        }
        
        if (ref === 'direct') return 'direct';
        
        return 'referral';
    }

    /**
     * 按日期范围过滤数据
     */
    filterDataByDateRange(data, startDate, endDate) {
        return data.filter(item => 
            item.date >= startDate && item.date <= endDate
        );
    }

    /**
     * 生成模拟数据（备用方案）
     */
    generateMockData() {
        console.log('生成Vercel环境模拟数据...');
        
        const data = [];
        const sources = ['search_engine', 'social_media', 'direct', 'referral'];
        const startDate = new Date('2025-08-01');
        const endDate = new Date('2025-09-04');
        
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
        console.log('Vercel模拟数据生成完成:', data.length, '条记录');
    }

    /**
     * 获取小时权重
     */
    getHourMultiplier(hour) {
        const multipliers = [
            0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.4, 0.6,  // 0-7
            0.8, 1.2, 1.4, 1.6, 1.5, 1.4, 1.6, 1.8,  // 8-15
            2.0, 1.9, 1.7, 2.2, 2.0, 1.5, 0.8, 0.4   // 16-23
        ];
        return multipliers[hour] || 1.0;
    }

    /**
     * 获取来源权重
     */
    getSourceMultiplier(source) {
        const multipliers = {
            'search_engine': 2.5,
            'social_media': 1.8,
            'direct': 1.5,
            'referral': 0.8
        };
        return multipliers[source] || 1.0;
    }

    /**
     * 格式化日期
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * 获取处理后的数据
     */
    getData() {
        return this.processedData || [];
    }

    /**
     * 按日期范围过滤数据
     */
    filterByDateRange(startDate, endDate) {
        if (!this.processedData) return [];
        
        return this.processedData.filter(item => 
            item.date >= startDate && item.date <= endDate
        );
    }

    /**
     * 按来源分组统计
     */
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

    /**
     * 按小时分组统计
     */
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

    /**
     * 按日期分组统计
     */
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

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
        console.log('Vercel缓存已清除');
    }

    /**
     * 获取缓存信息
     */
    getCacheInfo() {
        return {
            size: this.cache.size,
            timeout: this.cacheTimeout,
            keys: Array.from(this.cache.keys()),
            environment: 'Vercel'
        };
    }
}

// 导出Vercel数据处理器
window.VercelDataProcessor = VercelDataProcessor;