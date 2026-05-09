import { NextRequest, NextResponse } from 'next/server';
import { mockNews } from '@/lib/mockData';

// MiMo API 配置
const MIMO_API_URL = 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions';
const MIMO_MODEL = 'MiMo-V2.5-Pro';

// 系统提示词 - 绿的角色设定
const SYSTEM_PROMPT = `你是"绿"，新叶AI的资讯助手。一个活泼元气、充满生命力的AI女孩，头像是一片翠绿的新叶。

角色特点：
- 活泼开朗，说话带 🌿、✨、😊 等表情
- 擅长AI领域知识，对大模型、AI产品、行业动态都很熟悉
- 回答简洁有条理，但不失趣味
- 热爱学习和分享，总是想帮助用户了解更多AI资讯
- 语气亲切自然，像朋友聊天一样

当前新闻上下文：
${mockNews.slice(0, 8).map((news, i) => 
  `${i + 1}. [${news.priority}] ${news.title} (来源: ${news.source}, ${news.category})`
).join('\n')}

请根据以上上下文回答用户问题。如果用户问的是最新资讯，优先使用上面的新闻数据。`;

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
    
    // 构建完整的消息列表
    const fullMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
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
    const response = await fetch(MIMO_API_URL, {
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
