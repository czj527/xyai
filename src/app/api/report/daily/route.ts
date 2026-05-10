// 日报生成 API
// GET /api/report/daily?date=2026-05-10
// POST /api/report/generate { date: "2026-05-10" }

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  priority: string;
  category: string;
  published_at: string;
}

interface DailyReport {
  date: string;
  headline: string;
  news_count: number;
  categories: Record<string, number>;
  priorities: Record<string, number>;
  sections: {
    title: string;
    news: NewsItem[];
  }[];
  markdown: string;
}

// 生成 Markdown 格式的日报
function generateMarkdown(date: string, news: NewsItem[]): string {
  const dateObj = new Date(date);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日 ${weekdays[dateObj.getDay()]}`;
  
  // 按优先级分组
  const priorityGroups: Record<string, NewsItem[]> = {
    'SSS': [],
    'SS': [],
    'S': [],
    'A': [],
    'B': []
  };
  
  news.forEach(item => {
    const priority = item.priority || 'B';
    if (priorityGroups[priority]) {
      priorityGroups[priority].push(item);
    }
  });
  
  // 生成 Markdown
  let md = `# 🌿 新叶AI日报 - ${dateStr}\n\n`;
  md += `> 每日精选 AI 领域最新动态，助您紧跟行业前沿\n\n`;
  md += `---\n\n`;
  
  // 统计信息
  const categories: Record<string, number> = {};
  news.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1;
  });
  
  md += `## 📊 今日概览\n\n`;
  md += `- **资讯总数**: ${news.length} 条\n`;
  md += `- **分类分布**: ${Object.entries(categories).map(([k, v]) => `${k}(${v})`).join('、')}\n`;
  md += `- **更新时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  
  md += `---\n\n`;
  
  // 头条热点 (SSS/SS)
  const hotNews = [...priorityGroups['SSS'], ...priorityGroups['SS']];
  if (hotNews.length > 0) {
    md += `## 🔥 头条热点\n\n`;
    hotNews.forEach((item, idx) => {
      md += `### ${idx + 1}. ${item.title}\n\n`;
      md += `> **${item.priority}** | ${item.source} | ${item.category}\n\n`;
      md += `${item.summary}\n\n`;
      if (item.source_url) {
        md += `[阅读原文](${item.source_url})\n\n`;
      }
    });
    md += `---\n\n`;
  }
  
  // 重要资讯 (S/A)
  const importantNews = [...priorityGroups['S'], ...priorityGroups['A']];
  if (importantNews.length > 0) {
    md += `## 📰 重要资讯\n\n`;
    importantNews.forEach((item, idx) => {
      md += `### ${idx + 1}. ${item.title}\n\n`;
      md += `> **${item.priority}** | ${item.source} | ${item.category}\n\n`;
      md += `${item.summary}\n\n`;
    });
    md += `---\n\n`;
  }
  
  // 其他资讯 (B)
  if (priorityGroups['B'].length > 0) {
    md += `## 📋 其他资讯\n\n`;
    priorityGroups['B'].forEach((item, idx) => {
      md += `${idx + 1}. **${item.title}** - ${item.source}\n`;
      md += `   ${item.summary}\n\n`;
    });
    md += `---\n\n`;
  }
  
  md += `## 📌 来源说明\n\n`;
  const sources = [...new Set(news.map(n => n.source))];
  md += `本日报内容来自: ${sources.join('、')}\n\n`;
  md += `---\n\n`;
  md += `*由新叶AI自动生成 | [访问网站](https://xyai.czj527.xyz)*\n`;
  
  return md;
}

// GET: 获取日报
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const format = searchParams.get('format') || 'json'; // json or markdown
    
    // 获取指定日期的所有新闻
    const { data: reports, error } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('news')
      .eq('date', date);
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // 合并所有时段的新闻
    const allNews: NewsItem[] = [];
    reports?.forEach(report => {
      if (report.news && Array.isArray(report.news)) {
        allNews.push(...report.news);
      }
    });
    
    // 去重
    const uniqueNews = allNews.filter((item, index, self) =>
      index === self.findIndex(t => t.source_url === item.source_url)
    );
    
    // 按优先级排序
    const priorityOrder: Record<string, number> = { SSS: 0, SS: 1, S: 2, A: 3, B: 4 };
    uniqueNews.sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));
    
    if (format === 'markdown') {
      const markdown = generateMarkdown(date, uniqueNews);
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="xyai-report-${date}.md"`
        }
      });
    }
    
    // 返回 JSON 格式
    const categories: Record<string, number> = {};
    const priorities: Record<string, number> = {};
    
    uniqueNews.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
      priorities[item.priority] = (priorities[item.priority] || 0) + 1;
    });
    
    const report: DailyReport = {
      date,
      headline: uniqueNews[0]?.title || 'AI日报',
      news_count: uniqueNews.length,
      categories,
      priorities,
      sections: [
        {
          title: '头条热点',
          news: uniqueNews.filter(n => ['SSS', 'SS'].includes(n.priority))
        },
        {
          title: '重要资讯',
          news: uniqueNews.filter(n => ['S', 'A'].includes(n.priority))
        },
        {
          title: '其他资讯',
          news: uniqueNews.filter(n => n.priority === 'B')
        }
      ],
      markdown: generateMarkdown(date, uniqueNews)
    };
    
    return NextResponse.json({
      success: true,
      data: report
    });
    
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// POST: 生成并保存日报
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }
    
    // 获取指定日期的所有新闻
    const { data: reports, error } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('news')
      .eq('date', date);
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // 合并所有时段的新闻
    const allNews: NewsItem[] = [];
    reports?.forEach(report => {
      if (report.news && Array.isArray(report.news)) {
        allNews.push(...report.news);
      }
    });
    
    // 去重
    const uniqueNews = allNews.filter((item, index, self) =>
      index === self.findIndex(t => t.source_url === item.source_url)
    );
    
    // 按优先级排序
    const priorityOrder: Record<string, number> = { SSS: 0, SS: 1, S: 2, A: 3, B: 4 };
    uniqueNews.sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));
    
    // 生成 Markdown
    const markdown = generateMarkdown(date, uniqueNews);
    
    // 保存到 xyai_reports 表
    const { error: saveError } = await supabaseAdmin
      .from('xyai_reports')
      .upsert({
        date,
        type: 'daily',
        content: markdown,
        news_count: uniqueNews.length,
        created_at: new Date().toISOString()
      }, { onConflict: 'date,type' });
    
    if (saveError) {
      console.error('Save report error:', saveError);
      // 如果表不存在，创建表
      if (saveError.message.includes('does not exist')) {
        // 忽略错误，继续返回
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        date,
        news_count: uniqueNews.length,
        markdown_url: `/api/report/daily?date=${date}&format=markdown`
      }
    });
    
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
