'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  RefreshCw,
  Filter,
  Eye,
} from 'lucide-react';

interface PendingNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  priority: string;
  category: string;
  status: string;
  created_at: string;
  reject_reason?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: '待审核', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  pending: { label: '待审核', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  published: { label: '已发布', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  rejected: { label: '已拒绝', color: 'text-red-600 bg-red-50', icon: XCircle },
};

const priorityColors: Record<string, string> = {
  SSS: 'bg-amber-500 text-white',
  SS: 'bg-pink-500 text-white',
  S: 'bg-emerald-500 text-white',
  A: 'bg-blue-500 text-white',
  B: 'bg-gray-500 text-white',
};

export default function AdminPage() {
  const [news, setNews] = useState<PendingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('draft');
  const [totalCount, setTotalCount] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pending?status=${statusFilter}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setNews(data.data);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch pending news:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNews();
  }, [statusFilter]);
  
  const handleAction = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/pending/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reject_reason: reason }),
      });
      
      const data = await res.json();
      if (data.success) {
        // 更新列表状态
        setNews(prev => prev.map(item => 
          item.id === id 
            ? { ...item, status: action === 'approve' ? 'published' : 'rejected' }
            : item
        ));
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = (id: string) => {
    const reason = prompt('请输入拒绝原因：');
    if (reason !== null) {
      handleAction(id, 'reject', reason);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </Link>
            <span className="text-border">|</span>
            <h1 className="text-lg font-bold">📋 新闻审核</h1>
          </div>
          
          <button
            onClick={fetchNews}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 筛选栏 */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {['draft', 'published', 'rejected', 'all'].map(status => {
            const config = statusConfig[status] || statusConfig.draft;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {status === 'all' ? '全部' : config.label}
                {status === statusFilter && ` (${totalCount})`}
              </button>
            );
          })}
        </div>
        
        {/* 新闻列表 */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/30 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-2">暂无{statusFilter === 'draft' ? '待审核' : ''}新闻</p>
            <p className="text-sm text-muted-foreground">
              采集的新闻会先存入待审核列表，审核通过后才会显示在首页
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map(item => {
              const statusConf = statusConfig[item.status] || statusConfig.draft;
              const StatusIcon = statusConf.icon;
              const isProcessing = processingId === item.id;
              
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* 头部：优先级 + 状态 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColors[item.priority] || priorityColors.B}`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.source}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${statusConf.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* 标题 */}
                  <h3 className="text-base font-bold mb-2">{item.title}</h3>
                  
                  {/* 摘要 */}
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {item.summary}
                  </p>
                  
                  {/* 拒绝原因（如果有） */}
                  {item.status === 'rejected' && item.reject_reason && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm text-red-600">
                      拒绝原因：{item.reject_reason}
                    </div>
                  )}
                  
                  {/* 底部操作栏 */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-3">
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        查看原文
                      </a>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    
                    {(item.status === 'draft' || item.status === 'pending') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          拒绝
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'approve')}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isProcessing ? '处理中...' : '发布'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
