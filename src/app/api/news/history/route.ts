// 历史数据 API
// GET /api/news/history

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url?: string;
  category: string;
  priority?: string;
  published_at: string;
}

interface DailyReport {
  date: string;
  news: NewsItem[];
}

interface ReportSummary {
  date: string;
  news_count: number;
  top_news: NewsItem[];
}

// 获取指定日期范围的报告
async function getReportsByDateRange(startDate: string, endDate: string): Promise<ReportSummary[]> {
  try {
    const { data: reports, error } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('date, news')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error || !reports) {
      console.error('Failed to fetch reports:', error);
      return [];
    }
    
    // 按日期分组合并
    const reportsByDate: Record<string, NewsItem[]> = {};
    
    reports.forEach(report => {
      const date = report.date;
      if (!reportsByDate[date]) {
        reportsByDate[date] = [];
      }
      if (report.news && Array.isArray(report.news)) {
        reportsByDate[date].push(...report.news);
      }
    });
    
    // 转换为摘要格式
    const summaries: ReportSummary[] = Object.entries(reportsByDate).map(([date, news]) => {
      // 去重
      const uniqueNews = news.filter((item, index, self) =>
        index === self.findIndex(t => t.source_url === item.source_url)
      );
      
      // 按优先级排序
      const priorityOrder: Record<string, number> = { SSS: 0, SS: 1, S: 2, A: 3, B: 4 };
      uniqueNews.sort((a, b) => (priorityOrder[a.priority || 'B'] || 5) - (priorityOrder[b.priority || 'B'] || 5));
      
      return {
        date,
        news_count: uniqueNews.length,
        top_news: uniqueNews.slice(0, 5)
      };
    });
    
    return summaries;
  } catch (error) {
    console.error('Get reports error:', error);
    return [];
  }
}

// 获取本周日期范围
function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek + 1); // 周一
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // 周日
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// 获取上周日期范围
function getLastWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const end = new Date(now);
  end.setDate(now.getDate() - dayOfWeek); // 上周日
  const start = new Date(end);
  start.setDate(end.getDate() - 6); // 上周一
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// 获取上月日期范围
function getLastMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

export async function GET(request: NextRequest) {
  try {
    const weekRange = getWeekRange();
    const lastWeekRange = getLastWeekRange();
    const lastMonthRange = getLastMonthRange();
    
    // 并行获取数据
    const [thisWeek, lastWeek, lastMonth] = await Promise.all([
      getReportsByDateRange(weekRange.start, weekRange.end),
      getReportsByDateRange(lastWeekRange.start, lastWeekRange.end),
      getReportsByDateRange(lastMonthRange.start, lastMonthRange.end)
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        this_week: thisWeek,
        last_week: lastWeek,
        last_month: lastMonth
      }
    });
    
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
