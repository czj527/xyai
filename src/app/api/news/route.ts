import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NewsItem } from '@/lib/supabase';

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
