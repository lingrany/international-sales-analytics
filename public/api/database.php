<?php
/**
 * SQLite数据库配置文件
 * 用于public目录的数据处理
 */

return [
    // 数据库类型
    'type'            => 'sqlite',
    // 数据库文件路径
    'database'        => dirname(__FILE__) . '/data/analytics.db',
    // 连接dsn
    'dsn'             => '',
    // 数据库连接参数
    'params'          => [
        PDO::ATTR_PERSISTENT => false,              // 禁用持久连接
    ],
    // 数据库编码默认采用utf8
    'charset'         => 'utf8mb4',
    // 数据库表前缀
    'prefix'          => '',
    // 数据库调试模式
    'debug'           => false,
    // 是否严格检查字段是否存在
    'fields_strict'   => true,
    // 数据集返回类型
    'resultset_type'  => 'array',
    // 自动写入时间戳字段
    'auto_timestamp'  => false,
    // 时间字段取出后的默认时间格式
    'datetime_format' => 'Y-m-d H:i:s',
    // 是否需要进行SQL性能分析
    'sql_explain'     => false,
    // 是否需要断线重连
    'break_reconnect' => true,
    // 断线标识字符串
    'break_match_str' => [],
];