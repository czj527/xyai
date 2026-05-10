import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NewsItem } from '@/lib/supabase';

// 数据格式规范化：字符串→数组，空summary用ai_summary兜底
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
  return item as NewsItem;
}



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
    }).map(n => normalizeNewsItem(n));

    allNews.sort((a, b) => 
      (PRIORITY_ORDER[a.priority] || 5) - (PRIORITY_ORDER[b.priority] || 5)
    );

    const index = allNews.findIndex(n => n.id === id);
    if (index !== -1) {
      targetNews = allNews[index] as ExtendedNewsItem;
      currentIndex = index;
      prevNews = index > 0 ? allNews[index - 1] : null;
      nextNews = index < allNews.length - 1 ? allNews[index + 1] : null;


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
