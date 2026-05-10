// 资讯采集API路由
// 采集RSS + 联网检索 → AI过滤评分 → MiMo摘要 → 写入Supabase

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

// 联网检索源配置
const WEB_SEARCH_QUERIES = [
  { query: 'AI latest news today 2024', source: 'Web Search', priority: 3 },
  { query: '大模型最新发布 2024', source: 'Web Search', priority: 4 },
  { query: 'OpenAI Google Anthropic latest', source: 'Web Search', priority: 4 },
  { query: 'AI startup funding news', source: 'Web Search', priority: 3 },
  { query: 'AI工具发布 最新', source: 'Web Search', priority: 3 },
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
  image_url?: string;
}

// AI资讯分类体系（简化版）
const AI_CATEGORIES = {
  '模型发布': { emoji: '🤖', keywords: ['模型', 'model', 'gpt', 'claude', 'gemini', 'llama', 'qwen', '通义', '文心', '发布', 'release', 'launch', '升级', 'update', '版本', 'version', '新模型', '大模型', 'llm', 'foundation model'] },
  '工具发布': { emoji: '🔧', keywords: ['工具', 'tool', '产品', 'product', 'app', '应用', '平台', 'platform', '插件', 'plugin', '扩展', 'extension', 'sdk', 'api', '框架', 'framework', '开源', 'open source', 'github', 'agent', '智能体'] },
  '政策融资': { emoji: '💰', keywords: ['政策', '法规', '监管', 'regulation', 'policy', '融资', 'funding', '投资', 'investment', '收购', 'acquisition', '上市', 'ipo', '估值', 'valuation', '亿美元', 'million', 'billion', '轮', 'round', '风投', 'vc', '政府', 'government'] },
  '项目相关': { emoji: '📦', keywords: [] }, // 默认分类
};

// 判断分类（改进版）
function categorize(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  // 按优先级匹配分类
  for (const [category, config] of Object.entries(AI_CATEGORIES)) {
    if (category === '项目相关') continue; // 跳过默认分类
    for (const keyword of config.keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  
  return '项目相关';
}

// 评分函数（改进版）
function scoreNews(title: string, description: string): number {
  let score = 0;
  const text = (title + ' ' + description).toLowerCase();
  
  // 关键词匹配
  AI_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });
  
  // 高权重关键词
  const highWeightKeywords = ['gpt-5', 'gpt5', 'claude 4', 'gemini 2', 'llama 4', '发布', 'release', 'launch', '融资', 'funding', '亿美元', 'billion'];
  highWeightKeywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 20;
    }
  });
  
  // 标题长度适中
  if (title.length > 10 && title.length < 100) {
    score += 5;
  }
  
  return score;
}

// 获取优先级
function getPriority(score: number): 'SSS' | 'SS' | 'S' | 'A' | 'B' {
  if (score >= 80) return 'SSS';
  if (score >= 60) return 'SS';
  if (score >= 40) return 'S';
  if (score >= 20) return 'A';
  return 'B';
}

// 联网检索AI资讯
async function searchWebNews(): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  
  for (const search of WEB_SEARCH_QUERIES) {
    try {
      // 使用 DuckDuckGo Instant Answer API
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(search.query)}&format=json&no_html=1&skip_disambig=1`,
        { 
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; XyAI-Bot/1.0)' },
          signal: AbortSignal.timeout(10000)
        }
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      // 解析结果
      if (data.AbstractText) {
        results.push({
          id: `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: data.Heading || search.query,
          summary: data.AbstractText.slice(0, 200),
          source: data.AbstractSource || search.source,
          source_url: data.AbstractURL || '',
          priority: getPriority(scoreNews(data.Heading || '', data.AbstractText)),
          category: categorize(data.Heading || '', data.AbstractText),
          published_at: new Date().toISOString(),
          image_url: data.Image || undefined
        });
      }
      
      // 解析 RelatedTopics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 3)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              id: `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              title: topic.Text.slice(0, 100),
              summary: topic.Text,
              source: search.source,
              source_url: topic.FirstURL,
              priority: getPriority(scoreNews(topic.Text, '')),
              category: categorize(topic.Text, ''),
              published_at: new Date().toISOString(),
              image_url: topic.Icon?.URL || undefined
            });
          }
        }
      }
    } catch (error) {
      console.error(`Web search failed for "${search.query}":`, error);
    }
  }
  
  return results;
}

