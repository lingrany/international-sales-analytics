<?php
/**
 * SQLite数据库初始化脚本
 * 创建分析表并导入JSON数据
 */

// 数据库文件路径
$dbPath = __DIR__ . '/data/analytics.db';
$dataPath = __DIR__ . '/static/data/b_analytics.json';

// 创建data目录
if (!is_dir(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0755, true);
}

try {
    // 连接SQLite数据库
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ SQLite数据库连接成功\n";
    
    // 创建分析表
    $createTables = [
        // 日常汇总表
        'analytics_daily_summary' => "
            CREATE TABLE IF NOT EXISTS analytics_daily_summary (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                total_visits INTEGER DEFAULT 0,
                unique_visitors INTEGER DEFAULT 0,
                page_views INTEGER DEFAULT 0,
                bounce_rate REAL DEFAULT 0,
                avg_session_duration INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
        
        // 小时流量表
        'analytics_hourly_traffic' => "
            CREATE TABLE IF NOT EXISTS analytics_hourly_traffic (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                hour INTEGER NOT NULL,
                visits INTEGER DEFAULT 0,
                unique_visitors INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
        
        // 流量来源表
        'analytics_traffic_sources' => "
            CREATE TABLE IF NOT EXISTS analytics_traffic_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                source_type TEXT NOT NULL,
                source_name TEXT NOT NULL,
                visits INTEGER DEFAULT 0,
                conversions INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
        
        // 页面性能表
        'analytics_page_performance' => "
            CREATE TABLE IF NOT EXISTS analytics_page_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                page_url TEXT NOT NULL,
                page_views INTEGER DEFAULT 0,
                unique_page_views INTEGER DEFAULT 0,
                avg_time_on_page INTEGER DEFAULT 0,
                bounce_rate REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )"
    ];
    
    // 执行建表语句
    foreach ($createTables as $tableName => $sql) {
        $pdo->exec($sql);
        echo "✅ 创建表: {$tableName}\n";
    }
    
    // 检查JSON数据文件是否存在
    if (!file_exists($dataPath)) {
        echo "⚠️  JSON数据文件不存在: {$dataPath}\n";
        echo "请确保数据文件存在后再运行数据导入\n";
        exit;
    }
    
    // 读取JSON数据
    $jsonData = file_get_contents($dataPath);
    $data = json_decode($jsonData, true);
    
    if (!$data) {
        echo "❌ JSON数据解析失败\n";
        exit;
    }
    
    echo "📊 JSON数据加载成功，共 " . count($data) . " 条记录\n";
    
    // 数据分类和插入
    $dailyData = [];
    $hourlyData = [];
    $sourceData = [];
    $pageData = [];
    
    foreach ($data as $record) {
        $date = date('Y-m-d', strtotime($record['timestamp'] ?? 'now'));
        $hour = date('H', strtotime($record['timestamp'] ?? 'now'));
        
        // 日常汇总数据
        if (!isset($dailyData[$date])) {
            $dailyData[$date] = [
                'date' => $date,
                'total_visits' => 0,
                'unique_visitors' => 0,
                'page_views' => 0,
                'bounce_rate' => 0,
                'avg_session_duration' => 0
            ];
        }
        $dailyData[$date]['total_visits']++;
        $dailyData[$date]['page_views'] += $record['page_views'] ?? 1;
        
        // 小时流量数据
        $hourKey = $date . '_' . $hour;
        if (!isset($hourlyData[$hourKey])) {
            $hourlyData[$hourKey] = [
                'date' => $date,
                'hour' => (int)$hour,
                'visits' => 0,
                'unique_visitors' => 0
            ];
        }
        $hourlyData[$hourKey]['visits']++;
        
        // 流量来源数据
        $source = $record['traffic_source'] ?? 'direct';
        $sourceKey = $date . '_' . $source;
        if (!isset($sourceData[$sourceKey])) {
            $sourceData[$sourceKey] = [
                'date' => $date,
                'source_type' => 'referral',
                'source_name' => $source,
                'visits' => 0,
                'conversions' => 0
            ];
        }
        $sourceData[$sourceKey]['visits']++;
        
        // 页面性能数据
        $page = $record['page_url'] ?? '/';
        $pageKey = $date . '_' . md5($page);
        if (!isset($pageData[$pageKey])) {
            $pageData[$pageKey] = [
                'date' => $date,
                'page_url' => $page,
                'page_views' => 0,
                'unique_page_views' => 0,
                'avg_time_on_page' => 0,
                'bounce_rate' => 0
            ];
        }
        $pageData[$pageKey]['page_views']++;
        $pageData[$pageKey]['avg_time_on_page'] += $record['session_duration'] ?? 0;
    }
    
    // 插入日常汇总数据
    $stmt = $pdo->prepare("INSERT INTO analytics_daily_summary (date, total_visits, unique_visitors, page_views, bounce_rate, avg_session_duration) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($dailyData as $row) {
        $stmt->execute([
            $row['date'],
            $row['total_visits'],
            $row['unique_visitors'],
            $row['page_views'],
            $row['bounce_rate'],
            $row['avg_session_duration']
        ]);
    }
    echo "✅ 插入日常汇总数据: " . count($dailyData) . " 条\n";
    
    // 插入小时流量数据
    $stmt = $pdo->prepare("INSERT INTO analytics_hourly_traffic (date, hour, visits, unique_visitors) VALUES (?, ?, ?, ?)");
    foreach ($hourlyData as $row) {
        $stmt->execute([
            $row['date'],
            $row['hour'],
            $row['visits'],
            $row['unique_visitors']
        ]);
    }
    echo "✅ 插入小时流量数据: " . count($hourlyData) . " 条\n";
    
    // 插入流量来源数据
    $stmt = $pdo->prepare("INSERT INTO analytics_traffic_sources (date, source_type, source_name, visits, conversions) VALUES (?, ?, ?, ?, ?)");
    foreach ($sourceData as $row) {
        $stmt->execute([
            $row['date'],
            $row['source_type'],
            $row['source_name'],
            $row['visits'],
            $row['conversions']
        ]);
    }
    echo "✅ 插入流量来源数据: " . count($sourceData) . " 条\n";
    
    // 插入页面性能数据
    $stmt = $pdo->prepare("INSERT INTO analytics_page_performance (date, page_url, page_views, unique_page_views, avg_time_on_page, bounce_rate) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($pageData as $row) {
        $stmt->execute([
            $row['date'],
            $row['page_url'],
            $row['page_views'],
            $row['unique_page_views'],
            $row['avg_time_on_page'],
            $row['bounce_rate']
        ]);
    }
    echo "✅ 插入页面性能数据: " . count($pageData) . " 条\n";
    
    // 验证数据
    $tables = ['analytics_daily_summary', 'analytics_hourly_traffic', 'analytics_traffic_sources', 'analytics_page_performance'];
    foreach ($tables as $table) {
        $count = $pdo->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
        echo "📊 {$table}: {$count} 条记录\n";
    }
    
    echo "\n🎉 SQLite数据库初始化完成！\n";
    echo "数据库文件: {$dbPath}\n";
    
} catch (Exception $e) {
    echo "❌ 错误: " . $e->getMessage() . "\n";
}
?>