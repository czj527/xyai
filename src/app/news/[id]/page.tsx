'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Link2
} from 'lucide-react';
import { mockNews } from '@/lib/mockData';
import type { NewsItem } from '@/lib/supabase';

interface ExtendedNewsItem extends NewsItem {
  core_facts?: string[];
  key_data?: string[];
  related_links?: { title: string; url: string }[];
}

const priorityConfig = {
  SSS: { label: 'SSS', className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white', icon: '🔥' },
  SS: { label: 'SS', className: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white', icon: '⭐' },
  S: { label: 'S', className: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white', icon: '✨' },
  A: { label: 'A', className: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white', icon: '📌' },
  B: { label: 'B', className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white', icon: '📎' },
};

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

function getNewsIndex(newsId: string, allNews: NewsItem[]): number {
  return allNews.findIndex(n => n.id === newsId);
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<ExtendedNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const all = mockNews;
      setAllNews(all);
      
      const found = all.find(n => n.id === params.id);
      if (found) {
        const extended = found as ExtendedNewsItem;
        extended.core_facts = extended.core_facts || [
          '这是核心事实的第一点内容',
          '这是核心事实的第二点内容',
        ];
        extended.key_data = extended.key_data || [
          '关键数据项1',
          '关键数据项2',
        ];
        extended.related_links = extended.related_links || [];
        setNews(extended);
        setCurrentIndex(getNewsIndex(found.id, all));
      }
      setLoading(false);
    }, 300);
  }, [params.id]);
  
  const prevNews = allNews[currentIndex - 1];
  const nextNews = allNews[currentIndex + 1];
  
  const goToPrev = () => {
    if (prevNews) {
      router.push('/news/' + prevNews.id);
    }
  };
  
  const goToNext = () => {
    if (nextNews) {
      router.push('/news/' + nextNews.id);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevNews) {
        goToPrev();
      } else if (e.key === 'ArrowRight' && nextNews) {
        goToNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevNews, nextNews]);
  
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
  const newsNumber = String(currentIndex + 1).padStart(2, '0');
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link 
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回资讯列表
      </Link>
      
      <article className="animate-fade-in-up">
        <header className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <span className="text-5xl font-bold text-primary/30">
              {newsNumber}
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${priority.className}`}>
              {priority.icon} {priority.label}
            </span>
          </div>
          
          <div className="border-t-2 border-border/50 mb-6" />
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
            {news.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {news.source}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(news.published_at)}
            </span>
            <span className="px-2 py-0.5 bg-accent rounded-full text-xs font-medium">
              {news.category}
            </span>
          </div>
        </header>
        
        <div className="space-y-8">
          <section className="glass-card p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-slate-900/90">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI摘要
            </h2>
            <p className="text-lg text-foreground/90 leading-relaxed">
              {news.summary}
            </p>
          </section>
          
          {news.core_facts && news.core_facts.length > 0 && (
            <section className="glass-card p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-slate-900/90">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">📌</span>
                核心事实
              </h2>
              <ul className="space-y-3">
                {news.core_facts.map((fact, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-foreground/90 leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {news.key_data && news.key_data.length > 0 && (
            <section className="glass-card p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-slate-900/90">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">📊</span>
                关键数据
              </h2>
              <ul className="space-y-3">
                {news.key_data.map((data, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary font-bold">·</span>
                    <span className="text-foreground/90 leading-relaxed">{data}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {news.related_links && news.related_links.length > 0 && (
            <section className="glass-card p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-slate-900/90">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                相关链接
              </h2>
              <ul className="space-y-2">
                {news.related_links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{link.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          <section className="glass-card p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-slate-900/90">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary" />
              阅读原文
            </h2>
            <a
              href={news.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <span>前往 {news.source}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </section>
        </div>
        
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
          <button
            onClick={goToPrev}
            disabled={!prevNews}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              prevNews 
                ? 'bg-accent hover:bg-primary hover:text-primary-foreground text-foreground' 
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">上一条</span>
            {prevNews && (
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2 max-w-[150px] truncate">
                {prevNews.title}
              </span>
            )}
          </button>
          
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {allNews.length}
          </span>
          
          <button
            onClick={goToNext}
            disabled={!nextNews}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              nextNews 
                ? 'bg-accent hover:bg-primary hover:text-primary-foreground text-foreground' 
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            {nextNews && (
              <span className="hidden sm:inline text-xs text-muted-foreground mr-2 max-w-[150px] truncate">
                {nextNews.title}
              </span>
            )}
            <span className="text-sm">下一条</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </article>
    </div>
  );
}
