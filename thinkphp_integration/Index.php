<?php
namespace app\analysis18\controller;

use think\Controller;
use think\Db;

/**
 * 国际销售数据分析控制器
 * 符合ThinkPHP 5.1开发规范
 */
class Index extends Controller
{
    /**
     * 数据库连接配置
     */
    protected function getDbConnection()
    {
        $config = include __DIR__ . '/../database.php';
        return Db::connect($config);
    }
    
    /**
     * 初始化SQLite数据库（调用独立脚本）
     */
    public function init_db()
    {
        try {
            $controllerDir = dirname(__FILE__);
            $appDir = dirname($controllerDir);
            $scriptPath = $appDir . '/scripts/import_data.php';
            
            // 检查脚本是否存在
            if (!file_exists($scriptPath)) {
                return json([
                    'status' => 'error',
                    'message' => '数据导入脚本不存在: ' . $scriptPath
                ]);
            }
            
            // 执行数据导入脚本
            ob_start();
            $startTime = microtime(true);
            
            // 使用include执行脚本
            include $scriptPath;
            
            $endTime = microtime(true);
            $output = ob_get_clean();
            $executionTime = round($endTime - $startTime, 2);
            
            // 检查数据库是否创建成功
            $dbPath = $appDir . '/data/analytics.db';
            if (file_exists($dbPath)) {
                return json([
                    'status' => 'success',
                    'message' => $output,
                    'executionTime' => $executionTime . '秒',
                    'dbPath' => $dbPath
                ]);
            } else {
                return json([
                    'status' => 'error',
                    'message' => '数据库文件未创建成功',
                    'output' => $output
                ]);
            }
            
        } catch (\Exception $e) {
            return json([
                'status' => 'error',
                'message' => '执行失败: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 测试数据库连接
     */
    public function test_db()
    {
        try {
            $db = $this->getDbConnection();
            
            // 测试连接并获取基本统计
            $dailyCount = $db->table('analytics_daily_summary')->count();
            $hourlyCount = $db->table('analytics_hourly_traffic')->count();
            $sourceCount = $db->table('analytics_traffic_sources')->count();
            $pageCount = $db->table('analytics_page_performance')->count();
            
            $result = [
                'status' => 'success',
                'message' => '数据库连接成功！',
                'data' => [
                    'analytics_daily_summary' => $dailyCount,
                    'analytics_hourly_traffic' => $hourlyCount,
                    'analytics_traffic_sources' => $sourceCount,
                    'analytics_page_performance' => $pageCount
                ],
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            return json($result);
            
        } catch (\Exception $e) {
            $result = [
                'status' => 'error',
                'message' => '数据库连接失败：' . $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            return json($result);
        }
    }
    

    /**
     * 默认首页 - 显示项目首页
     */
    public function index()
    {
        // 分配数据到模板
        $this->assign([
            'title' => '国际销售数据分析系统',
            'description' => '专业的销售数据可视化分析平台',
            'currentView' => 'index'
        ]);
        
        return $this->fetch('index');
    }
    
    /**
     * 现代风格仪表板
     */
    public function modern()
    {
        // 获取图表数据
        $chartData = $this->getChartData();
        
        // 分配数据到模板
        $this->assign([
            'title' => '国际销售数据分析 - 现代风格',
            'chartData' => $chartData,
            'currentView' => 'modern'
        ]);
        
        return $this->fetch('modern');
    }
    
    /**
     * 商务风格仪表板
     */
    public function business()
    {
        // 获取图表数据
        $chartData = $this->getChartData();
        
        // 分配数据到模板
        $this->assign([
            'title' => '国际销售数据分析 - 商务风格',
            'chartData' => $chartData,
            'currentView' => 'business'
        ]);
        
        return $this->fetch('business');
    }
    
    /**
     * 功能演示说明页面
     */
    public function demo()
    {
        // 分配数据到模板
        $this->assign([
            'title' => '功能演示说明',
            'description' => '了解系统的各项功能和使用方法',
            'currentView' => 'demo'
        ]);
        
        return $this->fetch('demo');
    }
    
    /**
     * 静态资源处理方法
     * 处理static目录下的CSS、JS、数据文件
     */
    public function static_file()
    {
        // 获取请求的文件路径
        $requestUri = $_SERVER['REQUEST_URI'];
        
        // 提取static后面的路径部分
        $pattern = '/\/analysis18\.php\/index\/static_file\/(.+)$/';
        if (!preg_match($pattern, $requestUri, $matches)) {
            return $this->error('无效的资源路径');
        }
        
        $path = urldecode($matches[1]);
        
        // 安全检查，防止目录遍历攻击
        if (strpos($path, '..') !== false || strpos($path, '\\') !== false) {
            return $this->error('非法路径');
        }
        
        // 构建完整文件路径
        $scriptDir = dirname($_SERVER['SCRIPT_FILENAME']);
        $rootDir = dirname($scriptDir);
        $basePath = $rootDir . DIRECTORY_SEPARATOR . 'application' . DIRECTORY_SEPARATOR . 'analysis18' . DIRECTORY_SEPARATOR . 'static' . DIRECTORY_SEPARATOR;
        $filePath = $basePath . str_replace('/', DIRECTORY_SEPARATOR, $path);
        
        // 检查文件是否存在
        if (!file_exists($filePath) || !is_file($filePath)) {
            return $this->error('静态文件不存在: ' . $path, '', 404);
        }
        
        // 获取文件扩展名，设置正确的Content-Type
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml'
        ];
        
        $contentType = isset($mimeTypes[$extension]) ? $mimeTypes[$extension] : 'application/octet-stream';
        
        // 设置响应头
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($filePath));
        
        // 输出文件内容
        readfile($filePath);
        exit;
    }
    
    /**
     * API接口 - 获取图表数据
     */
    public function api_chart_data()
    {
        $data = $this->getChartData();
        return json($data);
    }
    
    /**
     * API接口 - 获取日常汇总数据
     */
    public function api_daily_summary()
    {
        try {
            $db = $this->getDbConnection();
            $data = $db->table('analytics_daily_summary')
                      ->order('date DESC')
                      ->limit(30)
                      ->select();
            
            return json([
                'status' => 'success',
                'data' => $data,
                'count' => count($data)
            ]);
        } catch (\Exception $e) {
            return json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * API接口 - 获取小时流量数据
     */
    public function api_hourly_traffic()
    {
        try {
            $db = $this->getDbConnection();
            $data = $db->table('analytics_hourly_traffic')
                      ->where('date', '>=', date('Y-m-d', strtotime('-7 days')))
                      ->order('date DESC, hour ASC')
                      ->select();
            
            return json([
                'status' => 'success',
                'data' => $data,
                'count' => count($data)
            ]);
        } catch (\Exception $e) {
            return json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * API接口 - 获取流量来源数据
     */
    public function api_traffic_sources()
    {
        try {
            $db = $this->getDbConnection();
            $data = $db->table('analytics_traffic_sources')
                      ->where('date', '>=', date('Y-m-d', strtotime('-30 days')))
                      ->order('visits DESC')
                      ->select();
            
            return json([
                'status' => 'success',
                'data' => $data,
                'count' => count($data)
            ]);
        } catch (\Exception $e) {
            return json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * API接口 - 获取页面性能数据
     */
    public function api_page_performance()
    {
        try {
            $db = $this->getDbConnection();
            $data = $db->table('analytics_page_performance')
                      ->where('date', '>=', date('Y-m-d', strtotime('-30 days')))
                      ->order('page_views DESC')
                      ->limit(20)
                      ->select();
            
            return json([
                'status' => 'success',
                'data' => $data,
                'count' => count($data)
            ]);
        } catch (\Exception $e) {
            return json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * API接口 - 获取仪表板汇总数据
     */
    public function api_dashboard_summary()
    {
        try {
            $db = $this->getDbConnection();
            
            // 获取总访问量
            $totalVisits = $db->table('analytics_daily_summary')->sum('total_visits');
            
            // 获取今日访问量
            $todayVisits = $db->table('analytics_daily_summary')
                             ->where('date', date('Y-m-d'))
                             ->value('total_visits') ?: 0;
            
            // 获取平均跳出率
            $avgBounceRate = $db->table('analytics_daily_summary')->avg('bounce_rate');
            
            // 获取热门页面
            $topPages = $db->table('analytics_page_performance')
                          ->where('date', '>=', date('Y-m-d', strtotime('-7 days')))
                          ->order('page_views DESC')
                          ->limit(5)
                          ->column('page_url,page_views');
            
            // 获取流量趋势（最近7天）
            $trafficTrend = $db->table('analytics_daily_summary')
                              ->where('date', '>=', date('Y-m-d', strtotime('-7 days')))
                              ->order('date ASC')
                              ->column('date,total_visits');
            
            return json([
                'status' => 'success',
                'data' => [
                    'totalVisits' => $totalVisits,
                    'todayVisits' => $todayVisits,
                    'avgBounceRate' => round($avgBounceRate, 2),
                    'topPages' => $topPages,
                    'trafficTrend' => $trafficTrend
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取图表数据（从数据库）
     * @return array
     */
    private function getChartData()
    {
        try {
            $db = $this->getDbConnection();
            
            // 获取最近30天的数据
            $data = $db->table('analytics_daily_summary')
                      ->where('date', '>=', date('Y-m-d', strtotime('-30 days')))
                      ->order('date ASC')
                      ->select();
            
            $dates = [];
            $sales = [];
            
            foreach ($data as $row) {
                $dates[] = $row['date'];
                $sales[] = $row['total_visits'];
            }
            
            // 如果没有数据，生成示例数据
            if (empty($dates)) {
                for ($i = 30; $i >= 0; $i--) {
                    $dates[] = date('Y-m-d', strtotime("-{$i} days"));
                    $sales[] = rand(800, 2000);
                }
            }
            
            return [
                'dates' => $dates,
                'sales' => $sales,
                'totalSales' => array_sum($sales),
                'avgSales' => round(array_sum($sales) / count($sales), 2),
                'maxSales' => max($sales),
                'minSales' => min($sales)
            ];
        } catch (\Exception $e) {
            // 如果数据库查询失败，返回示例数据
            $dates = [];
            $sales = [];
            
            for ($i = 30; $i >= 0; $i--) {
                $dates[] = date('Y-m-d', strtotime("-{$i} days"));
                $sales[] = rand(800, 2000);
            }
            
            return [
                'dates' => $dates,
                'sales' => $sales,
                'totalSales' => array_sum($sales),
                'avgSales' => round(array_sum($sales) / count($sales), 2),
                'maxSales' => max($sales),
                'minSales' => min($sales)
            ];
        }
    }
}