'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Newspaper, RefreshCw, Sparkles, Leaf } from 'lucide-react';
import { NewsCard, NewsCardSkeleton, NewsEmpty } from '@/components/ui/NewsCard';
import { GreenChatbot } from '@/components/ui/GreenChatbot';
import type { NewsItem } from '@/lib/supabase';

const ITEMS_PER_PAGE = 6;

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  // 加载新闻数据
  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/news?sort=priority');
      const result = await response.json();
      
      if (result.success && result.data) {
        setNews(result.data);
        setLastUpdate(new Date(result.updated).toLocaleString('zh-CN'));
        setDisplayedCount(ITEMS_PER_PAGE);
        setHasMore(result.data.length > ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('加载新闻失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 初始加载
  useEffect(() => {
    loadNews();
  }, [loadNews]);
  
  // 加载更多数据
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    // 模拟加载延迟
    setTimeout(() => {
      const newCount = displayedCount + ITEMS_PER_PAGE;
      setDisplayedCount(newCount);
      setHasMore(newCount < news.length);
      setLoadingMore(false);
    }, 500);
  }, [loadingMore, hasMore, displayedCount, news.length]);
  
  // 设置 Intersection Observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, loadMore]);
  
  // 手动刷新
  async function handleRefresh() {
    await loadNews();
  }
  
  // 获取当前显示的新闻
  const currentNews = news.slice(0, displayedCount);
  
  return (
    <div className="relative">
      {/* 背景装饰 - 浅色模式 */}
      <div className="light-bg-gradient light-bg-decorations absolute inset-0 -z-10" />
      {/* 背景装饰 - 深色模式 */}
      <div className="dark hidden dark:block absolute inset-0 -z-10">
        <div className="dark-bg-glow" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Section - 精简版 */}
        <section className="hero-compact">
          {/* 左侧：标题 + 副标题 + 标签 */}
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
          
          {/* 右侧：更新时间 + 刷新按钮 */}
          <div className="hero-right">
            <div className="update-info">
              <span className="update-time">
                {lastUpdate || '加载中...'}
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
        
        {/* 页面标题区 */}
        <header className="mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                今日资讯
              </h2>
              <p className="text-xs text-muted-foreground">
                聚焦AI领域最新动态
              </p>
            </div>
          </div>
        </header>
        
        {/* 新闻网格布局 - 2列 */}
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
            
            {/* 无限滚动加载触发器 */}
            {hasMore && (
              <div 
                ref={loadMoreRef} 
                className="mt-8 flex justify-center items-center py-4"
              >
                {loadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                    <span className="text-sm">加载更多...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* 已加载全部提示 */}
            {!hasMore && (
              <div className="mt-8 py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  已加载全部 {news.length} 条资讯
                </p>
              </div>
            )}
          </>
        ) : (
          <NewsEmpty />
        )}
        
        {/* 底部提示 */}
        {!loading && news.length > 0 && (
          <div className="mt-8 pb-8 text-center">
            <p className="text-xs text-muted-foreground">
              每8小时自动更新 · 数据来源：量子位、机器之心、LMSYS Arena等
            </p>
          </div>
        )}
      </div>
      
      {/* 绿的对话看板娘 */}
      <GreenChatbot />
    </div>
  );
}
