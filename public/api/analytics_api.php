<?php
/**
 * 数据分析API接口
 * 提供SQLite数据库查询服务
 */

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理OPTIONS请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 数据库配置
$config = include __DIR__ . '/database.php';
$dbPath = $config['database'];

try {
    // 连接数据库
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 获取请求参数
    $action = $_GET['action'] ?? '';
    $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
    $endDate = $_GET['end_date'] ?? date('Y-m-d');
    
    // 路由处理
    switch ($action) {
        case 'dashboard_summary':
            echo json_encode(getDashboardSummary($pdo, $startDate, $endDate));
            break;
            
        case 'daily_summary':
            echo json_encode(getDailySummary($pdo, $startDate, $endDate));
            break;
            
        case 'hourly_traffic':
            echo json_encode(getHourlyTraffic($pdo, $startDate, $endDate));
            break;
            
        case 'traffic_sources':
            echo json_encode(getTrafficSources($pdo, $startDate, $endDate));
            break;
            
        case 'page_performance':
            echo json_encode(getPagePerformance($pdo, $startDate, $endDate));
            break;
            
        case 'init_db':
            echo json_encode(initDatabase());
            break;
            
        case 'test_db':
            echo json_encode(testDatabase($pdo));
            break;
            
        default:
            echo json_encode([
                'status' => 'error',
                'message' => '无效的操作类型',
                'available_actions' => [
                    'dashboard_summary',
                    'daily_summary', 
                    'hourly_traffic',
                    'traffic_sources',
                    'page_performance',
                    'init_db',
                    'test_db'
                ]
            ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

/**
 * 获取仪表板汇总数据
 */
function getDashboardSummary($pdo, $startDate, $endDate) {
    try {
        // 总访问量
        $stmt = $pdo->prepare("
            SELECT SUM(total_visits) as total_visits,
                   SUM(unique_visitors) as unique_visitors,
                   SUM(page_views) as page_views,
                   AVG(bounce_rate) as avg_bounce_rate,
                   AVG(avg_session_duration) as avg_session_duration
            FROM analytics_daily_summary 
            WHERE date BETWEEN ? AND ?
        ");
        $stmt->execute([$startDate, $endDate]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // 流量来源分布
        $stmt = $pdo->prepare("
            SELECT source_name, SUM(visits) as visits
            FROM analytics_traffic_sources 
            WHERE date BETWEEN ? AND ?
            GROUP BY source_name
            ORDER BY visits DESC
        ");
        $stmt->execute([$startDate, $endDate]);
        $sources = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 每日趋势
        $stmt = $pdo->prepare("
            SELECT date, total_visits, unique_visitors
            FROM analytics_daily_summary 
            WHERE date BETWEEN ? AND ?
            ORDER BY date
        ");
        $stmt->execute([$startDate, $endDate]);
        $dailyTrend = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'status' => 'success',
            'data' => [
                'summary' => $summary,
                'sources' => $sources,
                'daily_trend' => $dailyTrend,
                'date_range' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ]
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

/**
 * 获取日常汇总数据
 */
function getDailySummary($pdo, $startDate, $endDate) {
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM analytics_daily_summary 
            WHERE date BETWEEN ? AND ?
            ORDER BY date
        ");
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'status' => 'success',
            'data' => $data,
            'count' => count($data)
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

/**
 * 获取小时流量数据
 */
function getHourlyTraffic($pdo, $startDate, $endDate) {
    try {
        $stmt = $pdo->prepare("
            SELECT hour, SUM(visits) as total_visits, SUM(unique_visitors) as total_unique_visitors
            FROM analytics_hourly_traffic 
            WHERE date BETWEEN ? AND ?
            GROUP BY hour
            ORDER BY hour
        ");
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'status' => 'success',
            'data' => $data,
            'count' => count($data)
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

/**
 * 获取流量来源数据
 */
function getTrafficSources($pdo, $startDate, $endDate) {
    try {
        $stmt = $pdo->prepare("
            SELECT source_name, SUM(visits) as total_visits, SUM(conversions) as total_conversions
            FROM analytics_traffic_sources 
            WHERE date BETWEEN ? AND ?
            GROUP BY source_name
            ORDER BY total_visits DESC
        ");
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'status' => 'success',
            'data' => $data,
            'count' => count($data)
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

/**
 * 获取页面性能数据
 */
function getPagePerformance($pdo, $startDate, $endDate) {
    try {
        $stmt = $pdo->prepare("
            SELECT page_url, SUM(page_views) as total_page_views, 
                   SUM(unique_page_views) as total_unique_page_views,
                   AVG(avg_time_on_page) as avg_time_on_page,
                   AVG(bounce_rate) as avg_bounce_rate
            FROM analytics_page_performance 
            WHERE date BETWEEN ? AND ?
            GROUP BY page_url
            ORDER BY total_page_views DESC
            LIMIT 20
        ");
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'status' => 'success',
            'data' => $data,
            'count' => count($data)
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

/**
 * 初始化数据库
 */
function initDatabase() {
    try {
        // 执行初始化脚本
        ob_start();
        include __DIR__ . '/init_database.php';
        $output = ob_get_clean();
        
        return [
            'status' => 'success',
            'message' => '数据库初始化完成',
            'output' => $output
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

/**
 * 测试数据库连接
 */
function testDatabase($pdo) {
    try {
        // 检查表是否存在
        $tables = ['analytics_daily_summary', 'analytics_hourly_traffic', 
                  'analytics_traffic_sources', 'analytics_page_performance'];
        
        $existingTables = [];
        $recordCounts = [];
        
        foreach ($tables as $table) {
            $stmt = $pdo->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
            $stmt->execute([$table]);
            
            if ($stmt->fetch()) {
                $existingTables[] = $table;
                
                // 获取记录数
                $countStmt = $pdo->prepare("SELECT COUNT(*) as count FROM {$table}");
                $countStmt->execute();
                $count = $countStmt->fetch(PDO::FETCH_ASSOC);
                $recordCounts[$table] = $count['count'];
            }
        }
        
        return [
            'status' => 'success',
            'message' => '数据库连接正常',
            'database_info' => [
                'existing_tables' => $existingTables,
                'record_counts' => $recordCounts,
                'total_tables' => count($existingTables)
            ]
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}
?>