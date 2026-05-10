// 资讯采集API路由
// 复用旧方案采集逻辑，接入MiMo API进行摘要生成

import { NextResponse } from 'next/server';

// 信息源配置（RSS）
const RSS_SOURCES = [
  { name: '量子位', url: 'https://www.qbitai.com/feed', priority: 5 },
  { name: '机器之心', url: 'https://www.jiqizhixin.com/rss', priority: 5 },
  { name: '36氪', url: 'https://36kr.com/feed', priority: 4 },
  { name: 'HackerNews', url: 'https://hnrss.org/frontpage', priority: 3 },
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', priority: 5 },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', priority: 3 },
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
}

// MiMo API 调用
async function callMiMoAPI(prompt: string): Promise<string> {
  const apiKey = process.env.MIMO_API_KEY;
  const baseUrl = process.env.MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1';
  
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
      model: 'MiMo-8B-FunctionCall-4bit',
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`MiMo API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// RSS抓取（使用内置fetch）
async function fetchRSS(url: string): Promise<any[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; XyAI-Bot/1.0)',
      },
      next: { revalidate: 300 }, // 5分钟缓存
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch RSS: ${url}`, response.status);
      return [];
    }
    
    const text = await response.text();
    // 简单的XML解析（生产环境应使用专门的RSS解析库）
    const items = parseSimpleRSS(text);
    return items;
  } catch (error) {
    console.error(`Error fetching RSS: ${url}`, error);
    return [];
  }
}

// 简化的RSS解析
function parseSimpleRSS(xml: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractXmlTag(itemXml, 'title');
    const link = extractXmlTag(itemXml, 'link');
    const description = extractXmlTag(itemXml, 'description');
    const pubDate = extractXmlTag(itemXml, 'pubDate');
    
    if (title && link) {
      items.push({
        title: cleanHtml(title),
        link,
        description: cleanHtml(description || ''),
        pubDate,
      });
    }
  }
  
  return items;
}

// 提取XML标签内容
function extractXmlTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([^\\]]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
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
  const highWeightKeywords = ['gpt-5', 'claude 4', 'gemini 3', '发布', '发布', '开源', 'release', 'announced'];
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
  
  if (text.includes('代码') || text.includes('code') || text.includes('programming')) {
    return '代码';
  }
  if (text.includes('开源') || text.includes('open source')) {
    return '开源';
  }
  if (text.includes('安全') || text.includes('安全') || text.includes('privacy')) {
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

// 生成摘要（使用MiMo）
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

// POST: 手动触发采集
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { source } = body;
    
    console.log('[采集Agent] 开始采集资讯', { source });
    
    const results: NewsItem[] = [];
    const sourcesToFetch = source 
      ? RSS_SOURCES.filter(s => s.name === source)
      : RSS_SOURCES;
    
    // 采集所有RSS源
    for (const sourceConfig of sourcesToFetch) {
      const items = await fetchRSS(sourceConfig.url);
      
      for (const item of items) {
        const score = scoreNews(item.title, item.description);
        
        // 只保留AI相关且评分较高的
        if (score >= 15) {
          const summary = await generateSummary(item.title, item.description);
          
          results.push({
            id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: item.title,
            summary,
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
    
    console.log(`[采集Agent] 采集完成，共${sortedResults.length}条资讯`);
    
    return NextResponse.json({
      success: true,
      count: sortedResults.length,
      news: sortedResults,
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
    timestamp: new Date().toISOString(),
  });
}
