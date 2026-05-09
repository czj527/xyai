'use client';

import Link from 'next/link';
import { ExternalLink, Clock, AlertCircle } from 'lucide-react';
import type { NewsItem } from '@/lib/supabase';

interface NewsCardProps {
  news: NewsItem;
  index?: number;
}

const priorityConfig = {
  SSS: { 
    label: 'SSS', 
    color: 'bg-gradient-to-b from-amber-500 to-orange-500',
  },
  SS: { 
    label: 'SS', 
    color: 'bg-gradient-to-b from-pink-500 to-rose-500',
  },
  S: { 
    label: 'S', 
    color: 'bg-gradient-to-b from-emerald-400 to-green-500',
  },
  A: { 
    label: 'A', 
    color: 'bg-gradient-to-b from-blue-400 to-cyan-500',
  },
  B: { 
    label: 'B', 
    color: 'bg-gradient-to-b from-gray-400 to-gray-500',
  },
};

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
  });
}

export function NewsCard({ news, index = 0 }: NewsCardProps) {
  const priority = priorityConfig[news.priority] || priorityConfig.B;
  const delayClass = index > 0 ? `stagger-${Math.min((index % 6) + 1, 8)}` : '';
  
  return (
    <article
      className={`
        group relative overflow-hidden rounded-lg
        glass-card p-4
        animate-fade-in-up
        ${delayClass}
      `}
      style={{ opacity: 0 }}
    >
      <div className="relative flex gap-3">
        <div className={`flex-shrink-0 w-1 rounded-full ${priority.color}`} />
        
        <div className="flex-1 min-w-0">
          <Link href={`/news/${news.id}`} className="group/link block">
            <h3 className="text-sm font-bold text-foreground group-hover/link:text-primary transition-colors line-clamp-1 leading-snug">
              {news.title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {news.summary}
          </p>
          
          <div className="flex items-center justify-between mt-2.5">
            <span className="px-2 py-0.5 bg-accent rounded text-[10px] text-accent-foreground font-medium">
              {news.category}
            </span>
            <a
              href={news.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              <span>原文</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5 text-right">
          <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
            {news.source}
          </span>
          <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatTime(news.published_at)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-lg">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-1 h-20 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-full rounded mt-1" />
          <div className="skeleton h-3 w-2/3 rounded" />
          <div className="flex justify-between mt-2">
            <div className="skeleton h-4 w-12 rounded" />
            <div className="skeleton h-4 w-10 rounded" />
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <div className="skeleton h-3 w-14 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

interface NewsEmptyProps {
  message?: string;
}

export function NewsEmpty({ message = '暂无资讯' }: NewsEmptyProps) {
  return (
    <div className="glass-card p-10 text-center rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">暂无资讯</h3>
          <p className="text-xs text-muted-foreground mt-1.5">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
