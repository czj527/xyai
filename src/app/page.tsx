'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Newspaper, RefreshCw, Sparkles, Leaf, Zap } from 'lucide-react';
import { NewsCard, NewsCardSkeleton, NewsEmpty } from '@/components/ui/NewsCard';
import { GreenChatbot } from '@/components/ui/GreenChatbot';
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
    <div className="relative">
      {/* 背景装饰 - 浅色模式 */}
      <div className="light-bg-gradient light-bg-decorations absolute inset-0 -z-10" />
      {/* 背景装饰 - 深色模式 */}
      <div className="dark hidden dark:block absolute inset-0 -z-10">
        <div className="dark-bg-glow" />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <section className="hero-section flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-12 md:py-16">
          {/* 左侧文字 */}
          <div className="text-center md:text-left flex-1">
            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl">
              新叶AI
            </h1>
            <p className="hero-subtitle text-lg md:text-xl mt-4">
              每日AI资讯，助你紧跟前沿
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                每日8:00更新
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                <Leaf className="w-4 h-4" />
                春季主题
              </span>
            </div>
          </div>
          
          {/* 右侧头像 */}
          <div className="flex-shrink-0 animate-float text-center">
            <div className="avatar-glow inline-block">
              <Image
                src="/images/avatar-green.jpg"
                alt="绿·AI资讯助手"
                width={150}
                height={150}
                className="w-[150px] h-[150px] rounded-full object-cover border-4 border-white/80 dark:border-white/20"
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              绿 · AI资讯助手
            </p>
          </div>
        </section>
        
        {/* 页面标题区 */}
        <header className="mb-8">
          <div className="flex items-center justify-between mt-4 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  今日资讯
                </h2>
                <p className="text-xs text-muted-foreground">
                  聚焦AI领域最新动态
                </p>
              </div>
            </div>
            
            {/* 更新时间 & 刷新按钮 */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>更新: {lastUpdate || '加载中...'}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent hover:bg-primary hover:text-primary-foreground rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
            </div>
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
          <div className="mt-10 pb-8 text-center">
            <p className="text-xs text-muted-foreground">
              每8小时自动更新 · 数据来源：量子位、机器之心、HackerNews等
            </p>
          </div>
        )}
      </div>
      
      {/* 绿的对话看板娘 */}
      <GreenChatbot />
    </div>
  );
}
