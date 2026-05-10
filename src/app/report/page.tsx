'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  ChevronLeft,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface DailyReport {
  date: string;
  headline: string;
  news_count: number;
  categories: Record<string, number>;
  priorities: Record<string, number>;
  markdown: string;
}

export default function ReportPage() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch(`/api/report/daily?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setReport(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch report:', err);
        setLoading(false);
      });
  }, [selectedDate]);
  
  const handleCopy = async () => {
    if (!report?.markdown) return;
    
    try {
      await navigator.clipboard.writeText(report.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleDownload = () => {
    if (!report?.markdown) return;
    
    const blob = new Blob([report.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xyai-report-${selectedDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回首页
          </Link>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            📰 AI 日报
          </h1>
          <p className="text-muted-foreground">
            每日 AI 资讯汇总，支持导出 Markdown 格式
          </p>
        </div>
        
        {/* 日期选择和操作 */}
        <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!report || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制
                </>
              )}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={!report || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              下载 MD
            </button>
          </div>
        </div>
        
        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        {/* 空状态 */}
        {!loading && !report && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">暂无日报数据</p>
            <p className="text-sm text-muted-foreground">
              请先采集新闻数据
            </p>
          </div>
        )}
        
        {/* 日报内容 */}
        {!loading && report && (
          <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm">
                <div className="text-2xl font-bold text-primary">{report.news_count}</div>
                <div className="text-sm text-muted-foreground">资讯总数</div>
              </div>
              
              {Object.entries(report.priorities).map(([priority, count]) => (
                <div key={priority} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm">
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-sm text-muted-foreground">{priority} 级</div>
                </div>
              ))}
            </div>
            
            {/* 分类分布 */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">分类分布</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.categories).map(([category, count]) => (
                  <span 
                    key={category}
                    className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full"
                  >
                    {category} ({count})
                  </span>
                ))}
              </div>
            </div>
            
            {/* Markdown 预览 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-medium text-foreground">日报内容</h3>
                <span className="text-xs text-muted-foreground">
                  {formatDate(selectedDate)}
                </span>
              </div>
              
              <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {report.markdown}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
