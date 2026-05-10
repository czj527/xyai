import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NewsItem } from '@/lib/supabase';

// 新分类系统
const AI_CATEGORIES: Record<string, string[]> = {
  '模型发布': ['模型', 'model', 'gpt', 'claude', 'gemini', 'llama', 'qwen', '通义', '文心', '发布', 'release', 'launch', '升级', 'update', '版本', 'version', '新模型', '大模型', 'llm', 'foundation model'],
  '工具发布': ['工具', 'tool', '产品', 'product', 'app', '应用', '平台', 'platform', '插件', 'plugin', '扩展', 'extension', 'sdk', 'api', '框架', 'framework', '开源', 'open source', 'github', 'agent', '智能体'],
  '政策融资': ['政策', '法规', '监管', 'regulation', 'policy', '融资', 'funding', '投资', 'investment', '收购', 'acquisition', '上市', 'ipo', '估值', 'valuation', '亿美元', 'million', 'billion', '轮', 'round', '风投', 'vc', '政府', 'government'],
};

// 自动分类函数
function autoCategorize(title: string, summary: string = ''): string {
  const text = (title + ' ' + summary).toLowerCase();
  for (const [category, keywords] of Object.entries(AI_CATEGORIES)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  return '项目相关';
}

// 数据格式规范化：字符串→数组，空summary用ai_summary兜底，自动分类
function normalizeNewsItem(n: any): NewsItem {
  const item = { ...n };
  if (!item.summary || item.summary.trim() === '') {
    item.summary = item.ai_summary || '';
  }
  if (typeof item.core_facts === 'string') {
    const text = item.core_facts.trim();
    item.core_facts = text && text !== '无' ? text.split(/[。；]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];
  } else if (!Array.isArray(item.core_facts)) {
    item.core_facts = [];
  }
  if (typeof item.key_data === 'string') {
    const text = item.key_data.trim();
    item.key_data = text && text !== '无' ? text.split(/[，,；]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];
  } else if (!Array.isArray(item.key_data)) {
    item.key_data = [];
  }
  if (!Array.isArray(item.related_links)) {
    item.related_links = [];
  }
  
  // 自动分类（如果分类不在新系统中）
  const validCategories = ['模型发布', '工具发布', '政策融资', '项目相关'];
  if (!validCategories.includes(item.category)) {
    item.category = autoCategorize(item.title || '', item.summary || '');
  }
  
  return item as NewsItem;
}



// 优先级排序权重
const PRIORITY_ORDER: Record<string, number> = {
  'SSS': 0, 'SS': 1, 'S': 2, 'A': 3, 'B': 4,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'daily' | 'weekly' | 'monthly' || 'daily';
    const sortBy = searchParams.get('sort') as 'priority' | 'time' || 'priority';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');

    let allNews: NewsItem[] = [];

    if (type === 'daily') {
      // 从daily_reports读取最近7天的数据
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabaseAdmin
        .from('xyai_daily_reports')
        .select('news, date, period')
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('period', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
      }

      if (data && data.length > 0) {
        for (const report of data) {
          if (report.news && Array.isArray(report.news)) {
            allNews = allNews.concat(report.news);
          }
        }
      }
    } else if (type === 'weekly') {
      const { data } = await supabaseAdmin
        .from('xyai_weekly_reports')
        .select('highlights, summary, week_start')
        .order('week_start', { ascending: false })
        .limit(4);

      if (data && data.length > 0) {
        for (const report of data) {
          if (report.highlights && Array.isArray(report.highlights)) {
            allNews = allNews.concat(report.highlights);
          }
        }
      }
    } else if (type === 'monthly') {
      const { data } = await supabaseAdmin
        .from('xyai_monthly_reports')
        .select('highlights, summary, month')
        .order('month', { ascending: false })
        .limit(3);

      if (data && data.length > 0) {
        for (const report of data) {
          if (report.highlights && Array.isArray(report.highlights)) {
            allNews = allNews.concat(report.highlights);
          }
        }
      }
    }

    // 去重（按id）
    const seen = new Set<string>();
    allNews = allNews.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    // 排序
    if (sortBy === 'priority') {
      allNews.sort((a, b) => 
        (PRIORITY_ORDER[a.priority] || 5) - (PRIORITY_ORDER[b.priority] || 5)
      );
    } else {
      allNews.sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    }

    // 自动分类（使用 normalizeNewsItem）
    allNews = allNews.map(n => normalizeNewsItem(n));

    // 分页
    const total = allNews.length;
    const startIndex = (page - 1) * limit;
    const pagedNews = allNews.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: pagedNews,
      type,
      sortBy,
      page,
      limit,
      total,
      hasMore: startIndex + limit < total,
      updated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news',
        data: [],
        total: 0,
        hasMore: false,
      },
      { status: 500 }
    );
  }
}
