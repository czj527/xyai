'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import type { NewsItem } from '@/lib/supabase';

// 分类配置
const categories = [
  { key: '模型发布', label: '模型发布', icon: '🤖', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: '工具发布', label: '工具发布', icon: '🔧', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: '政策融资', label: '政策融资', icon: '💰', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: '项目相关', label: '项目相关', icon: '📦', color: 'bg-green-100 text-green-700 border-green-200' },
];

// 优先级样式
const priorityStyles: Record<string, string> = {
  'SSS': 'bg-red-100 text-red-700 font-bold',
  'SS': 'bg-orange-100 text-orange-700 font-bold',
  'S': 'bg-yellow-100 text-yellow-700',
  'A': 'bg-blue-100 text-blue-700',
  'B': 'bg-gray-100 text-gray-700',
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

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [today, setToday] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  
  const fetchNews = () => {
    setLoading(true);
    fetch('/api/news?type=daily&sort=priority&limit=50')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setNews(data.data);
        }
        const now = new Date();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        setToday(`${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`);
        setLastUpdate(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
        setLoading(false);
      });
  };
  
  useEffect(() => {
    fetchNews();
  }, []);
  
  // 手动触发采集
  const handleCollect = async () => {
    setCollecting(true);
    try {
      const res = await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        // 重新获取新闻
        fetchNews();
      }
    } catch (err) {
      console.error('Collect failed:', err);
    } finally {
      setCollecting(false);
    }
  };
  
  // 按分类分组新闻
  const newsByCategory = categories.map(cat => ({
    ...cat,
    news: news.filter(n => n.category === cat.key).slice(0, 5)
  }));
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部 */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">新叶</span>
                <span className="text-foreground">AI</span>
                <span className="text-muted-foreground text-xl ml-3">资讯聚合</span>
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {today}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  更新于 {lastUpdate}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/history"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                历史数据
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <button
                onClick={handleCollect}
                disabled={collecting}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {collecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {collecting ? '采集中...' : '手动采集'}
              </button>
            </div>
          </div>
        </header>
        
        {/* 分类表格 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {newsByCategory.map(category => (
              <div 
                key={category.key}
                className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 overflow-hidden shadow-sm"
              >
                {/* 分类标题 */}
                <div className={`px-6 py-4 border-b border-border/30 ${category.color}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                    </h2>
                    <span className="text-sm font-normal opacity-70">
                      {news.filter(n => n.category === category.key).length} 条
                    </span>
                  </div>
                </div>
                
                {/* 新闻列表 */}
                <div className="divide-y divide-border/30">
                  {category.news.length > 0 ? (
                    category.news.map((item, index) => (
                      <Link 
                        key={item.id} 
                        href={`/news/${item.id}`}
                        className="block hover:bg-accent/30 transition-colors"
                      >
                        <div className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {/* 序号 */}
                            <span className="text-lg font-bold text-muted-foreground/30 w-8 shrink-0">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            
                            {/* 内容 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${priorityStyles[item.priority] || priorityStyles['B']}`}>
                                  {item.priority}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {item.source}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeDiff(item.published_at)}
                                </span>
                              </div>
                              
                              <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                                {item.title}
                              </h3>
                              
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {item.summary}
                              </p>
                            </div>
                            
                            {/* 链接图标 */}
                            <ExternalLink className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-1" />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                      暂无资讯
                    </div>
                  )}
                </div>
                
                {/* 查看更多 */}
                {news.filter(n => n.category === category.key).length > 5 && (
                  <div className="px-6 py-3 border-t border-border/30 bg-muted/30">
                    <Link 
                      href={`/history?category=${category.key}`}
                      className="text-sm text-primary flex items-center justify-center gap-1 hover:underline"
                    >
                      查看更多
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* 统计信息 */}
        {!loading && news.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            共 {news.length} 条资讯 | 
            模型发布 {news.filter(n => n.category === '模型发布').length} 条 | 
            工具发布 {news.filter(n => n.category === '工具发布').length} 条 | 
            政策融资 {news.filter(n => n.category === '政策融资').length} 条 | 
            项目相关 {news.filter(n => n.category === '项目相关').length} 条
          </div>
        )}
      </div>
    </div>
  );
}
