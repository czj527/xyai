import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NewsItem } from '@/lib/supabase';

interface ExtendedNewsItem extends NewsItem {
  core_facts?: string[];
  key_data?: string[];
  related_links?: { title: string; url: string }[];
}

const PRIORITY_ORDER: Record<string, number> = {
  'SSS': 0, 'SS': 1, 'S': 2, 'A': 3, 'B': 4,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let targetNews: ExtendedNewsItem | null = null;
    let currentIndex = 0;
    let prevNews: NewsItem | null = null;
    let nextNews: NewsItem | null = null;

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

    let allNews: NewsItem[] = [];
    if (data && data.length > 0) {
      for (const report of data) {
        if (report.news && Array.isArray(report.news)) {
          allNews = allNews.concat(report.news);
        }
      }
    }

    const seen = new Set<string>();
    allNews = allNews.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    allNews.sort((a, b) => 
      (PRIORITY_ORDER[a.priority] || 5) - (PRIORITY_ORDER[b.priority] || 5)
    );

    const index = allNews.findIndex(n => n.id === id);
    if (index !== -1) {
      targetNews = allNews[index] as ExtendedNewsItem;
      currentIndex = index;
      prevNews = index > 0 ? allNews[index - 1] : null;
      nextNews = index < allNews.length - 1 ? allNews[index + 1] : null;

      if (targetNews.core_facts || targetNews.key_data) {
        // Already extended
      } else {
        targetNews.core_facts = [
          '这是该新闻的核心事实第一点',
          '这是该新闻的核心事实第二点',
        ];
        targetNews.key_data = [
          '关键数据项1',
          '关键数据项2',
        ];
        targetNews.related_links = [];
      }
    }

    if (!targetNews) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'News not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: targetNews,
      index: currentIndex,
      total: allNews.length,
      prev: prevNews ? { id: prevNews.id, title: prevNews.title } : null,
      next: nextNews ? { id: nextNews.id, title: nextNews.title } : null,
      updated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('News detail API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news detail',
      },
      { status: 500 }
    );
  }
}
