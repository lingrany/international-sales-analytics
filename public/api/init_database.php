<?php
/**
 * 数据库初始化和数据导入脚本
 * 将JSON数据导入SQLite数据库
 */

// 设置内存和时间限制
ini_set('memory_limit', '512M');
set_time_limit(0);

// 数据库配置
$config = include __DIR__ . '/database.php';
$dbPath = $config['database'];

// 确保数据目录存在
$dataDir = dirname($dbPath);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

try {
    // 连接SQLite数据库
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "数据库连接成功\n";
    
    // 创建表结构
    createTables($pdo);
    
    // 导入数据
    importData($pdo);
    
    echo "数据库初始化完成！\n";
    
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}

/**
 * 创建数据表
 */
function createTables($pdo) {
    echo "创建数据表...\n";
    
    // 删除已存在的表
    $dropTables = [
        'DROP TABLE IF EXISTS analytics_daily_summary',
        'DROP TABLE IF EXISTS analytics_hourly_traffic', 
        'DROP TABLE IF EXISTS analytics_traffic_sources',
        'DROP TABLE IF EXISTS analytics_page_performance'
    ];
    
    foreach ($dropTables as $sql) {
        $pdo->exec($sql);
    }
    
    // 创建日常汇总表
    $pdo->exec("
        CREATE TABLE analytics_daily_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            total_visits INTEGER DEFAULT 0,
            unique_visitors INTEGER DEFAULT 0,
            page_views INTEGER DEFAULT 0,
            bounce_rate REAL DEFAULT 0,
            avg_session_duration REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date)
        )
    ");
    
    // 创建小时流量表
    $pdo->exec("
        CREATE TABLE analytics_hourly_traffic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            hour INTEGER NOT NULL,
            visits INTEGER DEFAULT 0,
            unique_visitors INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, hour)
        )
    ");
    
    // 创建流量来源表
    $pdo->exec("
        CREATE TABLE analytics_traffic_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_name TEXT NOT NULL,
            visits INTEGER DEFAULT 0,
            conversions INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, source_name)
        )
    ");
    
    // 创建页面性能表
    $pdo->exec("
        CREATE TABLE analytics_page_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            page_url TEXT NOT NULL,
            page_views INTEGER DEFAULT 0,
            unique_page_views INTEGER DEFAULT 0,
            avg_time_on_page REAL DEFAULT 0,
            bounce_rate REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, page_url)
        )
    ");
    
    // 创建索引
    $pdo->exec("CREATE INDEX idx_daily_date ON analytics_daily_summary(date)");
    $pdo->exec("CREATE INDEX idx_hourly_date_hour ON analytics_hourly_traffic(date, hour)");
    $pdo->exec("CREATE INDEX idx_sources_date ON analytics_traffic_sources(date)");
    $pdo->exec("CREATE INDEX idx_pages_date ON analytics_page_performance(date)");
    
    echo "数据表创建完成\n";
}

/**
 * 导入数据
 */
function importData($pdo) {
    echo "开始导入数据...\n";
    
    // JSON文件路径
    $jsonPath = __DIR__ . '/../data/external/test_honeywhale_.json';
    
    if (!file_exists($jsonPath)) {
        echo "JSON文件不存在，生成模拟数据...\n";
        generateMockData($pdo);
        return;
    }
    
    // 流式读取JSON文件
    $handle = fopen($jsonPath, 'r');
    if (!$handle) {
        throw new Exception("无法打开JSON文件");
    }
    
    $buffer = '';
    $braceCount = 0;
    $inString = false;
    $escapeNext = false;
    $recordCount = 0;
    
    // 数据汇总数组
    $dailyData = [];
    $hourlyData = [];
    $sourceData = [];
    $pageData = [];
    
    echo "开始流式处理JSON文件...\n";
    
    while (!feof($handle)) {
        $char = fgetc($handle);
        
        if ($escapeNext) {
            $escapeNext = false;
            $buffer .= $char;
            continue;
        }
        
        if ($char === '\\') {
            $escapeNext = true;
            $buffer .= $char;
            continue;
        }
        
        if ($char === '"') {
            $inString = !$inString;
        }
        
        if (!$inString) {
            if ($char === '{') {
                $braceCount++;
            } elseif ($char === '}') {
                $braceCount--;
            }
        }
        
        $buffer .= $char;
        
        // 当找到完整的JSON对象时处理
        if ($braceCount === 0 && strlen(trim($buffer)) > 2) {
            $trimmed = trim($buffer);
            if ($trimmed[0] === '{' && $trimmed[-1] === '}') {
                $record = json_decode($trimmed, true);
                if ($record && json_last_error() === JSON_ERROR_NONE) {
                    processRecord($record, $dailyData, $hourlyData, $sourceData, $pageData);
                    $recordCount++;
                    
                    if ($recordCount % 1000 === 0) {
                        echo "已处理 {$recordCount} 条记录\n";
                    }
                }
                $buffer = '';
            }
        }
    }
    
    fclose($handle);
    
    echo "JSON处理完成，共处理 {$recordCount} 条记录\n";
    echo "开始写入数据库...\n";
    
    // 批量插入数据
    insertBatchData($pdo, $dailyData, $hourlyData, $sourceData, $pageData);
    
    echo "数据导入完成！\n";
}

