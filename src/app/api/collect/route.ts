// 资讯采集API路由
// 采集RSS → AI过滤评分 → MiMo摘要 → 写入Supabase

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Parser from 'rss-parser';

// RSS解析器（带自定义字段）
const rssParser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; XyAI-Bot/1.0)',
  },
  customFields: {
    item: ['media:content', 'media:thumbnail'],
  },
});

// 信息源配置（RSS）
const RSS_SOURCES = [
  // 中文源
  { name: '量子位', url: 'https://www.qbitai.com/feed', priority: 5, lang: 'zh' },
  { name: '机器之心', url: 'https://www.jiqizhixin.com/rss', priority: 5, lang: 'zh' },
  { name: '36氪', url: 'https://36kr.com/feed', priority: 4, lang: 'zh' },
  // 英文源
  { name: 'HackerNews', url: 'https://hnrss.org/frontpage', priority: 3, lang: 'en' },
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', priority: 5, lang: 'en' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', priority: 3, lang: 'en' },
  // 新增源
  { name: 'arXiv CS.AI', url: 'https://rss.arxiv.org/rss/cs.AI', priority: 4, lang: 'en' },
  { name: 'HuggingFace Blog', url: 'https://huggingface.co/blog/feed.xml', priority: 4, lang: 'en' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', priority: 3, lang: 'en' },
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/feed/', priority: 4, lang: 'en' },
];

// 关键词过滤
const AI_KEYWORDS = [
  'AI', '人工智能', 'LLM', 'GPT', 'Claude', 'Gemini', '大模型',
  'machine learning', 'deep learning', 'neural network',
  'OpenAI', 'Anthropic', 'Google', 'Meta', 'Microsoft',
  '百度', '阿里', '腾讯', '字节', '华为',
];

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  priority: 'SSS' | 'SS' | 'S' | 'A' | 'B';
  category: string;
  published_at: string;
  ai_summary?: string;
  core_facts?: string[];
  key_data?: string[];
}

// MiMo API 调用
async function callMiMoAPI(prompt: string): Promise<string> {
  const apiKey = process.env.MIMO_API_KEY;
  const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1';
  
  if (!apiKey) {
    throw new Error('MIMO_API_KEY not configured');
  }
  
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mimo-v2.5',
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });
  
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`MiMo API error: ${response.status} ${errText}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// RSS抓取（使用rss-parser库）
async function fetchRSS(url: string): Promise<{ title: string; link: string; description: string; pubDate: string }[]> {
  try {
    const feed = await rssParser.parseURL(url);
    
    return (feed.items || [])
      .filter(item => item.title && item.link)
      .map(item => ({
        title: cleanHtml(item.title || ''),
        link: item.link || '',
        description: cleanHtml(item.contentSnippet || item.content || item.summary || ''),
        pubDate: item.pubDate || item.isoDate || '',
      }));
  } catch (error) {
    console.error(`Error fetching RSS: ${url}`, error);
    return [];
  }
}

// 清理HTML标签
function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// 关键词匹配评分
function scoreNews(title: string, description: string): number {
  let score = 0;
  const text = (title + ' ' + description).toLowerCase();
  
  // 关键词匹配
  for (const keyword of AI_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      score += 5;
    }
  }
  
  // 高权重关键词
  const highWeightKeywords = ['gpt-5', 'claude 4', 'gemini 3', '发布', '开源', 'release', 'announced', 'breakthrough'];
  for (const keyword of highWeightKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 15;
    }
  }
  
  return Math.min(score, 100);
}

// 判断优先级
function getPriority(score: number): NewsItem['priority'] {
  if (score >= 80) return 'SSS';
  if (score >= 60) return 'SS';
  if (score >= 40) return 'S';
  if (score >= 20) return 'A';
  return 'B';
}

// 判断分类
function categorize(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('代码') || text.includes('code') || text.includes('programming') || text.includes('coding')) {
    return '代码';
  }
  if (text.includes('开源') || text.includes('open source')) {
    return '开源';
  }
  if (text.includes('安全') || text.includes('security') || text.includes('privacy')) {
    return '安全';
  }
  if (text.includes('产品') || text.includes('product') || text.includes('launch')) {
    return '产品';
  }
  if (text.includes('融资') || text.includes('funding') || text.includes('investment')) {
    return '融资';
  }
  
  return '大模型';
}

// 批量生成摘要（一次性处理多条，节省API调用）
async function generateBatchSummary(items: { title: string; description: string }[]): Promise<string[]> {
  if (items.length === 0) return [];
  
  // 如果只有1条，直接单独生成
  if (items.length === 1) {
    const summary = await generateSummary(items[0].title, items[0].description);
    return [summary];
  }
  
  // 批量生成：将多条新闻合并到一个prompt中
  const newsList = items.map((item, i) => 
    `${i + 1}. 标题：${item.title}\n   内容：${item.description.slice(0, 300)}`
  ).join('\n\n');
  
  const prompt = `请为以下AI新闻各生成50字以内的中文摘要，用JSON数组格式返回：

${newsList}

要求：
1. 提取关键信息
2. 语言简洁专业
3. 每条50字以内
4. 返回格式：["摘要1", "摘要2", ...]`;

  try {
    const result = await callMiMoAPI(prompt);
    // 尝试解析JSON数组
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const summaries = JSON.parse(jsonMatch[0]);
      if (Array.isArray(summaries) && summaries.length === items.length) {
        return summaries.map((s: string) => String(s).slice(0, 100));
      }
    }
    // 解析失败，降级为逐条截取
    return items.map(item => item.description.slice(0, 100));
  } catch (error) {
    console.error('Batch summary error, using fallback:', error);
    return items.map(item => item.description.slice(0, 100));
  }
}

// 单条摘要生成（降级用）
async function generateSummary(title: string, description: string): Promise<string> {
  const prompt = `请为以下AI新闻生成50字以内的中文摘要：

