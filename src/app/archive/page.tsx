'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, Calendar, ChevronRight, FileText, Star } from 'lucide-react';

// Mock归档数据
const archiveData = [
  {
    type: 'weekly',
    title: '第52周资讯汇总',
    period: '2025年12月23日 - 12月29日',
    summary: '本周AI圈重磅消息频出，GPT-5发布、Google开源Gemma 3、Claude 4登场。',
    highlightCount: 28,
    link: '#',
  },
  {
    type: 'weekly',
    title: '第51周资讯汇总',
    period: '2025年12月16日 - 12月22日',
    summary: 'Llama 4多模态版本发布、Mistral Large 2上下文窗口达256K。',
    highlightCount: 24,
    link: '#',
  },
  {
    type: 'weekly',
    title: '第50周资讯汇总',
    period: '2025年12月9日 - 12月15日',
    summary: '百度文心4.0 Turbo发布、阿里开源Qwen2.5系列72B旗舰版本。',
    highlightCount: 31,
    link: '#',
  },
  {
    type: 'monthly',
    title: '2025年12月月报',
    period: '2025年12月1日 - 12月31日',
    summary: '本月AI领域迎来多款重磅模型发布，包括GPT-5、Claude 4、Gemma 3、Llama 4等。',
    highlightCount: 126,
    link: '#',
  },
  {
    type: 'monthly',
    title: '2025年11月月报',
    period: '2025年11月1日 - 11月30日',
    summary: '11月是开源大模型爆发月，Qwen2.5、Llama 3.2相继发布，多模态能力成为焦点。',
    highlightCount: 98,
    link: '#',
  },
  {
    type: 'monthly',
    title: '2025年10月月报',
    period: '2025年10月1日 - 10月31日',
    summary: '秋季AI热潮来临，OpenAI开发者大会发布多项新功能，Anthropic获得新一轮融资。',
    highlightCount: 85,
    link: '#',
  },
];

type FilterType = 'all' | 'weekly' | 'monthly';

export default function ArchivePage() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const filteredData = filter === 'all' 
    ? archiveData 
    : archiveData.filter(item => item.type === filter);
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* 页面标题 */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 mb-6">
          <Archive className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          周报月报归档
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          浏览历史资讯汇总，按时间线回顾AI领域的重要发展
        </p>
      </header>
      
      {/* 筛选器 */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { value: 'all', label: '全部' },
          { value: 'weekly', label: '周报' },
          { value: 'monthly', label: '月报' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as FilterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === item.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      
      {/* 时间线 */}
      <div className="timeline">
        {filteredData.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-date flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {item.period}
            </div>
            
            <article className="glass-card-enhanced p-5 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* 类型标签 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.type === 'weekly' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                    }`}>
                      {item.type === 'weekly' ? (
                        <>
                          <FileText className="w-3 h-3" />
                          周报
                        </>
                      ) : (
                        <>
                          <Star className="w-3 h-3" />
                          月报
                        </>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      收录 {item.highlightCount} 条资讯
                    </span>
                  </div>
                  
                  {/* 标题 */}
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {item.title}
                  </h3>
                  
                  {/* 摘要 */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                </div>
                
                {/* 箭头 */}
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
              </div>
            </article>
          </div>
        ))}
      </div>
      
      {/* 底部提示 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          归档数据持续更新中 · 更多历史数据即将上线
        </p>
      </div>
    </div>
  );
}
