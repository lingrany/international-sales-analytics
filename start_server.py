#!/usr/bin/env python3
"""
简单的HTTP服务器启动脚本
从项目根目录启动，确保所有文件路径正确
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def start_server(port=8080):
    """启动HTTP服务器"""
    
    # 确保在项目根目录
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    print(f"🚀 启动服务器...")
    print(f"📁 工作目录: {project_root}")
    print(f"🌐 服务器地址: http://localhost:{port}")
    print(f"📄 可访问的页面:")
    print(f"   - http://localhost:{port}/assets/index.html")
    print(f"   - http://localhost:{port}/assets/international.html")
    print(f"   - http://localhost:{port}/assets/international-business.html")
    print(f"\n按 Ctrl+C 停止服务器")
    
    try:
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"✅ 服务器已启动在端口 {port}")
            
            # 自动打开浏览器
            webbrowser.open(f'http://localhost:{port}/assets/international.html')
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 服务器已停止")
    except OSError as e:
        if e.errno == 10048:  # Windows: Address already in use
            print(f"❌ 端口 {port} 已被占用，尝试使用端口 {port + 1}")
            start_server(port + 1)
        else:
            print(f"❌ 启动服务器失败: {e}")

if __name__ == "__main__":
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ 端口号必须是数字")
            sys.exit(1)
    
    start_server(port)