/**
 * 处理单条记录
 */
function processRecord($record, &$dailyData, &$hourlyData, &$sourceData, &$pageData) {
    // 提取基本信息
    $timestamp = $record['timestamp'] ?? null;
    $referrer = $record['referrer'] ?? '';
    $pageUrl = $record['page_url'] ?? '/';
    $sessionDuration = floatval($record['session_duration'] ?? 0);
    $pageViews = intval($record['page_views'] ?? 1);
    
    if (!$timestamp) return;
    
    $date = date('Y-m-d', strtotime($timestamp));
    $hour = intval(date('H', strtotime($timestamp)));
    
    // 分类来源
    $source = classifySource($referrer);
    
    // 汇总日常数据
    if (!isset($dailyData[$date])) {
        $dailyData[$date] = [
            'date' => $date,
            'total_visits' => 0,
            'unique_visitors' => 0,
            'page_views' => 0,
            'total_session_duration' => 0,
            'session_count' => 0
        ];
    }
    
    $dailyData[$date]['total_visits']++;
    $dailyData[$date]['page_views'] += $pageViews;
    $dailyData[$date]['total_session_duration'] += $sessionDuration;
    $dailyData[$date]['session_count']++;
    
    // 汇总小时数据
    $hourKey = $date . '_' . $hour;
    if (!isset($hourlyData[$hourKey])) {
        $hourlyData[$hourKey] = [
            'date' => $date,
            'hour' => $hour,
            'visits' => 0,
            'unique_visitors' => 0
        ];
    }
    
    $hourlyData[$hourKey]['visits']++;
    
    // 汇总来源数据
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
    
    // 汇总页面数据
    $pageHash = md5($pageUrl);
    $pageKey = $date . '_' . $pageHash;
    if (!isset($pageData[$pageKey])) {
        $pageData[$pageKey] = [
            'date' => $date,
            'page_url' => $pageUrl,
            'page_views' => 0,
            'unique_page_views' => 0,
            'total_time_on_page' => 0,
            'session_count' => 0
        ];
    }
    
    $pageData[$pageKey]['page_views'] += $pageViews;
    $pageData[$pageKey]['total_time_on_page'] += $sessionDuration;
    $pageData[$pageKey]['session_count']++;
}

/**
 * 分类来源
 */
function classifySource($referrer) {
    if (empty($referrer)) {
        return 'direct';
    }
    
    $ref = strtolower($referrer);
    
    if (strpos($ref, 'google.com') !== false || 
        strpos($ref, 'bing.com') !== false || 
        strpos($ref, 'yahoo.com') !== false) {
        return 'search_engine';
    }
    
    if (strpos($ref, 'facebook.com') !== false || 
        strpos($ref, 'twitter.com') !== false || 
        strpos($ref, 'instagram.com') !== false) {
        return 'social_media';
    }
    
    return 'referral';
}

/**
 * 批量插入数据
 */
