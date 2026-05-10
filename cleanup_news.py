#!/usr/bin/env python3
import os
import json
import requests

# 加载环境变量
with open('.env.local', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            key, value = line.strip().split('=', 1)
            os.environ[key] = value

SUPABASE_URL = os.environ['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

ai_keywords = [
    'AI', '人工智能', '大模型', 'LLM', 'GPT', 'Claude', 'Gemini', '机器学习', '深度学习',
    '神经网络', 'OpenAI', 'Anthropic', 'Google', 'Meta', 'Microsoft', '百度', '阿里',
    '腾讯', '字节', '华为', 'DeepSeek', '智能', '算法', '训练', '推理', 'AGI',
    'Transformer', 'Diffusion', '生成式', 'AIGC', 'ChatGPT', 'Copilot', 'Agent',
    '机器人', 'robot', '自动驾驶', '计算机视觉', 'NLP', '自然语言', '语音',
    '模型', '算力', 'GPU', 'TPU', '芯片', '半导体', '具身', 'embodied'
]

def is_ai_related(title, summary=''):
    text = (title + ' ' + summary).lower()
    for kw in ai_keywords:
        if kw.lower() in text:
            return True
    return False

# 获取所有日报
response = requests.get(f'{SUPABASE_URL}/rest/v1/xyai_daily_reports?order=date.desc', headers=headers)
data = response.json()

total_removed = 0

for report in data:
    news = report.get('news', [])
    cleaned_news = []
    
    for item in news:
        title = item.get('title', '')
        summary = item.get('summary', '') + ' ' + item.get('ai_summary', '')
        
        if is_ai_related(title, summary):
            cleaned_news.append(item)
        else:
            total_removed += 1
            print(f'移除: {title[:60]}')
    
    if len(cleaned_news) != len(news):
        # 更新报告
        update_data = {
            'news': cleaned_news,
            'headline': cleaned_news[0]['title'] if cleaned_news else report.get('headline', '')
        }
        
        resp = requests.patch(
            f'{SUPABASE_URL}/rest/v1/xyai_daily_reports?id=eq.{report["id"]}',
            headers=headers,
            json=update_data
        )
        
        if resp.status_code in [200, 204]:
            print(f'✓ 更新成功: {report["date"]} {report["period"]} ({len(news)} -> {len(cleaned_news)})')
        else:
            print(f'✗ 更新失败: {report["date"]} {report["period"]} - {resp.text}')

print(f'\n共移除 {total_removed} 条非AI新闻')
