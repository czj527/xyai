#!/usr/bin/env python3
"""
新叶早报视频录制脚本 V2
使用Playwright录制视频
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path
import asyncio

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("需要安装playwright: pip install playwright && playwright install chromium")
    sys.exit(1)


def check_ffmpeg():
    for path in ["ffmpeg", "/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg"]:
        try:
            result = subprocess.run([path, "-version"], capture_output=True, text=True)
            if result.returncode == 0:
                return path
        except FileNotFoundError:
            continue
    return None


async def record_video(url: str, output_path: str, duration: int = 180):
    """使用Playwright录制视频"""
    print(f"开始录制视频...")
    print(f"URL: {url}")
    print(f"预计时长: {duration}秒")
    
    # 创建临时目录
    temp_dir = Path(output_path).parent / "temp_video"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # 创建录制上下文
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
            record_video_size={"width": 1920, "height": 1080},
            record_video_dir=str(temp_dir)
        )
        
        page = await context.new_page()
        
        # 打开页面
        print("加载页面...")
        await page.goto(url, wait_until="networkidle")
        await asyncio.sleep(3)  # 等待页面稳定和自动播放开始
        
        # 等待录制完成
        print(f"录制中... (预计{duration}秒)")
        await asyncio.sleep(duration)
        
        # 关闭页面以保存视频
        print("保存视频...")
        await page.close()
        await context.close()
        await browser.close()
        
        # 查找录制的视频文件
        video_files = list(temp_dir.glob("*.webm"))
        if not video_files:
            print("错误：未找到录制的视频文件")
            sys.exit(1)
        
        webm_path = video_files[0]
        
        # 转换为MP4
        print("转换为MP4...")
        ffmpeg_path = check_ffmpeg()
        if not ffmpeg_path:
            print("错误：未找到ffmpeg")
            sys.exit(1)
        
        result = subprocess.run([
            ffmpeg_path,
            "-i", str(webm_path),
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "128k",
            str(output_path)
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"FFmpeg错误: {result.stderr}")
            sys.exit(1)
        
        # 清理临时文件
        print("清理临时文件...")
        for f in temp_dir.glob("*"):
            f.unlink()
        temp_dir.rmdir()
        
        print(f"视频已保存: {output_path}")


def main():
    today = datetime.now().strftime("%Y-%m-%d")
    
    base_dir = Path(__file__).parent.parent / "output"
    video_url = f"https://xyai.czj527.xyz/video?autoplay=true&date={today}&script=true"
    
    # 读取timing.json获取总时长
    timing_path = base_dir / "audio" / f"timing_{today}_v2.json"
    if timing_path.exists():
        with open(timing_path, "r", encoding="utf-8") as f:
            timing = json.load(f)
        duration = int(timing.get("total_duration", 180)) + 5
    else:
        duration = 185
    
    print(f"读取音频时长: {duration}秒")
    
    video_output = base_dir / f"新叶早报_{today}_final_v2.mp4"
    
    asyncio.run(record_video(video_url, str(video_output), duration=duration))


if __name__ == "__main__":
    main()
