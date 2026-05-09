'use client';

import Link from 'next/link';
import { ExternalLink, Clock, AlertCircle, Sparkles } from 'lucide-react';
import type { NewsItem } from '@/lib/supabase';

interface NewsCardProps {
  news: NewsItem;
  index?: number;
}

// 优先级配置 - 带渐变效果
const priorityConfig = {
  SSS: { 
    label: 'SSS', 
    className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30', 
    icon: '🔥' 
  },
  SS: { 
    label: 'SS', 
    className: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30', 
    icon: '⭐' 
  },
  S: { 
    label: 'S', 
    className: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg shadow-green-500/30', 
    icon: '✨' 
  },
  A: { 
    label: 'A', 
    className: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg shadow-blue-500/30', 
    icon: '📌' 
  },
  B: { 
    label: 'B', 
    className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30', 
    icon: '📎' 
  },
};

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NewsCard({ news, index = 0 }: NewsCardProps) {
  const priority = priorityConfig[news.priority] || priorityConfig.B;
  const delayClass = index > 0 ? `stagger-${Math.min(index, 8)}` : '';
  
  return (
    <article
      className={`
        group relative overflow-hidden rounded-xl
        glass-card-enhanced p-5
        animate-fade-in-up
        ${delayClass}
      `}
      style={{ opacity: 0 }}
    >
      {/* 绿色边框光晕效果 - 默认隐藏 */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl border-2 border-primary/50" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent" />
      </div>
      
      <div className="relative flex flex-col gap-3">
        {/* 头部：优先级 + 来源 */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${priority.className}`}>
            <span>{priority.icon}</span>
            <span>{priority.label}</span>
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="source-badge">
              <Sparkles className="w-3 h-3" />
              {news.source}
            </span>
          </div>
        </div>
        
        {/* 标题 - 带hover高亮 */}
        <Link href={`/news/${news.id}`} className="group/link">
          <h3 className="text-lg font-bold text-foreground group-hover/link:text-primary transition-all duration-200 line-clamp-2 leading-snug">
            {news.title}
          </h3>
        </Link>
        
        {/* 摘要 */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {news.summary}
        </p>
        
        {/* 底部：时间 + 分类 + 链接 */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(news.published_at)}
            </span>
            <span className="px-2 py-0.5 bg-accent rounded-full text-accent-foreground font-medium">
              {news.category}
            </span>
          </div>
          
          <a
            href={news.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
          >
            <span>原文</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

// 加载骨架屏
export function NewsCardSkeleton() {
  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-14 rounded-full" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
        <div className="skeleton h-6 w-full rounded" />
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="flex flex-col gap-2 mt-1">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

// 空状态
export function NewsEmpty() {
  return (
    <div className="glass-card p-12 text-center rounded-xl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">暂无资讯</h3>
          <p className="text-sm text-muted-foreground mt-2">
            稍后再来看看吧，或者手动触发采集
          </p>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
