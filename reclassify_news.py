#!/usr/bin/env python3
"""清理旧数据并重新分类"""
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

# 新分类系统
AI_CATEGORIES = {
    '模型发布': ['模型', 'model', 'gpt', 'claude', 'gemini', 'llama', 'qwen', '通义', '文心', '发布', 'release', 'launch', '升级', 'update', '版本', 'version', '新模型', '大模型', 'llm', 'foundation model'],
    '工具发布': ['工具', 'tool', '产品', 'product', 'app', '应用', '平台', 'platform', '插件', 'plugin', '扩展', 'extension', 'sdk', 'api', '框架', 'framework', '开源', 'open source', 'github', 'agent', '智能体'],
    '政策融资': ['政策', '法规', '监管', 'regulation', 'policy', '融资', 'funding', '投资', 'investment', '收购', 'acquisition', '上市', 'ipo', '估值', 'valuation', '亿美元', 'million', 'billion', '轮', 'round', '风投', 'vc', '政府', 'government'],
}

def categorize(title, summary=''):
    text = (title + ' ' + summary).lower()
    for category, keywords in AI_CATEGORIES.items():
        for keyword in keywords:
            if keyword.lower() in text:
                return category
    return '项目相关'

# 获取所有日报
response = requests.get(f'{SUPABASE_URL}/rest/v1/xyai_daily_reports?order=date.desc', headers=headers)
data = response.json()

print(f'找到 {len(data)} 个日报记录')

# 更新每个日报的分类
for report in data:
    news = report.get('news', [])
    if not news:
        continue
    
    updated = False
    for item in news:
        old_category = item.get('category', '')
        new_category = categorize(item.get('title', ''), item.get('summary', ''))
        
        if old_category != new_category:
            item['category'] = new_category
            updated = True
    
    if updated:
        # 更新日报
        update_data = {'news': news}
        resp = requests.patch(
            f'{SUPABASE_URL}/rest/v1/xyai_daily_reports?id=eq.{report["id"]}',
            headers=headers,
            json=update_data
        )
        
        if resp.status_code in [200, 204]:
            print(f'✓ 更新成功: {report["date"]} {report["period"]}')
        else:
            print(f'✗ 更新失败: {report["date"]} {report["period"]} - {resp.text[:100]}')

print('\\n分类更新完成！')

# 统计新分类
category_counts = {}
for report in data:
    for item in report.get('news', []):
        cat = categorize(item.get('title', ''), item.get('summary', ''))
        category_counts[cat] = category_counts.get(cat, 0) + 1

print('\\n新分类统计:')
for cat, count in category_counts.items():
    print(f'  {cat}: {count} 条')
