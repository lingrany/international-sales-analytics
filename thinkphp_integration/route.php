<?php
// ThinkPHP 路由配置文件
// 文件位置：application/analysis18/route.php

use think\Route;

// 主页路由
Route::get('/', 'Index/index');

// 仪表板路由
Route::get('modern', 'Index/modern');
Route::get('business', 'Index/business');
Route::get('demo', 'Index/demo');

// API路由
Route::get('api/sales', 'Index/getSalesData');

// 静态资源路由（如果需要）
Route::get('assets/[:file]', function($file) {
    // 处理静态文件访问
    return response()->file(APP_PATH . 'analysis18/public/' . $file);
});