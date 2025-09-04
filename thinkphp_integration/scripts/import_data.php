<?php
/**
 * 数据导入脚本
 * 独立处理JSON数据导入到SQLite
 */

// 设置内存和时间限制
ini_set('memory_limit', '512M');
set_time_limit(0); // 无时间限制

// 获取脚本目录
$scriptDir = __DIR__;
$appDir = dirname($scriptDir); // analysis18目录

// 文件路径
$dbPath = $appDir . '/data/analytics.db';
$dataPath = $appDir . '/static/data/b_analytics.json';

echo "=== SQLite数据导入脚本 ===\n";
echo "数据库路径: {$dbPath}\n";
echo "JSON文件路径: {$dataPath}\n\n";

try {
    // 创建data目录
    if (!is_dir($appDir . '/data')) {
        mkdir($appDir . '/data', 0755, true);
        echo "✅ 创建data目录\n";
    }
    
    // 连接SQLite数据库
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ SQLite数据库连接成功\n";
    
    // 创建分析表
    $createTables = [
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
        
        'analytics_hourly_traffic' => "
            CREATE TABLE IF NOT EXISTS analytics_hourly_traffic (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                hour INTEGER NOT NULL,
                visits INTEGER DEFAULT 0,
                unique_visitors INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
        
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
    
    // 检查JSON数据文件
    if (!file_exists($dataPath)) {
        throw new Exception("JSON数据文件不存在: {$dataPath}");
    }
    
    $fileSize = filesize($dataPath);
    echo "📊 JSON文件大小: " . round($fileSize / 1024 / 1024, 2) . " MB\n";
    
    // 清空现有数据
    echo "🗑️  清空现有数据...\n";
    $pdo->exec("DELETE FROM analytics_daily_summary");
    $pdo->exec("DELETE FROM analytics_hourly_traffic");
    $pdo->exec("DELETE FROM analytics_traffic_sources");
    $pdo->exec("DELETE FROM analytics_page_performance");
    
    // 开始事务
    $pdo->beginTransaction();
    
    // 分批读取和处理JSON数据
    echo "📊 开始分批处理JSON数据...\n";
    
    $handle = fopen($dataPath, 'r');
    if (!$handle) {
        throw new Exception('无法打开JSON文件');
    }
    
    // 跳过开头的 '['
    $firstChar = fgetc($handle);
    if ($firstChar !== '[') {
        fclose($handle);
        throw new Exception('JSON格式错误，应该以[开头');
    }
    
    $dailyData = [];
    $hourlyData = [];
    $sourceData = [];
    $pageData = [];
    $processedCount = 0;
    $batchSize = 1000;
    
    $buffer = '';
    $inRecord = false;
    $braceCount = 0;
    
    while (!feof($handle)) {
        $char = fgetc($handle);
        
        if ($char === '{') {
            $inRecord = true;
            $braceCount = 1;
            $buffer = '{';
        } elseif ($inRecord) {
            $buffer .= $char;
            
            if ($char === '{') {
                $braceCount++;
            } elseif ($char === '}') {
                $braceCount--;
                
                if ($braceCount === 0) {
                    // 完整的记录读取完成
                    $record = json_decode($buffer, true);
                    if ($record) {
                        processRecord($record, $dailyData, $hourlyData, $sourceData, $pageData);
                        $processedCount++;
                        
                        // 每处理1000条记录输出一次进度
                        if ($processedCount % $batchSize === 0) {
                            echo "📊 已处理 {$processedCount} 条记录\n";
                            // 释放内存
                            if ($processedCount % 5000 === 0) {
                                gc_collect_cycles();
                                echo "🧹 内存清理完成\n";
                            }
                        }
                    }
                    
                    $inRecord = false;
                    $buffer = '';
                }
            }
        }
    }
    
    fclose($handle);
    echo "📊 JSON数据处理完成，共处理 {$processedCount} 条记录\n";
    
    // 插入汇总数据到数据库
    echo "💾 开始插入数据到数据库...\n";
    
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
    
    // 提交事务
    $pdo->commit();
    
    // 验证数据
    echo "\n📊 数据验证:\n";
    $tables = ['analytics_daily_summary', 'analytics_hourly_traffic', 'analytics_traffic_sources', 'analytics_page_performance'];
    foreach ($tables as $table) {
        $count = $pdo->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
        echo "📊 {$table}: {$count} 条记录\n";
    }
    
    echo "\n🎉 数据导入完成！\n";
    echo "数据库文件: {$dbPath}\n";
    echo "总处理记录: {$processedCount} 条\n";
    
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    echo "❌ 错误: " . $e->getMessage() . "\n";
    exit(1);
}

/**
 * 处理单条记录
 */
function processRecord($record, &$dailyData, &$hourlyData, &$sourceData, &$pageData)
{
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

echo "\n脚本执行完成。\n";
?>