'use client';

import Link from 'next/link';
import { ExternalLink, Clock, AlertCircle } from 'lucide-react';
import type { NewsItem } from '@/lib/supabase';

interface NewsCardProps {
  news: NewsItem;
  index?: number;
}

// 优先级配置
const priorityConfig = {
  SSS: { label: 'SSS', className: 'priority-sss', icon: '🔥' },
  SS: { label: 'SS', className: 'priority-ss', icon: '⭐' },
  S: { label: 'S', className: 'priority-s', icon: '✨' },
  A: { label: 'A', className: 'priority-a', icon: '📌' },
  B: { label: 'B', className: 'priority-b', icon: '📎' },
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
  
  return (
    <article
      className={`
        glass-card glass-card-hover p-5 animate-fade-in-up
        ${index > 0 ? `stagger-${Math.min(index, 8)}` : ''}
      `}
      style={{ opacity: 0 }}
    >
      <div className="flex flex-col gap-3">
        {/* 头部：优先级 + 来源 */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority.className}`}>
            {priority.icon} {priority.label}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="source-badge">
              {news.source}
            </span>
          </div>
        </div>
        
        {/* 标题 */}
        <Link href={`/news/${news.id}`} className="group">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {news.title}
          </h3>
        </Link>
        
        {/* 摘要 */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {news.summary}
        </p>
        
        {/* 底部：时间 + 分类 + 链接 */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(news.published_at)}
            </span>
            <span className="px-2 py-0.5 bg-accent rounded text-accent-foreground">
              {news.category}
            </span>
          </div>
          
          <a
            href={news.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span>原文</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}

// 加载骨架屏
export function NewsCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-12 rounded-full" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        <div className="skeleton h-6 w-full rounded" />
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

// 空状态
export function NewsEmpty() {
  return (
    <div className="glass-card p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
        <div>
          <h3 className="text-lg font-medium text-foreground">暂无资讯</h3>
          <p className="text-sm text-muted-foreground mt-1">
            稍后再来看看吧，或者手动触发采集
          </p>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