// 获取RSS新闻
async function fetchRSS(url: string): Promise<any[]> {
  try {
    const feed = await rssParser.parseURL(url);
    return feed.items || [];
  } catch (error) {
    console.error(`RSS fetch error for ${url}:`, error);
    return [];
  }
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
    throw new Error(`MiMo API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 批量生成摘要
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

// 单条摘要生成
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
    data.forEach(report => {
      if (report.news && Array.isArray(report.news)) {
        report.news.forEach((item: any) => {
          if (item.title) {
            titles.add(item.title.toLowerCase().trim());
          }
        });
      }
    });
    
    return titles;
  } catch (error) {
    console.error('Get existing titles error:', error);
    return new Set();
  }
}

// AI自动审核新闻
async function aiReviewNews(news: NewsItem[]): Promise<(NewsItem & { ai_approved: boolean })[]> {
  if (news.length === 0) return [];
  
  const prompt = `请审核以下AI新闻，判断是否适合发布到AI资讯网站。

审核标准：
1. 必须与AI/人工智能/大模型/机器学习相关
2. 内容真实可信，非虚假信息
3. 有一定新闻价值，非纯广告或水文
4. 标题清晰，非乱码或截断

新闻列表：
${news.map((item, i) => `${i + 1}. [${item.priority}] ${item.title}\n   来源: ${item.source}`).join('\n\n')}

请返回JSON数组，每个元素包含：
- approved: boolean (是否通过审核)
- reason: string (审核理由，简短)

格式：[{"approved": true, "reason": "AI相关内容"}, ...]`;

  try {
    const result = await callMiMoAPI(prompt);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const reviews = JSON.parse(jsonMatch[0]);
      if (Array.isArray(reviews) && reviews.length === news.length) {
        return news.map((item, i) => ({
          ...item,
          ai_approved: reviews[i]?.approved ?? true,
        }));
      }
    }
    
    // 解析失败，默认全部通过
    return news.map(item => ({ ...item, ai_approved: true }));
  } catch (error) {
    console.error('AI review error, auto-approving:', error);
    return news.map(item => ({ ...item, ai_approved: true }));
  }
}

// 将已审核通过的新闻写入日报表
async function writeApprovedToDailyReports(news: NewsItem[]): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    
    // 查找今天的日报
    const { data: existingReport } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('id, news')
      .eq('date', today)
      .eq('period', period)
      .single();
    
    if (existingReport) {
      // 追加到已有日报
      const updatedNews = [...(existingReport.news || []), ...news];
      await supabaseAdmin
        .from('xyai_daily_reports')
        .update({ news: updatedNews })
        .eq('id', existingReport.id);
    } else {
      // 创建新日报
      await supabaseAdmin
        .from('xyai_daily_reports')
        .insert({
          date: today,
          period,
          news: news,
          headline: news[0]?.title || 'AI资讯',
        });
    }
    
    console.log(`[审核Agent] 已将 ${news.length} 条新闻写入日报`);
  } catch (error) {
    console.error('Write to daily reports error:', error);
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
    
    // AI 自动审核
    const reviewedNews = await aiReviewNews(newNews);
    
    // 批量插入待审核表
    const rows = reviewedNews.map(item => ({
      title: item.title,
      summary: item.summary,
      source: item.source,
      source_url: item.source_url,
      priority: item.priority,
      category: item.category,
      published_at: item.published_at,
      status: item.ai_approved ? 'published' : 'draft',
      ai_enhanced: true,
    }));
    
    const { error } = await supabaseAdmin
      .from('xyai_pending_news')
      .insert(rows);
    
    if (error) {
      console.error('Pending news insert error:', error);
      return { success: false, error: error.message };
    }
    
    // 自动发布的新闻直接写入日报表
    const approvedNews = reviewedNews.filter(n => n.ai_approved);
    if (approvedNews.length > 0) {
      await writeApprovedToDailyReports(approvedNews);
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
    
    // 1. 采集RSS源
    const sourcesToFetch = source 
      ? RSS_SOURCES.filter(s => s.name === source)
      : RSS_SOURCES;
    
    for (const sourceConfig of sourcesToFetch) {
      const items = await fetchRSS(sourceConfig.url);
      console.log(`[采集Agent] ${sourceConfig.name}: 获取 ${items.length} 条`);
      
      for (const item of items) {
        const score = scoreNews(item.title || '', item.contentSnippet || '');
        
        // 只保留AI相关且评分较高的，且去重
        if (score >= 15 && !existingTitles.has((item.title || '').toLowerCase().trim())) {
          results.push({
            id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: item.title || '',
            summary: '', // 稍后批量生成
            source: sourceConfig.name,
            source_url: item.link || '',
            priority: getPriority(score),
            category: categorize(item.title || '', item.contentSnippet || ''),
            published_at: item.pubDate || new Date().toISOString(),
            image_url: item['media:content']?.$ || item['media:thumbnail']?.$ || undefined
          });
        }
      }
    }
    
    // 2. 联网检索AI资讯
    console.log('[采集Agent] 开始联网检索...');
    const webNews = await searchWebNews();
    console.log(`[采集Agent] 联网检索: 获取 ${webNews.length} 条`);
    
    // 去重后添加
    for (const item of webNews) {
      if (!existingTitles.has(item.title.toLowerCase().trim())) {
        results.push(item);
      }
    }
    
    // 按优先级排序，不限制数量
    const sortedResults = results
      .sort((a, b) => {
        const priorityOrder = { SSS: 0, SS: 1, S: 2, A: 3, B: 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    
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
    let dbResult: { success: boolean; error?: string; count?: number } = { success: true, count: 0 };
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
    web_search: WEB_SEARCH_QUERIES.map(q => ({
      query: q.query,
      source: q.source,
    })),
    model: 'mimo-v2.5 (采集) / mimo-v2.5-pro (对话)',
    timestamp: new Date().toISOString(),
  });
}
