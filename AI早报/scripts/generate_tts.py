#!/usr/bin/env python3
"""
新叶早报TTS生成脚本 V2
使用MiMo TTS（冰糖音色）
支持分段生成和FFmpeg拼接
"""

import os
import sys
import json
import base64
import requests
import subprocess
from datetime import datetime
from pathlib import Path

# MiMo TTS配置
MIMO_BASE_URL = "https://api.xiaomimimo.com/v1/chat/completions"
MIMO_API_KEY = "sk-ckqxsx8mbxtb08jrbpqlui4rfwqcqpgy29xxcikid8a62323"
MIMO_TTS_MODEL = "mimo-v2.5-tts"
MIMO_VOICE = "冰糖"  # 已确认可用

# Fallback: edge-tts配置
EDGE_TTS_VOICE = "zh-CN-XiaoxiaoNeural"

# FFmpeg路径（尝试多个可能的位置）
FFMPEG_PATHS = [
    "ffmpeg",
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    "/opt/homebrew/bin/ffmpeg",
]


def check_ffmpeg():
    """检查ffmpeg是否可用"""
    for path in FFMPEG_PATHS:
        try:
            result = subprocess.run([path, "-version"], capture_output=True, text=True)
            if result.returncode == 0:
                return path
        except FileNotFoundError:
            continue
    return None


def generate_mimo_tts(text: str, voice: str = MIMO_VOICE) -> bytes:
    """使用MiMo TTS生成音频"""
    headers = {
        "Authorization": f"Bearer {MIMO_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": MIMO_TTS_MODEL,
        "messages": [
            {"role": "assistant", "content": text}
        ],
        "audio": {
            "voice": voice,
            "format": "mp3"
        }
    }
    
    response = requests.post(MIMO_BASE_URL, json=data, headers=headers, timeout=120)
    response.raise_for_status()
    result = response.json()
    
    # 解码base64音频
    audio_base64 = result["choices"][0]["message"]["audio"]["data"]
    audio_bytes = base64.b64decode(audio_base64)
    return audio_bytes


def generate_edge_tts(text: str, voice: str = EDGE_TTS_VOICE, output_path: str = None) -> bytes:
    """使用edge-tts生成音频（fallback方案）"""
    import edge_tts
    
    if output_path:
        # 直接保存到文件
        asyncio.run(edge_tts.副驾驶员(text, voice).stream_to_file(output_path))
        with open(output_path, "rb") as f:
            return f.read()
    else:
        # 返回字节
        communicate = edge_tts.Communicate(text, voice)
        audio_data = b""
        async def get_audio():
            nonlocal audio_data
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
        asyncio.run(get_audio())
        return audio_data


def get_audio_duration(file_path: str) -> float:
    """获取音频文件时长（秒）"""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", file_path
            ],
            capture_output=True, text=True, check=True
        )
        return float(result.stdout.strip())
    except:
        return 0


