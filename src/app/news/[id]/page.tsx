'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { mockNews } from '@/lib/mockData';
import type { NewsItem } from '@/lib/supabase';

// 优先级配置
const priorityConfig = {
  SSS: { label: 'SSS', className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white', icon: '🔥' },
  SS: { label: 'SS', className: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white', icon: '⭐' },
  S: { label: 'S', className: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white', icon: '✨' },
  A: { label: 'A', className: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white', icon: '📌' },
  B: { label: 'B', className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white', icon: '📎' },
};

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 相关新闻
function getRelatedNews(currentId: string): NewsItem[] {
  return mockNews
    .filter(news => news.id !== currentId)
    .slice(0, 3);
}

export default function NewsDetailPage() {
  const params = useParams();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  
  useEffect(() => {
    // 模拟加载
    setLoading(true);
    setTimeout(() => {
      const found = mockNews.find(n => n.id === params.id);
      setNews(found || null);
      setRelatedNews(found ? getRelatedNews(found.id) : mockNews.slice(0, 3));
      setLoading(false);
    }, 300);
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-24 bg-muted rounded" />
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="h-6 w-1/2 bg-muted rounded" />
          <div className="space-y-4 mt-8">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!news) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">资讯未找到</h1>
          <p className="text-muted-foreground mb-6">抱歉，找不到这篇资讯的内容</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }
  
  const priority = priorityConfig[news.priority] || priorityConfig.B;
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* 返回按钮 */}
      <Link 
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回资讯列表
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <article className="flex-1">
          {/* 详情头部 */}
          <header className="news-detail-header">
            {/* 标签区 */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${priority.className}`}>
                {priority.icon} {priority.label}
              </span>
              <span className="source-badge">
                <Sparkles className="w-3 h-3" />
                {news.source}
              </span>
              <span className="px-2 py-0.5 bg-accent rounded-full text-xs text-accent-foreground font-medium">
                {news.category}
              </span>
            </div>
            
            {/* 标题 */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
              {news.title}
            </h1>
            
            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(news.published_at)}
              </span>
            </div>
          </header>
          
          {/* 正文内容 */}
          <div className="news-detail-content glass-card-enhanced p-6 sm:p-8 mb-8">
            {/* 摘要作为开头 */}
            <p className="text-lg text-foreground/90 leading-relaxed mb-6 pb-6 border-b border-border/50">
              {news.summary}
            </p>
            
            {/* 详细内容（模拟） */}
            <div className="space-y-4 text-foreground/80">
              <p>
                这条资讯来自 <strong>{news.source}</strong>，涵盖了 {news.category} 领域的最新发展。
                根据分析，这条资讯的重要性评级为 <strong>{news.priority}级</strong>，
                建议优先关注。
              </p>
              <p>
                建议配合原文链接了解更多详细信息，或关注我们后续的追踪报道。
              </p>
            </div>
            
            {/* 原文链接 */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <span>阅读原文</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </article>
        
        {/* 侧边栏 - 相关推荐 */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              相关推荐
            </h3>
            
            <div className="space-y-3">
              {relatedNews.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/news/${item.id}`}
                  className="block"
                >
                  <article className="related-news-card group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[item.priority].className}`}>
                        {priorityConfig[item.priority].icon} {item.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{item.category}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            
            {/* 返回首页 */}
            <Link
              href="/"
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors text-sm font-medium"
            >
              查看更多资讯
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
