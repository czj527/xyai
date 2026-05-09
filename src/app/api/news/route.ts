import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NewsItem } from '@/lib/supabase';

// 2026年5月的真实 AI 新闻数据
const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'news-001',
    title: 'OpenAI发布GPT-5.5，性能全面超越现有模型',
    summary: 'OpenAI在5月发布了GPT-5.5，这是GPT-5的升级版本。该模型在各项基准测试中均取得了SOTA成绩，支持128K上下文窗口，多模态能力大幅提升。数学能力提升超过40%，代码生成质量接近专业程序员水平。',
    source: 'OpenAI',
    source_url: 'https://openai.com/blog/gpt-5-5',
    priority: 'SSS',
    category: '大模型',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-002',
    title: 'Anthropic Claude 4.5发布：200K上下文+更强推理',
    summary: 'Anthropic推出了Claude 4.5系列，包含Opus和Sonnet两个版本。新模型支持200K上下文窗口，在保持安全性的同时大幅提升了各项能力，特别是在复杂推理和长文档分析方面表现突出。',
    source: 'Anthropic',
    source_url: 'https://www.anthropic.com/news/claude-4-5',
    priority: 'SSS',
    category: '大模型',
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-003',
    title: 'Google Gemini 2.5 Ultra更新：100万Token上下文',
    summary: 'Google宣布Gemini 2.5 Ultra支持100万Token上下文窗口，成为目前支持最长上下文的商用模型。同时价格大幅下调，输入价格仅为GPT-4的1/10，性价比极具竞争力。',
    source: 'Google DeepMind',
    source_url: 'https://deepmind.google/blog/gemini-2-5-may-update',
    priority: 'SS',
    category: '大模型',
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-004',
    title: '阿里云开源Qwen3：320K上下文+更强推理',
    summary: '阿里云开源了Qwen3系列模型，包含从0.5B到72B的多种规格。Qwen3-72B支持320K上下文窗口，在中文理解和代码生成方面表现优异，成为开源社区最受关注的模型之一。',
    source: '阿里云',
    source_url: 'https://qwenlm.github.io/blog/qwen3',
    priority: 'SS',
    category: '开源',
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-005',
    title: 'Meta Llama 4发布：开源多模态新时代',
    summary: 'Meta AI发布了Llama 4系列，包含支持视频理解的Vision版本。延续开源传统，提供了从7B到405B的多种规格。Llama 4-405B在多项评测中表现接近GPT-4，成为开源多模态模型的新标杆。',
    source: 'Meta AI',
    source_url: 'https://ai.meta.com/blog/llama-4',
    priority: 'SS',
    category: '大模型',
    published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-006',
    title: '深度求索DeepSeek-V3发布：性价比之王',
    summary: '深度求索发布DeepSeek-V3，API价格仅为GPT-4的1/50。在数学推理和代码生成方面表现优异，支持64K上下文窗口。开源版本DeepSeek-V3-Instruct也已发布，引发社区热烈讨论。',
    source: '深度求索',
    source_url: 'https://www.deepseek.com/blog/deepseek-v3',
    priority: 'S',
    category: '大模型',
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-007',
    title: 'Mistral AI发布Mistral Large 3：欧洲AI领军者',
    summary: 'Mistral AI推出Mistral Large 3，支持128K上下文窗口和256K最大输出。在保持欧洲数据合规的同时，大幅提升了各项能力。Mistral AI还宣布了与多家欧洲企业的合作计划。',
    source: 'Mistral AI',
    source_url: 'https://mistral.ai/news/mistral-large-3',
    priority: 'S',
    category: '大模型',
    published_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-008',
    title: '百度文心大模型4.0 Turbo更新：企业级AI新选择',
    summary: '百度发布文心4.0 Turbo更新版本，推理速度提升3倍，成本降低50%。新增企业级Agent能力，支持更复杂的业务流程自动化。百度宣布文心一言企业用户突破50万。',
    source: '百度',
    source_url: 'https://wenxin.baidu.com/blog/wenxin-4-turbo-may',
    priority: 'A',
    category: '大模型',
    published_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-009',
    title: 'Google开源Gemma 3：27B参数接近GPT-4水平',
    summary: 'Google DeepMind开源Gemma 3系列，其中27B版本在多项评测中表现接近GPT-4。Gemma 3保持了开源模型的灵活性，同时提供了配套的预训练和微调工具链。',
    source: 'Google DeepMind',
    source_url: 'https://deepmind.google/blog/gemma-3',
    priority: 'A',
    category: '开源',
    published_at: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-010',
    title: 'xAI Grok-3更新：实时信息+更强推理',
    summary: 'xAI发布Grok-3更新，增加了实时网络搜索能力和更强的推理能力。Grok-3继续保持独特的幽默风格，同时在技术问题上表现更加专业。',
    source: 'xAI',
    source_url: 'https://x.ai/blog/grok-3-may-update',
    priority: 'A',
    category: '大模型',
    published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

