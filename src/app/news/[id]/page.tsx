import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, ExternalLink, Calendar } from 'lucide-react';
import { mockNews } from '@/lib/mockData';

// 生成静态路径（Mock数据）
export function generateStaticParams() {
  return mockNews.map((news) => ({
    id: news.id,
  }));
}

// 优先级配置
const priorityConfig = {
  SSS: { label: 'SSS级', className: 'priority-sss', icon: '🔥' },
  SS: { label: 'SS级', className: 'priority-ss', icon: '⭐' },
  S: { label: 'S级', className: 'priority-s', icon: '✨' },
  A: { label: 'A级', className: 'priority-a', icon: '📌' },
  B: { label: 'B级', className: 'priority-b', icon: '📎' },
};

// 格式化时间
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // 查找新闻（Mock数据）
  const news = mockNews.find((n) => n.id === id);
  
  if (!news) {
    notFound();
  }
  
  const priority = priorityConfig[news.priority] || priorityConfig.B;
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* 返回按钮 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回资讯列表</span>
      </Link>
      
      {/* 文章卡片 */}
      <article className="glass-card p-6 sm:p-8">
        {/* 头部信息 */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${priority.className}`}>
            {priority.icon} {priority.label}
          </span>
          <span className="source-badge">
            {news.source}
          </span>
          <span className="px-2 py-0.5 bg-accent rounded text-sm text-accent-foreground">
            {news.category}
          </span>
        </div>
        
        {/* 标题 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
          {news.title}
        </h1>
        
        {/* 元信息 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border/50">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(news.published_at)}
          </span>
        </div>
        
        {/* 正文摘要 */}
        <div className="prose prose-green max-w-none">
          <p className="text-lg leading-relaxed text-foreground/90">
            {news.summary}
          </p>
          
          {/* 完整内容提示 */}
          <div className="mt-8 p-6 bg-accent/50 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground">
              这是一篇由新叶AI采集并摘要的资讯。要阅读完整内容，请点击下方原文链接访问原始来源。
            </p>
          </div>
        </div>
        
        {/* 原文链接 */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <a
            href={news.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <span>阅读原文</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </article>
      
      {/* 底部导航 */}
      <div className="mt-8 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首页</span>
        </Link>
      </div>
    </div>
  );
}