function insertBatchData($pdo, $dailyData, $hourlyData, $sourceData, $pageData) {
    $pdo->beginTransaction();
    
    try {
        // 插入日常汇总数据
        $stmt = $pdo->prepare("
            INSERT OR REPLACE INTO analytics_daily_summary 
            (date, total_visits, unique_visitors, page_views, bounce_rate, avg_session_duration) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($dailyData as $data) {
            $avgSessionDuration = $data['session_count'] > 0 ? 
                $data['total_session_duration'] / $data['session_count'] : 0;
            
            $stmt->execute([
                $data['date'],
                $data['total_visits'],
                $data['total_visits'], // 简化处理，假设访问量等于独立访客
                $data['page_views'],
                0.3, // 模拟跳出率
                $avgSessionDuration
            ]);
        }
        
        echo "插入日常汇总数据: " . count($dailyData) . " 条\n";
        
        // 插入小时流量数据
        $stmt = $pdo->prepare("
            INSERT OR REPLACE INTO analytics_hourly_traffic 
            (date, hour, visits, unique_visitors) 
            VALUES (?, ?, ?, ?)
        ");
        
        foreach ($hourlyData as $data) {
            $stmt->execute([
                $data['date'],
                $data['hour'],
                $data['visits'],
                $data['visits'] // 简化处理
            ]);
        }
        
        echo "插入小时流量数据: " . count($hourlyData) . " 条\n";
        
        // 插入流量来源数据
        $stmt = $pdo->prepare("
            INSERT OR REPLACE INTO analytics_traffic_sources 
            (date, source_type, source_name, visits, conversions) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        foreach ($sourceData as $data) {
            $stmt->execute([
                $data['date'],
                $data['source_type'],
                $data['source_name'],
                $data['visits'],
                $data['conversions']
            ]);
        }
        
        echo "插入流量来源数据: " . count($sourceData) . " 条\n";
        
        // 插入页面性能数据
        $stmt = $pdo->prepare("
            INSERT OR REPLACE INTO analytics_page_performance 
            (date, page_url, page_views, unique_page_views, avg_time_on_page, bounce_rate) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($pageData as $data) {
            $avgTimeOnPage = $data['session_count'] > 0 ? 
                $data['total_time_on_page'] / $data['session_count'] : 0;
            
            $stmt->execute([
                $data['date'],
                $data['page_url'],
                $data['page_views'],
                $data['page_views'], // 简化处理
                $avgTimeOnPage,
                0.25 // 模拟页面跳出率
            ]);
        }
        
        echo "插入页面性能数据: " . count($pageData) . " 条\n";
        
        $pdo->commit();
        echo "数据批量插入完成\n";
        
    } catch (Exception $e) {
        $pdo->rollback();
        throw $e;
    }
}

/**
 * 生成模拟数据
 */
function generateMockData($pdo) {
    echo "生成模拟数据...\n";
    
    $pdo->beginTransaction();
    
    try {
        $sources = ['search_engine', 'social_media', 'direct', 'referral'];
        $pages = ['/', '/products', '/about', '/contact', '/blog'];
        
        // 生成30天的数据
        for ($i = 0; $i < 30; $i++) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            
            // 日常汇总数据
            $totalVisits = rand(100, 500);
            $uniqueVisitors = intval($totalVisits * (0.7 + rand(0, 30) / 100));
            $pageViews = intval($totalVisits * (1.2 + rand(0, 80) / 100));
            
            $stmt = $pdo->prepare("
                INSERT OR REPLACE INTO analytics_daily_summary 
                (date, total_visits, unique_visitors, page_views, bounce_rate, avg_session_duration) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $date,
                $totalVisits,
                $uniqueVisitors,
                $pageViews,
                0.2 + rand(0, 30) / 100,
                120 + rand(0, 300)
            ]);
            
            // 小时流量数据
            for ($hour = 0; $hour < 24; $hour++) {
                $hourMultiplier = getHourMultiplier($hour);
                $visits = intval($totalVisits / 24 * $hourMultiplier);
                
                $stmt = $pdo->prepare("
                    INSERT OR REPLACE INTO analytics_hourly_traffic 
                    (date, hour, visits, unique_visitors) 
                    VALUES (?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $date,
                    $hour,
                    $visits,
                    intval($visits * 0.8)
                ]);
            }
            
            // 流量来源数据
            foreach ($sources as $source) {
                $sourceMultiplier = getSourceMultiplier($source);
                $visits = intval($totalVisits * $sourceMultiplier);
                
                $stmt = $pdo->prepare("
                    INSERT OR REPLACE INTO analytics_traffic_sources 
                    (date, source_type, source_name, visits, conversions) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $date,
                    'referral',
                    $source,
                    $visits,
                    intval($visits * 0.05)
                ]);
            }
            
            // 页面性能数据
            foreach ($pages as $page) {
                $pageViews = intval($totalVisits * (0.1 + rand(0, 40) / 100));
                
                $stmt = $pdo->prepare("
                    INSERT OR REPLACE INTO analytics_page_performance 
                    (date, page_url, page_views, unique_page_views, avg_time_on_page, bounce_rate) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $date,
                    $page,
                    $pageViews,
                    intval($pageViews * 0.9),
                    60 + rand(0, 240),
                    0.1 + rand(0, 40) / 100
                ]);
            }
        }
        
        $pdo->commit();
        echo "模拟数据生成完成\n";
        
    } catch (Exception $e) {
        $pdo->rollback();
        throw $e;
    }
}

/**
 * 获取小时权重
 */
function getHourMultiplier($hour) {
    $multipliers = [
        0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.4, 0.6,  // 0-7
        0.8, 1.2, 1.4, 1.6, 1.5, 1.4, 1.6, 1.8,  // 8-15
        2.0, 1.9, 1.7, 2.2, 2.0, 1.5, 0.8, 0.4   // 16-23
    ];
    return $multipliers[$hour] ?? 1.0;
}

/**
 * 获取来源权重
 */
function getSourceMultiplier($source) {
    $multipliers = [
        'search_engine' => 0.4,
        'social_media' => 0.3,
        'direct' => 0.2,
        'referral' => 0.1
    ];
    return $multipliers[$source] ?? 0.1;
}

// 如果直接访问此文件，则执行初始化
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    echo "开始数据库初始化...\n";
}
?>