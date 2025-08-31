"""
项目结构管理工具
用于创建和维护项目目录结构
"""

import os
from pathlib import Path

def create_project_structure():
    """创建标准的数据分析项目结构"""
    
    directories = [
        'src/analysis',
        'src/visualization', 
        'src/utils',
        'data/raw',
        'data/processed',
        'data/external',
        'docs/notebooks',
        'docs/reports',
        'scripts',
        'tests',
        'assets'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"创建目录: {directory}")
    
    # 创建 .gitkeep 文件以保持空目录
    for directory in directories:
        gitkeep_path = Path(directory) / '.gitkeep'
        if not gitkeep_path.exists():
            gitkeep_path.touch()

if __name__ == "__main__":
    create_project_structure()
    print("项目结构创建完成！")