'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Newspaper, 
  Sparkles, 
  Zap, 
  ChevronRight,
  Calendar,
  Clock,
  ExternalLink,
  TrendingUp,
  Flame,
  ArrowRight,
  Filter
} from 'lucide-react';
import type { NewsItem } from '@/lib/supabase';

// 分类配置
const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; bgColor: string }> = {
  '模型发布': { emoji: '🤖', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
  '政策法规': { emoji: '📋', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
  '定价计划': { emoji: '💰', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
  '工具产品': { emoji: '🔧', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
  '基准测评': { emoji: '📊', color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800' },
  '研究论文': { emoji: '🔬', color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' },
  '融资动态': { emoji: '💼', color: 'text-rose-600', bgColor: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800' },
  '安全伦理': { emoji: '🔒', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' },
  '行业资讯': { emoji: '🌐', color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800' },
};

// 获取分类样式
function getCategoryStyle(category: string) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG['行业资讯'];
}

// 优先级配置
const priorityConfig = {
  SSS: { 
    label: 'SSS', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
    textColor: 'text-white',
    icon: Flame
  },
  SS: { 
    label: 'SS', 
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-white',
    icon: TrendingUp
  },
  S: { 
    label: 'S', 
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-gradient-to-r from-emerald-400 to-green-500',
    textColor: 'text-white',
    icon: Sparkles
  },
  A: { 
    label: 'A', 
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-r from-blue-400 to-cyan-500',
    textColor: 'text-white',
    icon: null
  },
  B: { 
    label: 'B', 
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    icon: null
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

// 头条卡片组件
function FeaturedCard({ news, index }: { news: NewsItem; index: number }) {
  const priority = priorityConfig[news.priority] || priorityConfig.B;
  const PriorityIcon = priority.icon;
  const categoryStyle = getCategoryStyle(news.category);
  
  return (
    <Link href={`/news/${news.id}`} className="block group">
      <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
        
        {/* 优先级和分类标签 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${priority.bgColor} ${priority.textColor} shadow-lg`}>
              {PriorityIcon && <PriorityIcon className="w-3 h-3 inline mr-1" />}
              {priority.label}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryStyle.bgColor} ${categoryStyle.color}`}>
              {categoryStyle.emoji} {news.category}
            </span>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeDiff(news.published_at)}
          </span>
        </div>
        
        {/* 标题 */}
        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-3 leading-tight">
          {news.title}
        </h3>
        
        {/* 摘要 */}
        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed mb-4">
          {news.summary}
        </p>
        
        {/* 底部信息 */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-slate-400">{news.source}</span>
          </div>
          <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            阅读详情
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </article>
    </Link>
  );
}

// 新闻列表项组件
function NewsListItem({ news, index }: { news: NewsItem; index: number }) {
  const priority = priorityConfig[news.priority] || priorityConfig.B;
  const categoryStyle = getCategoryStyle(news.category);
  
  return (
    <Link href={`/news/${news.id}`} className="block group">
      <article className="flex items-start gap-4 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
        {/* 序号 */}
        <span className="text-2xl font-bold text-muted-foreground/30 w-10 shrink-0 text-center">
          {String(index + 1).padStart(2, '0')}
        </span>
        
        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priority.bgColor} ${priority.textColor}`}>
              {priority.label}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryStyle.bgColor} ${categoryStyle.color}`}>
              {categoryStyle.emoji} {news.category}
            </span>
          </div>
          
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {news.title}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {news.summary}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              {news.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeDiff(news.published_at)}
            </span>
          </div>
        </div>
        
        {/* 箭头 */}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-2" />
      </article>
    </Link>
  );
}

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState({ date: '', weekday: '' });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/news?type=daily&sort=priority&limit=50')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setNews(data.data);
        }
        const today = formatDateDisplay(new Date().toISOString());
        setCurrentDate(today);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
        setLoading(false);
      });
  }, []);
  
  // 计算每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    news.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [news]);
  
  // 获取所有有数据的分类
  const availableCategories = useMemo(() => {
    return Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
  }, [categoryCounts]);
  
  // 过滤新闻
  const filteredNews = useMemo(() => {
    if (!selectedCategory) return news;
    return news.filter(item => item.category === selectedCategory);
  }, [news, selectedCategory]);
  
  const featuredNews = filteredNews.slice(0, 3);
  const listNews = filteredNews.slice(3);

  return (
    <div className="relative min-h-screen">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero 区域 */}
        <section className="text-center py-12 md:py-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI 资讯聚合平台
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">新叶</span>
            <span className="text-foreground">AI</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            每日精选 AI 领域最新动态，3 分钟速览行业前沿
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-border/50 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              {currentDate.date} {currentDate.weekday}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-border/50 text-sm">
              <Zap className="w-4 h-4 text-amber-500" />
              每日 6:00 更新
            </span>
          </div>
        </section>
        
        {/* 分类筛选栏 */}
        {!loading && availableCategories.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">按分类筛选</span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  清除筛选
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-white dark:bg-slate-800 text-foreground border-border/50 hover:border-primary/50 hover:shadow-sm'
                }`}
              >
                🌐 全部
                <span className="text-xs opacity-70">({news.length})</span>
              </button>
              {availableCategories.map(category => {
                const style = getCategoryStyle(category);
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(isSelected ? null : category)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : `${style.bgColor} ${style.color} hover:shadow-sm`
                    }`}
                  >
                    {style.emoji} {category}
                    <span className="text-xs opacity-70">({categoryCounts[category]})</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
        
        {/* 加载状态 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* 头条区域 - 3 列 */}
            {featuredNews.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-bold text-foreground">今日热点</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredNews.map((item, index) => (
                    <FeaturedCard key={item.id} news={item} index={index} />
                  ))}
                </div>
              </section>
            )}
            
            {/* 更多资讯 - 列表 */}
            {listNews.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Newspaper className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">更多资讯</h2>
                  <span className="text-sm text-muted-foreground">
                    ({filteredNews.length}{selectedCategory ? ` · ${selectedCategory}` : ''})
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {listNews.map((item, index) => (
                    <NewsListItem key={item.id} news={item} index={index} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        
        {/* 空状态 */}
        {!loading && (selectedCategory ? filteredNews.length === 0 : news.length === 0) && (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">
              {selectedCategory ? `没有"${selectedCategory}"分类的资讯` : '暂无资讯'}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedCategory ? (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-primary hover:underline"
                >
                  查看全部资讯
                </button>
              ) : (
                '每日 6:00 自动采集更新'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
