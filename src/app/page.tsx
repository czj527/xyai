'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Flame,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import type { NewsItem } from '@/lib/supabase';

// 分类配置
const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
  '模型发布': { label: '模型发布', color: 'bg-purple-100 text-purple-700', icon: '🤖' },
  '工具发布': { label: '工具发布', color: 'bg-blue-100 text-blue-700', icon: '🔧' },
  '政策融资': { label: '政策融资', color: 'bg-amber-100 text-amber-700', icon: '💰' },
  '项目相关': { label: '项目相关', color: 'bg-green-100 text-green-700', icon: '📦' },
};

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
  const category = categoryConfig[news.category] || categoryConfig['项目相关'];
  
  return (
    <Link href={`/news/${news.id}`} className="block group">
      <article className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-border/50 p-6 h-full transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
        {/* 序号装饰 */}
        <div className="absolute top-4 right-4 text-6xl font-bold text-muted-foreground/5">
          {String(index + 1).padStart(2, '0')}
        </div>
        
        {/* 分类标签 */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
            {category.icon} {category.label}
          </span>
        </div>
        
        {/* 标题 */}
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-3 leading-tight line-clamp-2">
          {news.title}
        </h3>
        
        {/* 摘要 */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
          {news.summary}
        </p>
        
        {/* 底部信息 */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary/50" />
              {news.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeDiff(news.published_at)}
            </span>
          </div>
          
          <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            阅读详情
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState('');
  
  useEffect(() => {
    setLoading(true);
    // 只获取今日精选新闻（限制10条）
    fetch('/api/news?type=daily&sort=priority&limit=10')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setNews(data.data);
        }
        const now = new Date();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        setToday(`${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
        setLoading(false);
      });
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero 区域 */}
        <section className="text-center py-12 md:py-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI 资讯精选
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">新叶</span>
            <span className="text-foreground">AI</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            每日精选 10 条 AI 热点，3 分钟速览行业前沿
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-border/50 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              {today}
            </span>
            <Link 
              href="/history"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              历史数据
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
        
        {/* 今日热点 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">今日热点</h2>
              <p className="text-sm text-muted-foreground">精选 AI 领域最重要的 10 条资讯</p>
            </div>
          </div>
          
          {/* 加载状态 */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item, index) => (
                <HotspotCard key={item.id} news={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Zap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">暂无今日热点</p>
              <p className="text-sm text-muted-foreground">
                每日 6:00 自动采集更新
              </p>
            </div>
          )}
        </section>
        
        {/* 查看更多 */}
        {news.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/history"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              查看历史数据
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