def main():
    # 获取今天的日期
    today = datetime.now().strftime("%Y-%m-%d")
    
    # 创建输出目录
    base_dir = Path(__file__).parent.parent / "output"
    audio_dir = base_dir / "audio"
    temp_dir = base_dir / "temp"
    
    audio_dir.mkdir(parents=True, exist_ok=True)
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    # 读取脚本文件
    script_path = base_dir / "scripts" / f"script_{today}.json"
    if not script_path.exists():
        print(f"脚本文件不存在：{script_path}")
        sys.exit(1)
    
    with open(script_path, "r", encoding="utf-8") as f:
        script = json.load(f)
    
    print(f"读取脚本文件：{script_path}")
    print(f"开场白：{script.get('opening', '')[:50]}...")
    print(f"新闻数量：{len(script.get('items', []))}")
    print(f"结束语：{script.get('closing', '')[:50]}...")
    
    # 检查ffmpeg
    ffmpeg_path = check_ffmpeg()
    if not ffmpeg_path:
        print("错误：未找到ffmpeg，请安装：brew install ffmpeg 或 apt install ffmpeg")
        sys.exit(1)
    print(f"使用ffmpeg：{ffmpeg_path}")
    
    # 存储音频片段信息
    audio_segments = []
    timing_data = {
        "segments": [],
        "total_duration": 0
    }
    
    # 当前时间偏移
    current_offset = 0.0
    
    # 生成开场白TTS
    if script.get("opening"):
        print("\n生成开场白TTS...")
        segment_file = temp_dir / f"segment_opening.mp3"
        try:
            audio_data = generate_mimo_tts(script["opening"])
            with open(segment_file, "wb") as f:
                f.write(audio_data)
            duration = get_audio_duration(str(segment_file))
            audio_segments.append(str(segment_file))
            timing_data["segments"].append({
                "type": "opening",
                "text": script["opening"],
                "file": "segment_opening.mp3",
                "start": current_offset,
                "duration": duration
            })
            current_offset += duration
            print(f"  开场白完成，时长：{duration:.2f}秒")
        except Exception as e:
            print(f"  MiMo TTS失败，使用edge-tts fallback...")
            try:
                audio_data = generate_edge_tts(script["opening"])
                with open(segment_file, "wb") as f:
                    f.write(audio_data)
                duration = get_audio_duration(str(segment_file))
                audio_segments.append(str(segment_file))
                timing_data["segments"].append({
                    "type": "opening",
                    "text": script["opening"],
                    "file": "segment_opening.mp3",
                    "start": current_offset,
                    "duration": duration
                })
                current_offset += duration
                print(f"  开场白完成（fallback），时长：{duration:.2f}秒")
            except Exception as e2:
                print(f"  edge-tts也失败了：{e2}")
    
    # 生成每条新闻的TTS
    for i, item in enumerate(script.get("items", [])):
        print(f"\n生成新闻{i+1} TTS：{item['title'][:30]}...")
        segment_file = temp_dir / f"segment_{i+1:02d}.mp3"
        
        try:
            audio_data = generate_mimo_tts(item["script"])
            with open(segment_file, "wb") as f:
                f.write(audio_data)
            duration = get_audio_duration(str(segment_file))
            audio_segments.append(str(segment_file))
            timing_data["segments"].append({
                "type": "item",
                "index": i + 1,
                "title": item["title"],
                "script": item["script"],
                "file": f"segment_{i+1:02d}.mp3",
                "start": current_offset,
                "duration": duration
            })
            current_offset += duration
            print(f"  新闻{i+1}完成，时长：{duration:.2f}秒")
        except Exception as e:
            print(f"  MiMo TTS失败，使用edge-tts fallback...")
            try:
                audio_data = generate_edge_tts(item["script"])
                with open(segment_file, "wb") as f:
                    f.write(audio_data)
                duration = get_audio_duration(str(segment_file))
                audio_segments.append(str(segment_file))
                timing_data["segments"].append({
                    "type": "item",
                    "index": i + 1,
                    "title": item["title"],
                    "script": item["script"],
                    "file": f"segment_{i+1:02d}.mp3",
                    "start": current_offset,
                    "duration": duration
                })
                current_offset += duration
                print(f"  新闻{i+1}完成（fallback），时长：{duration:.2f}秒")
            except Exception as e2:
                print(f"  edge-tts也失败了：{e2}")
    
    # 生成结束语TTS
    if script.get("closing"):
        print("\n生成结束语TTS...")
        segment_file = temp_dir / f"segment_closing.mp3"
        try:
            audio_data = generate_mimo_tts(script["closing"])
            with open(segment_file, "wb") as f:
                f.write(audio_data)
            duration = get_audio_duration(str(segment_file))
            audio_segments.append(str(segment_file))
            timing_data["segments"].append({
                "type": "closing",
                "text": script["closing"],
                "file": "segment_closing.mp3",
                "start": current_offset,
                "duration": duration
            })
            current_offset += duration
            print(f"  结束语完成，时长：{duration:.2f}秒")
        except Exception as e:
            print(f"  MiMo TTS失败，使用edge-tts fallback...")
            try:
                audio_data = generate_edge_tts(script["closing"])
                with open(segment_file, "wb") as f:
                    f.write(audio_data)
                duration = get_audio_duration(str(segment_file))
                audio_segments.append(str(segment_file))
                timing_data["segments"].append({
                    "type": "closing",
                    "text": script["closing"],
                    "file": "segment_closing.mp3",
                    "start": current_offset,
                    "duration": duration
                })
                current_offset += duration
                print(f"  结束语完成（fallback），时长：{duration:.2f}秒")
            except Exception as e2:
                print(f"  edge-tts也失败了：{e2}")
    
    # 更新总时长
    timing_data["total_duration"] = current_offset
    
    # 使用FFmpeg拼接所有音频
    print("\n" + "="*50)
    print("拼接音频...")
    
    # 创建FFmpeg concat文件
    concat_file = temp_dir / "concat_list.txt"
    with open(concat_file, "w", encoding="utf-8") as f:
        for segment in audio_segments:
            f.write(f"file '{segment}'\n")
    
    # 拼接音频
    output_audio = audio_dir / f"complete_{today}_v2.mp3"
    result = subprocess.run(
        [
            ffmpeg_path, "-f", "concat", "-safe", "0",
            "-i", str(concat_file),
            "-c", "copy",
            str(output_audio)
        ],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"FFmpeg拼接失败：{result.stderr}")
        sys.exit(1)
    
    print(f"音频已保存：{output_audio}")
    
    # 保存timing.json
    timing_path = audio_dir / f"timing_{today}_v2.json"
    with open(timing_path, "w", encoding="utf-8") as f:
        json.dump(timing_data, f, ensure_ascii=False, indent=2)
    print(f"时间表已保存：{timing_path}")
    
    # 清理临时文件
    print("\n清理临时文件...")
    for f in temp_dir.glob("*.mp3"):
        f.unlink()
    concat_file.unlink()
    
    # 输出摘要
    print("\n" + "="*50)
    print("TTS生成完成！")
    print(f"输出音频：{output_audio}")
    print(f"总时长：{current_offset:.2f}秒")
    print("="*50)


if __name__ == "__main__":
    main()
