@echo off
echo 🚀 启动国际销售分析仪表板...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Python，请先安装Python
    pause
    exit /b 1
)

REM 启动服务器
python start_server.py

pause