'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 获取新闻列表
  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pending?status=all&limit=100');
      const data = await res.json();
      if (data.success) {
        setNews(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNews();
  }, []);
  
  // 显示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  
  // 删除新闻
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条新闻吗？')) return;
    
    try {
      const res = await fetch(`/api/admin/pending/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', '删除成功');
        setNews(prev => prev.filter(n => n.id !== id));
      } else {
        showMessage('error', `删除失败: ${data.error}`);
      }
    } catch (err) {
      showMessage('error', '删除请求失败');
    }
  };
  
  // 统计分类
  const categoryCounts = news.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回首页
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">管理后台</h1>
              </div>
              <p className="text-muted-foreground">
                新闻管理（采集、审核、分类由Agent自动完成）
              </p>
            </div>
            
            <button
              onClick={fetchNews}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
          </div>
        </div>
        
        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}
        
        {/* 统计 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-border/50">
            <div className="text-2xl font-bold text-primary">{news.length}</div>
            <div className="text-sm text-muted-foreground">总数</div>
          </div>
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-border/50">
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-sm text-muted-foreground">{cat}</div>
            </div>
          ))}
        </div>
        
        {/* 新闻列表 */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30 bg-muted/30">
            <h2 className="text-lg font-bold text-foreground">
              新闻列表
            </h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : news.length > 0 ? (
            <div className="divide-y divide-border/30">
              {news.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : item.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status === 'published' ? '已发布' : item.status === 'rejected' ? '已拒绝' : '待审核'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">
                          {item.priority}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.source}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-medium text-foreground line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="shrink-0 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              暂无新闻数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
