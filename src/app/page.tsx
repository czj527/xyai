'use client';

import { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, Sparkles } from 'lucide-react';
import { NewsCard, NewsCardSkeleton, NewsEmpty } from '@/components/ui/NewsCard';
import { mockNews } from '@/lib/mockData';
import type { NewsItem } from '@/lib/supabase';

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  // 加载新闻数据
  useEffect(() => {
    loadNews();
  }, []);
  
  async function loadNews() {
    setLoading(true);
    try {
      // TODO: 后续接入Supabase真实数据
      // 暂时使用Mock数据
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载
      setNews(mockNews);
      setLastUpdate(new Date().toLocaleString('zh-CN'));
    } catch (error) {
      console.error('加载新闻失败:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // 手动刷新
  async function handleRefresh() {
    await loadNews();
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* 页面标题区 */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              AI资讯早报
            </h1>
            <p className="text-sm text-muted-foreground">
              每日8:00更新，聚焦AI领域最新动态
            </p>
          </div>
        </div>
        
        {/* 更新时间 & 刷新按钮 */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>最后更新: {lastUpdate || '加载中...'}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
        </div>
      </header>
      
      {/* 新闻列表 */}
      <div className="space-y-4">
        {loading ? (
          // 加载骨架屏
          <>
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </>
        ) : news.length > 0 ? (
          // 新闻卡片列表
          news.map((item, index) => (
            <NewsCard key={item.id} news={item} index={index} />
          ))
        ) : (
          // 空状态
          <NewsEmpty />
        )}
      </div>
      
      {/* 底部提示 */}
      {!loading && news.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            每8小时自动更新 · 数据来源：量子位、机器之心、HackerNews等
          </p>
        </div>
      )}
    </div>
  );
}
