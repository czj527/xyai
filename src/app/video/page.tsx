'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { mockNews } from '@/lib/mockData';

interface VideoPageProps {
  searchParams: Promise<{
    date?: string;
    period?: string;
    autoplay?: string;
  }>;
}

export default function VideoPage({ searchParams }: VideoPageProps) {
  const [currentNews, setCurrentNews] = useState(mockNews.slice(0, 4));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedDate, setDisplayedDate] = useState('');
  const [periodLabel, setPeriodLabel] = useState('早报');
  const [issueNumber, setIssueNumber] = useState(1);
  const [autoplay, setAutoplay] = useState(false);
  
  useEffect(() => {
    // 解析URL参数
    const initParams = async () => {
      const p = await searchParams;
      if (p.date) setDisplayedDate(p.date);
      if (p.period) {
        if (p.period === 'morning') setPeriodLabel('早报');
        else if (p.period === 'afternoon') setPeriodLabel('午报');
        else if (p.period === 'evening') setPeriodLabel('晚报');
      }
      if (p.autoplay === 'true') {
        setAutoplay(true);
      }
    };
    
    initParams();
    
    // 如果没有指定日期，使用今天
    if (!displayedDate) {
      const today = new Date();
      setDisplayedDate(today.toISOString().split('T')[0]);
    }
    
    // 计算期号（简单示例）
    const startDate = new Date('2024-01-01');
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    setIssueNumber(daysDiff);
  }, [searchParams, displayedDate]);
  
  // 自动播放模式
  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(() => {
        nextNews();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, currentIndex]);
  
  const nextNews = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % currentNews.length);
      setIsAnimating(false);
    }, 500);
  };
  
  const prevNews = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + currentNews.length) % currentNews.length);
      setIsAnimating(false);
    }, 500);
  };
  
  // 格式化日期显示
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  // 优先级样式
  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      'SSS': { bg: 'bg-amber-500', text: 'text-amber-950' },
      'SS': { bg: 'bg-pink-500', text: 'text-pink-950' },
      'S': { bg: 'bg-emerald-500', text: 'text-emerald-950' },
      'A': { bg: 'bg-blue-500', text: 'text-blue-950' },
      'B': { bg: 'bg-gray-500', text: 'text-gray-950' },
    };
    return styles[priority] || styles['B'];
  };
  
  return (
    <div className="video-page">
      {/* 花瓣飘落动画 */}
      <div className="petals-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="petal"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 7}s`,
            }}
          />
        ))}
      </div>
      
      {/* 主内容 */}
      <div className="video-container">
        {/* 顶部标题区 */}
        <header className="video-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-lg">
              <Image
                src="/images/avatar-green.jpg"
                alt="绿"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">
                🌿 新叶{periodLabel}
              </h1>
              <p className="text-sm text-white/80">
                {formatDateDisplay(displayedDate)} · 第{issueNumber}期
              </p>
            </div>
          </div>
        </header>
        
        {/* 新闻列表区 */}
        <main className="video-main">
          {currentNews.map((news, index) => {
            const priorityStyle = getPriorityStyle(news.priority);
            const isActive = index === currentIndex;
            const isVisible = index <= currentIndex + 1 && index >= currentIndex - 1;
            
            return (
              <div
                key={news.id}
                className={`news-item ${isActive ? 'active' : ''} ${isVisible ? 'visible' : 'hidden-news'}`}
              >
                {/* 序号 */}
                <div className="news-number">
                  <span className={`${priorityStyle.bg} ${priorityStyle.text}`}>
                    {index === currentIndex ? '▶' : index + 1}
                  </span>
                </div>
                
                {/* 内容 */}
                <div className="news-content">
                  <div className="news-title-row">
                    <span className={`news-priority-badge ${priorityStyle.bg} ${priorityStyle.text}`}>
                      {news.priority}
                    </span>
                    <h2 className="news-title">{news.title}</h2>
                  </div>
                  <p className="news-summary">{news.summary}</p>
                  <div className="news-meta">
                    <span className="news-source">{news.source}</span>
                    <span className="news-category">{news.category}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </main>
        
        {/* 底部来源标注 */}
        <footer className="video-footer">
          <div className="footer-content">
            <span>🌸 数据来源: 量子位 · 机器之心 · HackerNews</span>
            <div className="footer-brand">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/50">
                <Image
                  src="/images/avatar-green.jpg"
                  alt="绿"
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              </div>
              <span>新叶早报</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
