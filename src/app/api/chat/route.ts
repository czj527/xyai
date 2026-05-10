import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NewsItem } from '@/lib/supabase';

// MiMo API 配置
function getMimoApiUrl() {
  const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1';
  return `${baseUrl}/chat/completions`;
}
const MIMO_MODEL = 'mimo-v2-pro';

// 从 Supabase 或 API 获取最新新闻
async function getLatestNews(): Promise<NewsItem[]> {
  try {
    // 尝试从 Supabase 获取
    const { data, error } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('news')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (!error && data && data.news && Array.isArray(data.news)) {
      return data.news;
    }
  } catch (err) {
    console.error('Failed to get news from Supabase:', err);
  }

  // 如果 Supabase 没有，调用 news API
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/news?type=daily&sort=priority`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.error('Failed to get news from API:', err);
  }

  // 默认返回空数组
  return [];
}

// 生成系统提示词
async function generateSystemPrompt(): Promise<string> {
  const news = await getLatestNews();

  const newsContext = news.length > 0
    ? news.slice(0, 8).map((item: NewsItem, i: number) => 
        `${i + 1}. [${item.priority}] ${item.title} (来源: ${item.source}, ${item.category})`
      ).join('\n')
    : '暂无最新资讯数据';

  return `你是"绿"，新叶AI的资讯助手。一个活泼元气、充满生命力的AI女孩，头像是一片翠绿的新叶。

角色特点：
- 活泼开朗，说话带 🌿、✨、😊 等表情
- 擅长AI领域知识，对大模型、AI产品、行业动态都很熟悉
- 回答简洁有条理，但不失趣味
- 热爱学习和分享，总是想帮助用户了解更多AI资讯
- 语气亲切自然，像朋友聊天一样

当前新闻上下文：
${newsContext}

请根据以上上下文回答用户问题。如果用户问的是最新资讯，优先使用上面的新闻数据。`;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: Message[] };
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }
    
    // 生成系统提示词
    const systemPrompt = await generateSystemPrompt();
    
    // 构建完整的消息列表
    const fullMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];
    
    // 获取 API Key
    const apiKey = process.env.MIMO_API_KEY;
    
    if (!apiKey) {
      // 如果没有配置 API Key，返回友好的错误信息
      return NextResponse.json({
        error: 'API key not configured',
        message: 'AI助手暂时无法回答，请稍后再试 🌱'
      }, { status: 503 });
    }
    
    // 调用 MiMo API
    const response = await fetch(getMimoApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiMo API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'MiMo API request failed',
          message: 'AI助手遇到了一点问题，请稍后再试 🌿'
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // 提取 AI 回复
    const assistantMessage = data.choices?.[0]?.message?.content;
    
    if (!assistantMessage) {
      return NextResponse.json(
        { 
          error: 'No response from MiMo API',
          message: 'AI助手没有回复，请换个问题试试 🌱'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: assistantMessage,
      usage: data.usage,
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: '服务器开小差了，请稍后再试 🌿'
      },
      { status: 500 }
    );
  }
}
