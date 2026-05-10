#!/usr/bin/env python3
"""
新叶早报文案生成脚本 V2
两步流程：
1. 生成文字版早报（markdown格式，详细解读）
2. 根据文字早报生成语音播报文案（口语化、适合TTS）
"""

import os
import sys
import json
import requests
from datetime import datetime
from pathlib import Path

# Supabase配置
SUPABASE_URL = "https://wotpzpegbgpqzxesqcas.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdHB6cGVnYmdwcXp4ZXNxY2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzNjUwNCwiZXhwIjoyMDkzMTEyNTA0fQ.g6mf20Vh6M8U06DvWk7K_cajexpd8L3QKfSzvnQrGlw"

# MiMo API配置
MIMO_BASE_URL = "https://api.xiaomimimo.com/v1"
MIMO_API_KEY = "sk-ckqxsx8mbxtb08jrbpqlui4rfwqcqpgy29xxcikid8a62323"
MIMO_MODEL = "mimo-v2-flash"


def get_mimo_response(messages: list, model: str = MIMO_MODEL, temperature: float = 0.7) -> str:
    """调用MiMo API生成文本"""
    headers = {
        "Authorization": f"Bearer {MIMO_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }
    
    response = requests.post(
        f"{MIMO_BASE_URL}/chat/completions",
        json=data,
        headers=headers,
        timeout=60
    )
    response.raise_for_status()
    result = response.json()
    return result["choices"][0]["message"]["content"]


def fetch_news_from_supabase(limit: int = 8):
    """从Supabase获取今日资讯"""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    # 从xyai_daily_reports表获取最新数据
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/xyai_daily_reports",
        headers=headers,
        params={
            "select": "date,period,news",
            "order": "date.desc,period.asc",
            "limit": 1
        }
    )
    response.raise_for_status()
    reports = response.json()
    
    if not reports:
        print("没有获取到日报数据")
        return []
    
    # 从最新报告中提取新闻
    latest_report = reports[0]
    news = latest_report.get("news", [])
    
    # 按优先级排序并限制数量
    priority_order = {"SSS": 0, "SS": 1, "S": 2, "A": 3, "B": 4}
    news_sorted = sorted(news, key=lambda x: priority_order.get(x.get("priority", "B"), 5))
    
    print(f"从Supabase获取到 {len(news_sorted)} 条新闻")
    return news_sorted[:limit]


def format_date_cn():
    """格式化中文日期"""
    now = datetime.now()
    weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    return f"{now.year}年{now.month}月{now.day}日 {weekdays[now.weekday()]}"


def step1_generate_text_report(news: list) -> str:
    """
    步骤1：生成文字版早报
    返回markdown格式的详细早报
    """
    print("\n=== 步骤1：生成文字版早报 ===")
    
    # 构建新闻摘要
    news_summary = ""
    for i, item in enumerate(news, 1):
        news_summary += f"""
### {i}. {item['title']}
- 来源：{item['source']}
- 优先级：{item['priority']}
- 摘要：{item['summary']}
"""

    prompt = f"""你是新叶早报的内容编辑，请根据以下今日AI资讯，生成一份详细的文字版早报。

要求：
1. 格式：Markdown
2. 标题：# 🌿 新叶早报 {format_date_cn()}
3. 每条新闻需要有详细的解读（200-300字），不能只是简单复述
4. 语言风格：专业但不晦涩，让读者快速了解要点
5. 可以补充相关的背景信息和行业影响
6. 结尾要有简短的总结

今日资讯：
{news_summary}

请生成完整的文字版早报："""

    messages = [
        {"role": "system", "content": "你是一位专业的科技媒体编辑，擅长用简洁清晰的语言解读AI领域的重要资讯。"},
        {"role": "user", "content": prompt}
    ]
    
    report = get_mimo_response(messages, temperature=0.7)
    return report


