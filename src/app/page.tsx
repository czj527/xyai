'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Newspaper, 
  Sparkles, 
  Zap, 
  ChevronRight,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import { mockNews } from '@/lib/mockData';
import type { NewsItem } from '@/lib/supabase';

// 优先级配置
const priorityConfig = {
  SSS: { 
    label: 'SSS', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-950'
  },
  SS: { 
    label: 'SS', 
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500',
    textColor: 'text-pink-950'
  },
  S: { 
    label: 'S', 
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-950'
  },
  A: { 
    label: 'A', 
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-950'
  },
  B: { 
    label: 'B', 
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-500',
    textColor: 'text-gray-950'
  },
};

// 格式化日期
function formatDateDisplay(dateStr: string): { date: string; weekday: string } {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return {
    date: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
    weekday: weekdays[date.getDay()]
  };
}

// 格式化时间差
function formatTimeDiff(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// 热点卡片组件
function HotspotCard({ news, index }: { news: NewsItem; index: number }) {
  const priority = priorityConfig[news.priority] || priorityConfig.B;
  const num = String(index + 1).padStart(2, '0');
  
  return (
    <Link href={`/news/${news.id}`} className="block group">
      <article className="h-full glass-card-hover p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-primary/30 bg-white/80 dark:bg-slate-900/80">
        {/* 顶部：编号 + 优先级 */}
        <div className="flex items-start justify-between mb-3">
          <span className={`text-3xl font-bold ${priority.textColor} opacity-80`}>
            {num}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r ${priority.color} ${priority.textColor}`}>
            {priority.label}
          </span>
        </div>
        
        {/* 分隔线 */}
        <div className="border-t border-border/50 my-2" />
        
        {/* 标题 */}
        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
          {news.title}
        </h3>
        
        {/* 摘要 */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {news.summary}
        </p>
        
        {/* 底部来源信息 */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            {news.source}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatTimeDiff(news.published_at)}
          </span>
        </div>
      </article>
    </Link>
  );
}

// 更多资讯项组件
function MoreNewsItem({ news, index }: { news: NewsItem; index: number }) {
  const num = index + 9;
  
  return (
    <Link href={`/news/${news.id}`} className="block group">
      <article className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0 hover:bg-accent/30 -mx-4 px-4 rounded-lg transition-colors">
        <span className="text-lg font-bold text-muted-foreground/50 w-6 shrink-0">
          {num}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {news.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{news.source}</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {formatTimeDiff(news.published_at)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </article>
    </Link>
  );
}

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState({ date: '', weekday: '' });
  
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNews(mockNews);
      const today = formatDateDisplay(new Date().toISOString());
      setCurrentDate(today);
      setLoading(false);
    }, 300);
  }, []);
  
  const hotspotNews = news.slice(0, 8);
  const moreNews = news.slice(8);

  return (
    <div className="relative">
      <div className="light-bg-gradient light-bg-decorations absolute inset-0 -z-10" />
      <div className="dark hidden dark:block absolute inset-0 -z-10">
        <div className="dark-bg-glow" />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-12 md:py-16">
          <div className="text-center md:text-left flex-1">
            <h1 className="hero-title-gradient">
              <span className="hero-title-main">新叶</span>
              <span className="hero-title-accent">AI</span>
            </h1>
            <p className="hero-subtitle-modern">
              每日AI资讯，助你紧跟前沿
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
              <span className="hero-badge">
                <Zap className="w-4 h-4" />
                每日8:00更新
              </span>
              <span className="hero-badge">
                春季主题
              </span>
            </div>
          </div>
          
          <div className="flex-shrink-0 hero-avatar-section">
            <div className="hero-avatar-container">
              <div className="hero-avatar-ring" />
              <Image
                src="/images/avatar-green.jpg"
                alt="绿·AI资讯助手"
                width={150}
                height={150}
                className="hero-avatar"
                priority
              />
            </div>
            <div className="hero-avatar-label">
              <span className="hero-avatar-status" />
              <span className="text-sm font-medium">绿 · AI资讯助手</span>
            </div>
          </div>
        </section>
        
        {/* 日期头部 */}
        <header className="mb-8">
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                <Newspaper className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {currentDate.date} {currentDate.weekday}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AI日报 · 今日热点
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground ml-15">
              3分钟速览今日AI动态
            </p>
          </div>
        </header>
        
        {/* 热点区：4列2行网格 */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h3 className="text-lg font-bold text-foreground">今日热点</h3>
            {loading && (
              <span className="text-xs text-muted-foreground animate-pulse">加载中...</span>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card p-4 rounded-xl animate-pulse">
                  <div className="h-8 w-8 bg-muted rounded mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full mb-1" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hotspotNews.map((item, index) => (
                <HotspotCard key={item.id} news={item} index={index} />
              ))}
            </div>
          )}
        </section>
        
        {/* 更多资讯：列表式展示 */}
        {moreNews.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📰</span>
              <h3 className="text-lg font-bold text-foreground">更多资讯</h3>
            </div>
            
            <div className="glass-card p-4 rounded-xl bg-white/80 dark:bg-slate-900/80">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0">
                      <div className="h-4 w-6 bg-muted rounded animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                moreNews.map((item, index) => (
                  <MoreNewsItem key={item.id} news={item} index={index} />
                ))
              )}
            </div>
          </section>
        )}
        
        {/* 底部版权信息 */}
        <footer className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>© 2026 新叶AI</span>
            <span className="text-border">·</span>
            <span>数据来源：量子位/机器之心/HackerNews/36氪</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
