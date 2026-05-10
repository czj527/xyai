'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield,
  RefreshCw,
  Trash2,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Database,
  Wand2
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
  const [pendingNews, setPendingNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 获取待审核新闻
  const fetchPendingNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pending?status=all&limit=50');
      const data = await res.json();
      if (data.success) {
        setPendingNews(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending news:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPendingNews();
  }, []);
  
  // 显示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  
  // 手动采集
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
        showMessage('success', `采集成功！获取 ${data.count} 条新闻`);
        fetchPendingNews();
      } else {
        showMessage('error', `采集失败: ${data.error}`);
      }
    } catch (err) {
      showMessage('error', '采集请求失败');
    } finally {
      setCollecting(false);
    }
  };
  
  // 重新分类
  const handleReclassify = async () => {
    setReclassifying(true);
    try {
      const res = await fetch('/api/admin/reclassify', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', `重新分类完成！更新 ${data.updated} 条`);
        fetchPendingNews();
      } else {
        showMessage('error', `分类失败: ${data.error}`);
      }
    } catch (err) {
      showMessage('error', '分类请求失败');
    } finally {
      setReclassifying(false);
    }
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
        setPendingNews(prev => prev.filter(n => n.id !== id));
      } else {
        showMessage('error', `删除失败: ${data.error}`);
      }
    } catch (err) {
      showMessage('error', '删除请求失败');
    }
  };
  
  // 清理旧数据
  const handleCleanup = async () => {
    if (!confirm('确定要清理7天前的数据吗？')) return;
    
    try {
      const res = await fetch('/api/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days_to_keep: 7 })
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', `清理完成！删除 ${data.deleted_reports} 个报告，${data.deleted_news} 条新闻`);
        fetchPendingNews();
      } else {
        showMessage('error', `清理失败: ${data.error}`);
      }
    } catch (err) {
      showMessage('error', '清理请求失败');
    }
  };
  
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
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">管理后台</h1>
          </div>
          <p className="text-muted-foreground">
            新闻采集、审核、分类管理
          </p>
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
        
        {/* 操作按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleCollect}
            disabled={collecting}
            className="flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {collecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {collecting ? '采集中...' : '手动采集'}
          </button>
          
          <button
            onClick={handleReclassify}
            disabled={reclassifying}
            className="flex items-center justify-center gap-2 p-4 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 disabled:opacity-50 transition-colors"
          >
            {reclassifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            {reclassifying ? '分类中...' : '重新分类'}
          </button>
          
          <button
            onClick={handleCleanup}
            className="flex items-center justify-center gap-2 p-4 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors"
          >
            <Database className="w-5 h-5" />
            清理旧数据
          </button>
          
          <button
            onClick={fetchPendingNews}
            className="flex items-center justify-center gap-2 p-4 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            刷新列表
          </button>
        </div>
        
        {/* 新闻列表 */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30 bg-muted/30">
            <h2 className="text-lg font-bold text-foreground">
              新闻列表 ({pendingNews.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pendingNews.length > 0 ? (
            <div className="divide-y divide-border/30">
              {pendingNews.map((item) => (
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
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {item.summary}
                      </p>
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
