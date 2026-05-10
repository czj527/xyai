'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  published_at: string;
}

interface ReportSummary {
  date: string;
  news_count: number;
  top_news: NewsItem[];
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 格式化周几
function getWeekday(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[date.getDay()];
}

// 获取本周日期范围
function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek + 1); // 周一
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // 周日
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// 获取上周日期范围
function getLastWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const end = new Date(now);
  end.setDate(now.getDate() - dayOfWeek); // 上周日
  const start = new Date(end);
  start.setDate(end.getDate() - 6); // 上周一
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// 获取上月日期范围
function getLastMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// 每日报告卡片
function DailyReportCard({ report }: { report: ReportSummary }) {
  return (
    <Link href={`/report?date=${report.date}`} className="block group">
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-foreground">
              {formatDate(report.date)}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              {getWeekday(report.date)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            {report.news_count} 条
          </span>
        </div>
        
        <div className="space-y-2">
          {report.top_news.slice(0, 3).map((news, idx) => (
            <div key={news.id} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground mt-1">{idx + 1}.</span>
              <span className="text-sm text-foreground line-clamp-1">{news.title}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/30">
          <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            查看详情
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const [weeklyReports, setWeeklyReports] = useState<ReportSummary[]>([]);
  const [lastWeekReports, setLastWeekReports] = useState<ReportSummary[]>([]);
  const [lastMonthReports, setLastMonthReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    
    // 获取历史数据
    fetch('/api/news/history')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setWeeklyReports(data.data.this_week || []);
          setLastWeekReports(data.data.last_week || []);
          setLastMonthReports(data.data.last_month || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch history:', err);
        setLoading(false);
      });
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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
            📚 历史数据
          </h1>
          <p className="text-muted-foreground">
            查看本周、上周和上月的 AI 资讯汇总
          </p>
        </div>
        
        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        {/* 本周数据 */}
        {!loading && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">本周资讯</h2>
                <p className="text-sm text-muted-foreground">
                  {getWeekRange().start} ~ {getWeekRange().end}
                </p>
              </div>
            </div>
            
            {weeklyReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyReports.map(report => (
                  <DailyReportCard key={report.date} report={report} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无本周数据
              </div>
            )}
          </section>
        )}
        
        {/* 上周数据 */}
        {!loading && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">上周总结</h2>
                <p className="text-sm text-muted-foreground">
                  {getLastWeekRange().start} ~ {getLastWeekRange().end}
                </p>
              </div>
            </div>
            
            {lastWeekReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lastWeekReports.map(report => (
                  <DailyReportCard key={report.date} report={report} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无上周数据
              </div>
            )}
          </section>
        )}
        
        {/* 上月数据 */}
        {!loading && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">上月总结</h2>
                <p className="text-sm text-muted-foreground">
                  {getLastMonthRange().start} ~ {getLastMonthRange().end}
                </p>
              </div>
            </div>
            
            {lastMonthReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lastMonthReports.map(report => (
                  <DailyReportCard key={report.date} report={report} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无上月数据
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
