'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Newspaper, RefreshCw, Sparkles, Leaf, ChevronDown } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('priority');
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadNews = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const currentPage = reset ? 1 : page;
      const response = await fetch(`/api/news?type=${activeTab}&sort=${sortBy}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      const result = await response.json();
      
      if (result.success) {
        if (reset) {
          setNews(result.data);
          setPage(1);
        } else {
          setNews(prev => [...prev, ...result.data]);
        }
        setLastUpdate(new Date(result.updated).toLocaleString('zh-CN'));
        setHasMore(result.hasMore);
      }
    } catch (error) {
      console.error('加载新闻失败:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, sortBy, page]);

  // 初始加载
  useEffect(() => {
    loadNews(true);
  }, [activeTab, sortBy]);

  // 无限滚动
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage(prev => {
            const next = prev + 1;
            // 加载下一页
            fetch(`/api/news?type=${activeTab}&sort=${sortBy}&page=${next}&limit=${ITEMS_PER_PAGE}`)
              .then(res => res.json())
              .then(result => {
                if (result.success && result.data.length > 0) {
                  setNews(prev_news => [...prev_news, ...result.data]);
                  setHasMore(result.hasMore);
                } else {
                  setHasMore(false);
                }
                setLoadingMore(false);
              })
              .catch(() => setLoadingMore(false));
            setLoadingMore(true);
            return next;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, activeTab, sortBy]);

  async function handleRefresh() {
    await loadNews(true);
  }

  const tabLabels = { daily: '今日', weekly: '上周', monthly: '上月' };

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
        
        <header className="mb-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">AI资讯</h2>
                <p className="text-xs text-muted-foreground">聚焦AI领域最新动态</p>
              </div>
            </div>
            
            {/* 时间筛选Tab */}
            <div className="flex items-center gap-2">
              {(Object.keys(tabLabels) as Array<keyof typeof tabLabels>).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === key
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {tabLabels[key]}
                </button>
              ))}
              
              <span className="mx-2 w-px h-5 bg-border" />
              
              {/* 排序切换 */}
              <span className="text-xs text-muted-foreground">排序：</span>
              <button
                onClick={() => setSortBy('priority')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  sortBy === 'priority'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                按评级
              </button>
              <button
                onClick={() => setSortBy('time')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  sortBy === 'time'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                按时间
              </button>
            </div>
          </div>
        </header>
        
        {loading ? (
          <div className="news-grid">
            {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        ) : news.length > 0 ? (
          <>
            <div className="news-grid">
              {news.map((item, index) => (
                <NewsCard key={`${item.id}-${index}`} news={item} index={index} />
              ))}
            </div>
            
            {/* 无限滚动触发器 */}
            <div ref={loadMoreRef} className="py-6 text-center">
              {loadingMore ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">加载更多...</span>
                </div>
              ) : hasMore ? (
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                  <span className="text-xs">向下滚动加载更多</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  已加载全部 {news.length} 条资讯
                </p>
              )}
            </div>
          </>
        ) : (
          <NewsEmpty />
        )}
        
        {!loading && news.length > 0 && (
          <div className="mt-4 pb-8 text-center">
            <p className="text-xs text-muted-foreground">
              每8小时自动更新 · 数据来源：量子位、OpenAI、TechCrunch、HackerNews等
            </p>
          </div>
        )}
      </div>
      
      <GreenChatbot />
    </div>
  );
}
