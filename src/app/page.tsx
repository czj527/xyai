'use client';

import { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, Sparkles, Leaf, ChevronLeft, ChevronRight, Calendar, ArrowUpDown } from 'lucide-react';
import { NewsCard, NewsCardSkeleton, NewsEmpty } from '@/components/ui/NewsCard';
import { GreenChatbot } from '@/components/ui/GreenChatbot';
import type { NewsItem } from '@/lib/supabase';

const ITEMS_PER_PAGE = 6;

type TimeFilter = 'daily' | 'weekly' | 'monthly';
type SortBy = 'priority' | 'time';

const TIME_FILTER_LABELS: Record<TimeFilter, string> = {
  daily: '今日',
  weekly: '上周',
  monthly: '上月',
};

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('daily');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  
  useEffect(() => {
    loadNews();
  }, [timeFilter, sortBy]);
  
  async function loadNews() {
    setLoading(true);
    try {
      const response = await fetch(`/api/news?type=${timeFilter}&sort=${sortBy}`);
      const data = await response.json();
      if (data.success && data.data) {
        setNews(data.data);
        setLastUpdate(data.updated);
      }
    } catch (error) {
      console.error('加载新闻失败:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleRefresh() {
    await loadNews();
    setCurrentPage(1);
  }
  
  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNews = news.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative">
      <div className="light-bg-gradient light-bg-decorations absolute inset-0 -z-10" />
      <div className="dark hidden dark:block absolute inset-0 -z-10">
        <div className="dark-bg-glow" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <section className="hero-compact">
          <div className="hero-left">
            <h1 className="hero-title-compact">
              <span className="gradient-text-green">新叶AI</span>
            </h1>
            <p className="hero-subtitle-compact">
              每日AI资讯，助你紧跟前沿
            </p>
            <div className="hero-tags">
              <span className="hero-tag">
                <Leaf className="w-3.5 h-3.5" />
                春季主题
              </span>
              <span className="hero-tag">
                <Sparkles className="w-3.5 h-3.5" />
                每日更新
              </span>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="update-info">
              <span className="update-time">
                {lastUpdate ? new Date(lastUpdate).toLocaleString('zh-CN') : '加载中...'}
              </span>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="refresh-btn"
                aria-label="刷新"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </section>
        
        <header className="mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                AI资讯
              </h2>
              <p className="text-xs text-muted-foreground">
                聚焦AI领域最新动态
              </p>
            </div>
          </div>
        </header>
        
        {/* 时间筛选和排序 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* 时间筛选 Tab */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(Object.keys(TIME_FILTER_LABELS) as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setTimeFilter(filter);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeFilter === filter
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {TIME_FILTER_LABELS[filter]}
              </button>
            ))}
          </div>
          
          {/* 排序切换 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">排序：</span>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => {
                  setSortBy('priority');
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                  sortBy === 'priority'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                按评级
              </button>
              <button
                onClick={() => {
                  setSortBy('time');
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                  sortBy === 'time'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
                按时间
              </button>
            </div>
          </div>
        </div>
        
        {/* 当前筛选状态提示 */}
        {!loading && (
          <div className="mb-4 text-xs text-muted-foreground">
            共 {news.length} 条资讯 · {TIME_FILTER_LABELS[timeFilter]}资讯 · 
            {sortBy === 'priority' ? '按SSS→SS→S→A→B评级排序' : '按最新时间排序'}
          </div>
        )}
        
        {loading ? (
          <div className="news-grid">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        ) : currentNews.length > 0 ? (
          <>
            <div className="news-grid">
              {currentNews.map((item, index) => (
                <NewsCard key={item.id} news={item} index={index} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  aria-label="上一页"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">上一页</span>
                </button>
                
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  aria-label="下一页"
                >
                  <span className="hidden sm:inline">下一页</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <NewsEmpty message={`暂无${TIME_FILTER_LABELS[timeFilter]}资讯`} />
        )}
        
        {!loading && news.length > 0 && (
          <div className="mt-8 pb-8 text-center">
            <p className="text-xs text-muted-foreground">
              数据来源：量子位、机器之心、HackerNews等 · 
              {sortBy === 'priority' ? '默认按SSS→B评级排序展示' : '按最新时间排序展示'}
            </p>
          </div>
        )}
      </div>
      
      <GreenChatbot />
    </div>
  );
}
