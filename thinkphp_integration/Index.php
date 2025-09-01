<?php
namespace app\analysis18\controller;

use think\Controller;

class Index extends Controller
{
    /**
     * 国际销售分析仪表板主页
     */
    public function index()
    {
        // 设置页面标题和基本信息
        $this->assign('title', '国际销售分析仪表板');
        $this->assign('description', '实时数据可视化 • 智能分析 • 响应式设计');
        
        // 可以在这里添加后端数据处理逻辑
        // 例如：从数据库获取销售数据
        
        return $this->fetch('index');
    }
    
    /**
     * 现代版仪表板
     */
    public function modern()
    {
        return $this->fetch('modern');
    }
    
    /**
     * 商务版仪表板
     */
    public function business()
    {
        return $this->fetch('business');
    }
    
    /**
     * 功能演示页面
     */
    public function demo()
    {
        return $this->fetch('demo');
    }
    
    /**
     * API接口 - 获取销售数据
     */
    public function getSalesData()
    {
        // 这里可以连接数据库获取真实数据
        // 目前返回示例数据
        $data = [
            'sales' => [
                'total' => 45230,
                'growth' => 12.5,
                'orders' => 1250,
                'conversion' => 3.2
            ],
            'chart_data' => $this->getChartData(),
            'traffic_sources' => [
                'search' => 40,
                'social' => 25,
                'direct' => 20,
                'referral' => 15
            ]
        ];
        
        return json($data);
    }
    
    /**
     * 获取图表数据
     */
    private function getChartData()
    {
        // 生成示例图表数据
        $dates = [];
        $sales = [];
        
        for ($i = 30; $i >= 0; $i--) {
            $dates[] = date('Y-m-d', strtotime("-{$i} days"));
            $sales[] = rand(800, 2000);
        }
        
        return [
            'dates' => $dates,
            'sales' => $sales
        ];
    }
}