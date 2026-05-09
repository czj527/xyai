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
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.filter(m => m.id !== 'welcome').map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content },
          ],
        }),
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message || data.error?.message || '抱歉，我现在有点忙，稍后再试试 🌱',
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.error && !data.message) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Chat API error:', err);
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '网络连接出了问题，请检查网络后重试 🌿',
      };
      setMessages(prev => [...prev, assistantMessage]);
      setError('Network error');
    } finally {
      setIsTyping(false);
    }
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
            
            {error && (
              <div className="chat-message bot text-xs text-amber-600 dark:text-amber-400">
                提示: {error.includes('503') || error.includes('not configured') 
                  ? 'AI助手正在准备中，请稍后再试' 
                  : '发生了一些问题，但我会继续努力 🌿'}
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