标题：${title}
内容：${description.slice(0, 500)}

要求：
1. 提取关键信息
2. 语言简洁专业
3. 50字以内`;

  try {
    const summary = await callMiMoAPI(prompt);
    return summary.slice(0, 100) || description.slice(0, 100);
  } catch (error) {
    console.error('MiMo API error, using fallback:', error);
    return description.slice(0, 100);
  }
}

// 从Supabase获取已有新闻标题（用于去重）
async function getExistingTitles(): Promise<Set<string>> {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const { data, error } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('news')
      .gte('date', threeDaysAgo.toISOString().split('T')[0]);
    
    if (error || !data) return new Set();
    
    const titles = new Set<string>();
    for (const report of data) {
      if (report.news && Array.isArray(report.news)) {
        for (const item of report.news) {
          if (item.title) {
            titles.add(item.title.toLowerCase().trim());
          }
        }
      }
    }
    return titles;
  } catch {
    return new Set();
  }
}

// 写入待审核表
async function writeToPendingNews(news: NewsItem[]): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    // 先检查 source_url 去重
    const sourceUrls = news.map(n => n.source_url).filter(Boolean);
    const { data: existing } = await supabaseAdmin
      .from('xyai_pending_news')
      .select('source_url')
      .in('source_url', sourceUrls);
    
    const existingUrls = new Set((existing || []).map(e => e.source_url));
    const newNews = news.filter(n => !existingUrls.has(n.source_url));
    
    if (newNews.length === 0) {
      return { success: true, count: 0 };
    }
    
    // 批量插入待审核表
    const rows = newNews.map(item => ({
      title: item.title,
      summary: item.summary,
      source: item.source,
      source_url: item.source_url,
      priority: item.priority,
      category: item.category,
      published_at: item.published_at,
      status: 'draft',
    }));
    
    const { error } = await supabaseAdmin
      .from('xyai_pending_news')
      .insert(rows);
    
    if (error) {
      console.error('Pending news insert error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, count: newNews.length };
  } catch (error) {
    console.error('Pending news write error:', error);
    return { success: false, error: String(error) };
  }
}

// POST: 手动触发采集
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { source, dry_run } = body as { source?: string; dry_run?: boolean };
    
    console.log('[采集Agent] 开始采集资讯', { source, dry_run });
    
    // 获取已有标题用于去重
    const existingTitles = await getExistingTitles();
    console.log(`[采集Agent] 已有 ${existingTitles.size} 条历史标题`);
    
    const results: NewsItem[] = [];
    const sourcesToFetch = source 
      ? RSS_SOURCES.filter(s => s.name === source)
      : RSS_SOURCES;
    
    // 采集所有RSS源
    for (const sourceConfig of sourcesToFetch) {
      const items = await fetchRSS(sourceConfig.url);
      console.log(`[采集Agent] ${sourceConfig.name}: 获取 ${items.length} 条`);
      
      for (const item of items) {
        const score = scoreNews(item.title, item.description);
        
        // 只保留AI相关且评分较高的，且去重
        if (score >= 15 && !existingTitles.has(item.title.toLowerCase().trim())) {
          results.push({
            id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: item.title,
            summary: '', // 稍后批量生成
            source: sourceConfig.name,
            source_url: item.link,
            priority: getPriority(score),
            category: categorize(item.title, item.description),
            published_at: item.pubDate || new Date().toISOString(),
          });
        }
      }
    }
    
    // 按优先级排序，取前15条
    const sortedResults = results
      .sort((a, b) => {
        const priorityOrder = { SSS: 0, SS: 1, S: 2, A: 3, B: 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 15);
    
    console.log(`[采集Agent] 过滤后 ${sortedResults.length} 条待处理`);
    
    // 批量生成摘要
    if (sortedResults.length > 0) {
      const summaries = await generateBatchSummary(
        sortedResults.map(r => ({ title: r.title, description: r.summary || '' }))
      );
      sortedResults.forEach((item, i) => {
        item.summary = summaries[i] || item.title;
      });
    }
    
    // dry_run模式：只返回结果，不写入数据库
    if (dry_run) {
      return NextResponse.json({
        success: true,
        count: sortedResults.length,
        news: sortedResults,
        dry_run: true,
        timestamp: new Date().toISOString(),
      });
    }
    
    // 写入待审核表
    let dbResult = { success: true, count: 0 };
    if (sortedResults.length > 0) {
      dbResult = await writeToPendingNews(sortedResults);
    }
    
    console.log(`[采集Agent] 采集完成，${sortedResults.length}条，待审核: ${dbResult.count}`);
    
    return NextResponse.json({
      success: true,
      count: sortedResults.length,
      news: sortedResults,
      db_write: dbResult,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[采集Agent] 采集失败:', error);
    return NextResponse.json(
      { success: false, error: '采集失败' },
      { status: 500 }
    );
  }
}

// GET: 获取采集状态
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    sources: RSS_SOURCES.map(s => ({
      name: s.name,
      priority: s.priority,
      available: true,
    })),
    model: 'mimo-v2.5 (采集) / mimo-v2.5-pro (对话)',
    timestamp: new Date().toISOString(),
  });
}