def step2_generate_voice_script(text_report: str, news: list) -> dict:
    """
    步骤2：根据文字早报生成语音播报文案
    返回适合TTS的脚本JSON
    """
    print("\n=== 步骤2：生成语音播报文案 ===")
    
    prompt = f"""你是新叶早报的播音员"绿"，请根据以下文字版早报，生成适合语音播报的文案。

要求：
1. 语气：专业、客观、简洁，像新闻播音员
2. 每条新闻80-100字，适合20秒播报
3. 只报道事实：发生了什么、核心数据是什么
4. 禁止使用感叹号（！），禁止评论性语句（如"太酷了""这意味着""感觉""让人兴奋""好消息""超酷"等）
5. 可适当用🌿等少量表情，不用✨
6. 开场白简洁，结束语简洁

格式要求（JSON）：
{{
  "opening": "开场白，20-30字，简洁打招呼和报日期",
  "items": [
    {{"title": "新闻标题", "script": "播报文案，80-100字，客观陈述"}},
    ...
  ],
  "closing": "结束语，20字以内，简洁收尾"
}}

文字版早报：
{text_report}

请生成语音播报文案（只输出JSON，不要其他内容）："""

    messages = [
        {"role": "system", "content": "你是一位专业客观的新闻播音员，播报风格简洁专业。"},
        {"role": "user", "content": prompt}
    ]
    
    script_text = get_mimo_response(messages, temperature=0.8)
    
    # 尝试解析JSON
    try:
        # 尝试提取JSON部分
        if "```json" in script_text:
            script_text = script_text.split("```json")[1].split("```")[0]
        elif "```" in script_text:
            script_text = script_text.split("```")[1].split("```")[0]
        
        script = json.loads(script_text.strip())
        
        # 计算总时长（开场约10秒，每条20秒，结束语10秒）
        total_duration = 10 + len(script.get("items", [])) * 20 + 10
        script["total_duration"] = total_duration
        
        return script
    except json.JSONDecodeError as e:
        print(f"JSON解析失败: {e}")
        print(f"原始输出: {script_text}")
        # 返回一个默认结构
        return {
            "opening": f"🌿 嘿！小伙伴们早上好！欢迎来到新叶早报~ 我是绿~ {format_date_cn()}，元气满满的一天从AI资讯开始！✨",
            "items": [{"title": n["title"], "script": n["summary"][:100] if n.get("summary") else n["title"], "duration": 20} for n in news],
            "closing": "🌿 以上就是今天的AI资讯啦！记得明天同一时间来看绿哦~ 我们明天见！拜拜~ 👋",
            "total_duration": 190
        }


def main():
    # 获取今天的日期
    today = datetime.now().strftime("%Y-%m-%d")
    
    # 创建输出目录
    base_dir = Path(__file__).parent.parent / "output"
    report_dir = base_dir / "reports"
    script_dir = base_dir / "scripts"
    
    report_dir.mkdir(parents=True, exist_ok=True)
    script_dir.mkdir(parents=True, exist_ok=True)
    
    # 步骤0：获取新闻数据
    print("正在从Supabase获取今日资讯...")
    news = fetch_news_from_supabase(limit=8)
    
    if not news:
        print("没有获取到新闻数据，退出")
        sys.exit(1)
    
    # 步骤1：生成文字版早报
    text_report = step1_generate_text_report(news)
    
    # 保存文字版早报
    report_path = report_dir / f"report_{today}.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(f"# 🌿 新叶早报\n\n")
        f.write(f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        f.write(text_report)
    print(f"\n文字版早报已保存：{report_path}")
    
    # 步骤2：生成语音播报文案
    voice_script = step2_generate_voice_script(text_report, news)
    
    # 为每条新闻添加duration字段
    for item in voice_script.get("items", []):
        if "duration" not in item:
            item["duration"] = 20
    
    # 保存语音播报文案
    script_path = script_dir / f"script_{today}.json"
    with open(script_path, "w", encoding="utf-8") as f:
        json.dump(voice_script, f, ensure_ascii=False, indent=2)
    print(f"语音播报文案已保存：{script_path}")
    
    # 输出摘要
    print("\n" + "="*50)
    print("生成完成！")
    print(f"文字版早报：{report_path}")
    print(f"语音播报文案：{script_path}")
    print(f"预估总时长：{voice_script.get('total_duration', 0)}秒")
    print("="*50)


if __name__ == "__main__":
    main()
