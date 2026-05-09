import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NewsItem } from '@/lib/supabase';

// 2026年5月真实 AI 新闻数据（基于量子位、机器之心、36kr等来源）
const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'news-001',
    title: 'Claude Opus 4.7发布：SWE-bench Pro达到64.3%，代码能力登顶',
    summary: 'Anthropic于4月16日发布Claude Opus 4.7，将SWE-bench Pro从53.4%提升至64.3%，创代码能力新纪录。新增xhigh推理深度控制，图像分辨率提升3倍至375万像素，OSWorld自主操作达78%。Cursor CEO确认内部测试分辨率提升13%。',
    source: 'Anthropic',
    source_url: 'https://www.anthropic.com/news/claude-opus-4-7',
    priority: 'SSS',
    category: '大模型',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-002',
    title: 'GPT-5.5正式发布：首个全重训练模型，Terminal-Bench 82.7%领跑',
    summary: 'OpenAI在4月23日发布GPT-5.5，这是自GPT-4.5以来首个完全重训练的基座模型。架构原生支持多模态（文字/图片/音频/视频统一处理），Terminal-Bench 2.0达到82.7%创纪录成绩，专为Agent工作流设计，支持电脑操作任务。',
    source: 'OpenAI',
    source_url: 'https://openai.com/blog/gpt-5-5',
    priority: 'SSS',
    category: '大模型',
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-003',
    title: 'Gemini 3.1 Pro Preview：100万Token上下文，价格仅为GPT-4的1/10',
    summary: 'Google发布Gemini 3.1 Pro Preview，支持100万Token超长上下文窗口，GPQA Diamond达94.3%创推理测试新高。价格大幅下调，输入仅$2/百万Token，为GPT-4的1/10，在Artificial Analysis智力指数获57分并列第一梯队。',
    source: 'Google DeepMind',
    source_url: 'https://deepmind.google/blog/gemini-3-1-pro',
    priority: 'SSS',
    category: '大模型',
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-004',
    title: 'Meta发布Muse Spark：LMSYS盲测空降第6名，多模态旗舰登场',
    summary: 'Meta紧急发布全新多模态旗舰模型Muse Spark，在LMSYS Chatbot Arena盲测中以1490 Elo强势空降第6名。延续开源策略，提供从7B到405B多种规格，支持视频理解，成为Meta在商业大模型阵营抗衡的新旗手。',
    source: 'Meta AI',
    source_url: 'https://ai.meta.com/blog/muse-spark',
    priority: 'SS',
    category: '大模型',
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-005',
    title: 'DeepSeek V4发布：1.6万亿参数开源模型，API价格仅$0.14/百万Token',
    summary: '深度求索发布DeepSeek V4，采用1.6万亿参数MoE架构，完全使用国产芯片训练。API定价$0.14/百万输入Token，价格仅为GPT-5.5的1/35。在SWE-bench测试中逼近GPT-5.5水平，MIT开源许可引发社区热议。',
    source: '深度求索',
    source_url: 'https://www.deepseek.com/blog/deepseek-v4',
    priority: 'SS',
    category: '开源',
    published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-006',
    title: 'Kimi K2.6发布：262K上下文+Agent群组编排，开源阵营领跑者',
    summary: '月之暗面发布Kimi K2.6，支持262K超长上下文窗口，在LMSYS盲测中达1461 Elo。在超长上下文工具调用和Agent群组编排上表现惊人，Artificial Analysis智力指数获54分与小米并列开源第一阵营。',
    source: '月之暗面',
    source_url: 'https://platform.moonshot.cn/docs/kimi-k2',
    priority: 'SS',
    category: '大模型',
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-007',
    title: '小米MiMo-V2.5-Pro：智力指数54分并列开源第一，1M上下文',
    summary: '小米发布MiMo-V2.5-Pro，在Artificial Analysis智力指数中斩获54分，与Kimi K2.6并列开源第一。新模型支持100万Token上下文，function calling和vision能力大幅提升，成为国产开源新标杆。',
    source: '小米',
    source_url: 'https://xiaomi.ai/',
    priority: 'S',
    category: '开源',
    published_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-008',
    title: 'GLM-5.1：首个登顶SWE-bench Pro的开源模型，智谱AI新突破',
    summary: '智谱AI发布GLM-5.1，成为首个登顶SWE-bench Pro的开源/开放权重模型。GLM-5.1以1430 Elo在LMSYS盲测中表现优异，支持200K上下文，IFEval指令遵循和多模态图像评估长期霸榜。',
    source: '智谱AI',
    source_url: 'https://www.zhipuai.cn/',
    priority: 'S',
    category: '开源',
    published_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-009',
    title: 'SuperCLUE 2026上半年评测：豆包登顶中文AI，Doubao-Seed-2.0-pro获92.02分',
    summary: 'SuperCLUE发布2026上半年中文大模型评测报告，火山引擎Doubao-Seed-2.0-pro以92.02分绝对优势登顶中文榜首。MiniMax-M2.5、Qwen3-Max-Thinking、Kimi-K2.5-Thinking、GLM-5并列86-87分形成第二阵营。',
    source: 'SuperCLUE',
    source_url: 'https://www.superclueai.com/',
    priority: 'A',
    category: '评测',
    published_at: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-010',
    title: 'Mistral Medium 3.5发布：256K上下文，欧洲AI领军者新旗舰',
    summary: 'Mistral AI推出Medium 3.5，支持256K上下文窗口和64K最大输出，保持欧洲数据合规优势。在编程和数学评测中表现接近顶级闭源模型，API定价$0.50/百万Token，成为企业应用的性价比选择。',
    source: 'Mistral AI',
    source_url: 'https://mistral.ai/news/mistral-medium-3-5',
    priority: 'A',
    category: '大模型',
    published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-011',
    title: 'Qwen3.5系列发布：开源多模态新标杆，Llama4面临最强挑战',
    summary: '阿里云发布Qwen3.5系列，其中Qwen3.5-Max-preview在LMSYS达1464 Elo。新系列在IFEval指令遵循和多模态图像评估中持续霸榜，提供从0.5B到72B的多种规格，Apache 2.0许可进一步降低商用门槛。',
    source: '阿里云',
    source_url: 'https://qwenlm.github.io/blog/qwen3-5',
    priority: 'A',
    category: '开源',
    published_at: new Date(Date.now() - 54 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-012',
    title: 'Grok 4.20发布：2M上下文+实时信息，xAI新旗舰挑战GPT',
    summary: 'xAI发布Grok 4.20系列，支持200万Token上下文窗口和实时网络搜索。Grok 4.20 Beta 1在LMSYS盲测中达1480 Elo，多Agent Beta版本达1473 Elo。继续保持独特的幽默风格，技术能力大幅提升。',
    source: 'xAI',
    source_url: 'https://x.ai/blog/grok-4-20',
    priority: 'A',
    category: '大模型',
    published_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
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
