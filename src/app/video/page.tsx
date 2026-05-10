'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import '../video/video.css';

// 新闻项类型（适配API返回的数据结构）
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url?: string;
  url?: string;
  priority: 'SSS' | 'SS' | 'S' | 'A' | 'B';
  category: string;
  published_at: string;
}

// 脚本格式（script模式显示）
interface ScriptItem {
  title: string;
  script: string;
  duration: number;
}

interface VideoPageProps {
  searchParams: Promise<{
    date?: string;
    period?: string;
    autoplay?: string;
    script?: string;
  }>;
}

export default function VideoPage({ searchParams }: VideoPageProps) {
  const [currentNews, setCurrentNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedDate, setDisplayedDate] = useState('');
  const [periodLabel, setPeriodLabel] = useState('早报');
  const [issueNumber, setIssueNumber] = useState(1);
  const [autoplay, setAutoplay] = useState(false);
  const [isScriptMode, setIsScriptMode] = useState(false);
  const [scriptData, setScriptData] = useState<{ opening: string; closing: string; items: ScriptItem[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从API获取新闻数据
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/news?sort=priority&limit=8');
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setCurrentNews(result.data);
      } else {
        setCurrentNews([]);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('获取数据失败');
      setCurrentNews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 加载脚本模式数据（如果指定了日期）
  const fetchScriptData = useCallback(async (date: string) => {
    try {
      const scriptUrl = `/AI早报/output/scripts/script_${date}.json`;
      const response = await fetch(scriptUrl);
      if (response.ok) {
        const data = await response.json();
        setScriptData(data);
        if (data.items && data.items.length > 0) {
          const newsFromScript: NewsItem[] = data.items.map((item: ScriptItem, idx: number) => ({
            id: `script-${idx}`,
            title: item.title,
            summary: item.script,
            source: '新叶早报',
            priority: 'A',
            category: 'AI资讯',
            published_at: new Date().toISOString(),
          }));
          setCurrentNews(newsFromScript);
        }
      }
    } catch (err) {
      console.error('Failed to fetch script:', err);
    }
  }, []);

  useEffect(() => {
    const initParams = async () => {
      const p = await searchParams;
      
      if (p.date) {
        setDisplayedDate(p.date);
        if (p.script === 'true') {
          setIsScriptMode(true);
          await fetchScriptData(p.date);
        }
      } else {
        const today = new Date();
        setDisplayedDate(today.toISOString().split('T')[0]);
      }
      
      if (p.period) {
        if (p.period === 'morning') setPeriodLabel('早报');
        else if (p.period === 'afternoon') setPeriodLabel('午报');
        else if (p.period === 'evening') setPeriodLabel('晚报');
      }
      
      if (p.autoplay === 'true') {
        setAutoplay(true);
      }
      
      if (p.script !== 'true') {
        await fetchNews();
      }
    };
    
    initParams();
    
    const startDate = new Date('2024-01-01');
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    setIssueNumber(daysDiff);
  }, [searchParams, fetchNews, fetchScriptData]);
  
  // 自动播放模式
  useEffect(() => {
    if (autoplay && currentNews.length > 0) {
      const interval = setInterval(() => {
        nextNews();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, currentIndex, currentNews.length]);
  
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
      {/* 花瓣飘落动画 - 浅粉色 */}
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
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-300 shadow-lg">
              <Image
                src="/images/avatar-green.jpg"
                alt="绿"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-800 drop-shadow-sm">
                🌿 新叶{periodLabel}
              </h1>
              <p className="text-base text-emerald-700">
                {formatDateDisplay(displayedDate)} · 第{issueNumber}期
              </p>
            </div>
          </div>
        </header>
        
        {/* 新闻列表区 */}
        <main className="video-main">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-emerald-800">
              <div className="text-center">
                <div className="animate-pulse mb-2 text-lg">加载中...</div>
                <div className="text-sm text-emerald-600">正在从Supabase获取数据</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600 text-lg">{error}</div>
            </div>
          ) : currentNews.length === 0 ? (
            <div className="flex items-center justify-center h-full text-emerald-800">
              <div className="text-center">
                <p className="text-lg">暂无数据</p>
                <p className="text-sm text-emerald-600 mt-2">请检查Supabase数据库</p>
              </div>
            </div>
          ) : (
            <>
              {/* 脚本模式：显示开场白 */}
              {isScriptMode && scriptData?.opening && currentIndex === 0 && (
                <div className="script-intro mb-4 p-4 rounded-lg">
                  <p className="text-emerald-900 text-lg font-medium leading-relaxed">{scriptData.opening}</p>
                </div>
              )}
            
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
                      <div className="news-title-row flex items-center gap-2 flex-wrap">
                        <span className={`news-priority-badge ${priorityStyle.bg} ${priorityStyle.text} px-2 py-0.5 rounded text-xs font-bold`}>
                          {news.priority}
                        </span>
                        <h2 className="news-title text-lg font-semibold text-gray-800">{news.title}</h2>
                      </div>
                      <p className="news-summary mt-2 text-gray-600 leading-relaxed">{news.summary}</p>
                      <div className="news-meta mt-3 flex items-center gap-3 text-sm">
                        <span className="news-source text-emerald-600 font-medium">📰 {news.source}</span>
                        <span className="news-category px-2 py-0.5 rounded-full text-emerald-700 text-xs">{news.category}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            
              {/* 脚本模式：显示结束语 */}
              {isScriptMode && scriptData?.closing && currentIndex === currentNews.length - 1 && (
                <div className="script-outro mt-4 p-4 rounded-lg">
                  <p className="text-emerald-900 text-lg font-medium leading-relaxed">{scriptData.closing}</p>
                </div>
              )}
            </>
          )}
        </main>
        
        {/* 底部来源标注 */}
        <footer className="video-footer">
          <div className="footer-content flex items-center justify-between">
            <span className="text-sm">🌸 数据来源: 量子位 · 机器之心 · HackerNews</span>
            <div className="footer-brand flex items-center gap-2">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-emerald-300">
                <Image
                  src="/images/avatar-green.jpg"
                  alt="绿"
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium">新叶早报</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
