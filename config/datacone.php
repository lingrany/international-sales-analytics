<?php
// config/database.php

return [
    // 数据库类型
    'type'            => 'mysql',
    // 服务器地址
    // 重要：通常这里填写IP地址或域名，不需要加 'https://' 和端口号
    'hostname'        => '13.55.157.193', 
    // 数据库名 (您需要先确认数据库名，可能是 test_honeywhale 或其他)
    'database'        => 'test_honeywhale_', 
    // 用户名
    'username'        => 'test_honeywhale_', 
    // 密码
    'password'        => 'wTxAtJZ83hPbN448', 
    // 端口
    // 非常重要：MySQL的默认端口是3306，您提供的URL端口是887，这很可能是phpMyAdmin的端口，而不是MySQL的。
    'hostport'        => '3306', // 首先尝试3306，如果连接失败再尝试887
    // 连接dsn
    'dsn'             => '',
    // 数据库连接参数
    'params'          => [],
    // 数据库编码默认采用utf8
    'charset'         => 'utf8',
    // 数据库表前缀
    'prefix'          => '',
    // 数据库调试模式
    'debug'           => true,
    // 其它配置...
];