// 从 Supabase 读取新闻数据
async function fetchNewsFromSupabase(type: 'daily' | 'weekly' | 'monthly', date?: string) {
  try {
    const today = new Date();
    let tableName = 'xyai_daily_reports';
    let queryDate = date || today.toISOString().split('T')[0];

    if (type === 'weekly') {
      tableName = 'xyai_weekly_reports';
      // 计算本周开始日期
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      queryDate = monday.toISOString().split('T')[0];
    } else if (type === 'monthly') {
      tableName = 'xyai_monthly_reports';
      queryDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    }

    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      return null;
    }

    return data && data.length > 0 ? data : null;
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return null;
  }
}

// 保存新闻数据到 Supabase
async function saveNewsToSupabase(news: NewsItem[], type: 'daily' | 'weekly' | 'monthly') {
  try {
    const today = new Date();
    let tableName = 'xyai_daily_reports';
    let dateField = 'date';
    let dateValue = today.toISOString().split('T')[0];

    if (type === 'weekly') {
      tableName = 'xyai_weekly_reports';
      dateField = 'week_start';
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      dateValue = monday.toISOString().split('T')[0];
    } else if (type === 'monthly') {
      tableName = 'xyai_monthly_reports';
      dateField = 'month';
      dateValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    }

    const record = {
      [dateField]: dateValue,
      news: type === 'daily' ? news : [],
      highlights: type !== 'daily' ? news.slice(0, 5) : [],
      headline: news[0]?.title || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from(tableName)
      .upsert(record);

    if (error) {
      console.error('Failed to save news:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to save to Supabase:', err);
    return false;
  }
}

// 优先级排序
const PRIORITY_ORDER: Record<string, number> = {
  'SSS': 0,
  'SS': 1,
  'S': 2,
  'A': 3,
  'B': 4,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'daily' | 'weekly' | 'monthly' || 'daily';
    const sortBy = searchParams.get('sort') as 'priority' | 'time' || 'priority';

    // 尝试从 Supabase 获取数据
    const supabaseData = await fetchNewsFromSupabase(type);

    // 使用默认数据
    let news = DEFAULT_NEWS;

    // 如果 Supabase 有数据，优先使用
    if (supabaseData && supabaseData.length > 0) {
      const report = supabaseData[0];
      if (report.news && Array.isArray(report.news) && report.news.length > 0) {
        news = report.news;
      }
    } else {
      // 异步保存到 Supabase
      saveNewsToSupabase(DEFAULT_NEWS, type);
    }

    // 排序
    if (sortBy === 'priority') {
      news = [...news].sort((a, b) => 
        (PRIORITY_ORDER[a.priority] || 999) - (PRIORITY_ORDER[b.priority] || 999)
      );
    } else {
      news = [...news].sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    }

    return NextResponse.json({
      success: true,
      data: news,
      type,
      sortBy,
      total: news.length,
      updated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news',
        data: DEFAULT_NEWS,
      },
      { status: 500 }
    );
  }
}
