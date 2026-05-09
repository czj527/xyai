'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const quickQuestions = [
  '今天有什么AI大事？',
  '最新大模型排行',
  '帮我总结本周资讯',
];

// 模拟回复
const mockResponses: Record<string, string> = {
  '今天有什么AI大事？': '今天AI圈有几个重磅消息！首先是OpenAI发布了GPT-5，性能大幅提升。另外Google也开源了Gemma 3系列模型，性价比很高哦！🌟',
  '最新大模型排行': '根据最新数据，目前综合能力最强的是GPT-5和Claude 4。在开源模型中，Llama 4和Qwen2.5表现也很出色。需要看具体维度的排名吗？',
  '帮我总结本周资讯': '本周AI圈最热门的是GPT-5和Claude 4同日发布，标志着AI竞争进入新阶段。此外还有多个开源模型发布，包括Gemma 3和Llama 4多模态版。整体来看，多模态能力和长上下文是近期重点方向。',
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function GreenChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是绿，新叶AI的资讯助手 🌿 有什么想了解的AI资讯吗？',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 发送消息
  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    setTimeout(() => {
      const response = mockResponses[content] || 
        '这个问题我还需要学习一下才能回答哦！建议你直接浏览今天的资讯卡片获取最新信息 🌱';
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };
  
  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };
  
  return (
    <>
      {/* 触发按钮 - 圆形头像版 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-trigger"
        aria-label={isOpen ? '关闭聊天' : '打开与绿的对话'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <div className="chatbot-avatar-wrapper">
              <Image
                src="/images/avatar-green.jpg"
                alt="绿"
                width={40}
                height={40}
                className="chatbot-avatar-btn"
              />
              <div className="chatbot-avatar-glow" />
            </div>
            {messages.length <= 1 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            )}
          </>
        )}
      </button>
     
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="flex items-center gap-3">
              <div className="chatbot-header-avatar">
                <Image
                  src="/images/avatar-green.jpg"
                  alt="绿"
                  width={32}
                  height={32}
                  className="chatbot-header-avatar-img"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm">绿·AI资讯助手</h3>
                <p className="text-xs opacity-80">新叶AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.role === 'assistant' ? 'bot' : 'user'}`}
              >
                {msg.content}
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message bot">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="quick-questions">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickQuestion(q)}
                className="quick-question-btn"
                disabled={isTyping}
              >
                {q}
              </button>
            ))}
          </div>
          
          <div className="chatbot-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="问我任何AI相关问题..."
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isTyping}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default GreenChatbot;
