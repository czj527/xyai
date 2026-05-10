// 周报/月报生成 API
// POST /api/report/weekly - 生成周报
// POST /api/report/monthly - 生成月报

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

// 生成周报 Markdown
function generateWeeklyMarkdown(startDate: string, endDate: string, news: NewsItem[]): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange = `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
  
  // 按分类分组
  const categories: Record<string, NewsItem[]> = {};
  news.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });
  
  let md = `# 🌿 新叶AI周报 - ${dateRange}\n\n`;
  md += `> 本周 AI 领域重要资讯汇总\n\n`;
  md += `---\n\n`;
  
  // 统计
  md += `## 📊 本周概览\n\n`;
  md += `- **资讯总数**: ${news.length} 条\n`;
  md += `- **分类分布**: ${Object.entries(categories).map(([k, v]) => `${k}(${v.length})`).join('、')}\n\n`;
  
  // 按分类展示
  Object.entries(categories).forEach(([category, items]) => {
    md += `## ${category}\n\n`;
    items.forEach((item, idx) => {
      md += `### ${idx + 1}. ${item.title}\n\n`;
      md += `> ${item.source} | ${item.priority}\n\n`;
      md += `${item.summary}\n\n`;
    });
  });
  
  md += `---\n\n`;
  md += `*由新叶AI自动生成 | [访问网站](https://xyai.czj527.xyz)*\n`;
  
  return md;
}

// 生成月报 Markdown
function generateMonthlyMarkdown(year: number, month: number, news: NewsItem[]): string {
  // 按分类分组
  const categories: Record<string, NewsItem[]> = {};
  news.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });
  
  // 按优先级统计
  const priorities: Record<string, number> = {};
  news.forEach(item => {
    priorities[item.priority] = (priorities[item.priority] || 0) + 1;
  });
  
  let md = `# 🌿 新叶AI月报 - ${year}年${month}月\n\n`;
  md += `> 本月 AI 领域重要资讯汇总\n\n`;
  md += `---\n\n`;
  
  // 统计
  md += `## 📊 本月概览\n\n`;
  md += `- **资讯总数**: ${news.length} 条\n`;
  md += `- **优先级分布**: ${Object.entries(priorities).map(([k, v]) => `${k}(${v})`).join('、')}\n`;
  md += `- **分类分布**: ${Object.entries(categories).map(([k, v]) => `${k}(${v.length})`).join('、')}\n\n`;
  
  // 热点 Top 10
  const topNews = news.slice(0, 10);
  md += `## 🔥 本月热点 Top 10\n\n`;
  topNews.forEach((item, idx) => {
    md += `${idx + 1}. **${item.title}** - ${item.source}\n`;
  });
  md += `\n`;
  
  // 按分类展示
  Object.entries(categories).forEach(([category, items]) => {
    md += `## ${category}\n\n`;
    items.slice(0, 5).forEach((item, idx) => {
      md += `${idx + 1}. ${item.title}\n`;
    });
    if (items.length > 5) {
      md += `... 等 ${items.length} 条\n`;
    }
    md += `\n`;
  });
  
  md += `---\n\n`;
  md += `*由新叶AI自动生成 | [访问网站](https://xyai.czj527.xyz)*\n`;
  
  return md;
}

// POST: 生成周报
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, start_date, end_date } = body;
    
    if (!type || !['weekly', 'monthly'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "weekly" or "monthly"' },
        { status: 400 }
      );
    }
    
    let startDate: string;
    let endDate: string;
    
    if (type === 'weekly') {
      // 默认本周
      if (!start_date || !end_date) {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek + 1);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        startDate = start.toISOString().split('T')[0];
        endDate = end.toISOString().split('T')[0];
      } else {
        startDate = start_date;
        endDate = end_date;
      }
    } else {
      // 月报：默认上月
      if (!start_date || !end_date) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        
        startDate = start.toISOString().split('T')[0];
        endDate = end.toISOString().split('T')[0];
      } else {
        startDate = start_date;
        endDate = end_date;
      }
    }
    
    // 获取指定日期范围的所有新闻
    const { data: reports, error } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('news')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // 合并所有新闻
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
    let markdown: string;
    if (type === 'weekly') {
      markdown = generateWeeklyMarkdown(startDate, endDate, uniqueNews);
    } else {
      const start = new Date(startDate);
      markdown = generateMonthlyMarkdown(start.getFullYear(), start.getMonth() + 1, uniqueNews);
    }
    
    // 保存到数据库
    const { error: saveError } = await supabaseAdmin
      .from('xyai_reports')
      .upsert({
        date: startDate,
        end_date: endDate,
        type,
        content: markdown,
        news_count: uniqueNews.length,
        created_at: new Date().toISOString()
      }, { onConflict: 'date,type' });
    
    if (saveError) {
      console.error('Save report error:', saveError);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        type,
        start_date: startDate,
        end_date: endDate,
        news_count: uniqueNews.length,
        markdown_url: `/api/report/${type}?date=${startDate}`
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
