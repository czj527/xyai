'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Eye,
  FileText,
  EyeOff,
  Menu,
  Download,
  Home
} from 'lucide-react';
import type { NewsItem } from '@/lib/supabase';
import './video.css';

interface ExtendedNewsItem extends NewsItem {
  core_facts?: string[];
  key_data?: string[];
}

type ViewMode = 'summary' | 'detail';

const priorityConfig = {
  SSS: { label: 'SSS', bgColor: 'bg-amber-500', textColor: 'text-white' },
  SS: { label: 'SS', bgColor: 'bg-pink-500', textColor: 'text-white' },
  S: { label: 'S', bgColor: 'bg-emerald-500', textColor: 'text-white' },
  A: { label: 'A', bgColor: 'bg-blue-500', textColor: 'text-white' },
  B: { label: 'B', bgColor: 'bg-gray-500', textColor: 'text-white' },
};

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}

function VideoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [allNews, setAllNews] = useState<ExtendedNewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [displayedDate, setDisplayedDate] = useState('');
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentNews = allNews[currentIndex];
  const totalNews = allNews.length;
  
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/news?type=daily&sort=priority&limit=10')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAllNews(data.data as ExtendedNewsItem[]);
          
          const urlIndex = searchParams.get('index');
          if (urlIndex) {
            const idx = parseInt(urlIndex) - 1;
            if (idx >= 0 && idx < data.data.length) {
              setCurrentIndex(idx);
            }
          }
        }
        
        const urlDate = searchParams.get('date');
        setDisplayedDate(urlDate || new Date().toISOString().split('T')[0]);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
        setIsLoading(false);
      });
  }, [searchParams]);
  
  const goToNext = useCallback(() => {
    if (currentIndex < totalNews - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalNews]);
  
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'v' || e.key === 'V') {
        setViewMode(prev => prev === 'summary' ? 'detail' : 'summary');
      } else if (e.key === 'h' || e.key === 'H') {
        setIsNavbarHidden(prev => !prev);
      } else if (e.key === 'Home') {
        e.preventDefault();
        router.push('/');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, router]);
  
  const getPriorityStyle = (priority: string) => {
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.B;
  };
  
  const newsNumber = String(currentIndex + 1).padStart(2, '0');
  
  if (isLoading) {
    return (
      <div className="video-page">
        <div className="video-container">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-pulse mb-2 text-xl font-medium text-slate-600">加载中...</div>
              <div className="text-sm text-slate-400">正在准备视频素材</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentNews || totalNews === 0) {
    return (
      <div className="video-page">
        <div className="video-container">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl text-slate-600 mb-4">暂无数据</p>
              <p className="text-sm text-slate-400">请先采集新闻数据</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const priority = getPriorityStyle(currentNews.priority);
  
  return (
    <div className="video-page">
      {/* 花瓣动画 */}
      <div className="petals-container">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="petal"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>
      
      <div className="video-container">
        {/* 控制栏 */}
        <header className={`video-controls ${isNavbarHidden ? 'hidden' : ''}`}>
          <div className="controls-left">
            <span className="date-display">
              <Calendar className="w-4 h-4" />
              {displayedDate ? formatDateDisplay(displayedDate) : formatDateDisplay(new Date().toISOString())}
            </span>
            <span className="progress-display">
              {currentIndex + 1} / {totalNews}
            </span>
          </div>
          
          <div className="controls-center">
            <button
              onClick={() => setViewMode('summary')}
              className={`view-btn ${viewMode === 'summary' ? 'active' : ''}`}
            >
              <Eye className="w-4 h-4" />
              摘要
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`view-btn ${viewMode === 'detail' ? 'active' : ''}`}
            >
              <FileText className="w-4 h-4" />
              详情
            </button>
          </div>
          
          <div className="controls-right">
            <button
              onClick={() => router.push('/')}
              className="icon-btn"
              title="返回首页"
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsNavbarHidden(true)}
              className="icon-btn"
              title="隐藏控制栏 (H)"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        </header>
        
        {/* 显示控制栏按钮 */}
        {isNavbarHidden && (
          <button
            onClick={() => setIsNavbarHidden(false)}
            className="show-controls-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {/* 导航箭头 */}
        <button
          onClick={goToPrev}
          disabled={currentIndex <= 0}
          className="nav-arrow nav-arrow-left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <button
          onClick={goToNext}
          disabled={currentIndex >= totalNews - 1}
          className="nav-arrow nav-arrow-right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        
        {/* 主内容 */}
        <main className="video-main">
          {/* 头像 */}
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <Image
                src="/images/avatar-green.jpg"
                alt="绿"
                width={80}
                height={80}
                className="avatar-img"
              />
            </div>
            <div className="avatar-label">新叶早报</div>
          </div>
          
          {/* 内容卡片 */}
          <div className="content-card">
            {viewMode === 'summary' ? (
              <div className="summary-view">
                <div className="card-header">
                  <span className="news-number">{newsNumber}</span>
                  <span className={`priority-badge ${priority.bgColor} ${priority.textColor}`}>
                    {priority.label}
                  </span>
                </div>
                
                <div className="card-divider" />
                
                <h1 className="news-title">{currentNews.title}</h1>
                <p className="news-summary">{currentNews.summary}</p>
                
                <div className="news-meta">
                  <span className="meta-source">📰 {currentNews.source}</span>
                  <span className="meta-category">{currentNews.category}</span>
                </div>
              </div>
            ) : (
              <div className="detail-view">
                <div className="card-header">
                  <span className="news-number">{newsNumber}</span>
                  <span className={`priority-badge ${priority.bgColor} ${priority.textColor}`}>
                    {priority.label}
                  </span>
                </div>
                
                <div className="card-divider" />
                
                <h1 className="news-title">{currentNews.title}</h1>
                
                <div className="news-meta">
                  <span className="meta-source">📰 {currentNews.source}</span>
                  <span className="meta-category">{currentNews.category}</span>
                </div>
                
                {currentNews.core_facts && currentNews.core_facts.length > 0 && (
                  <div className="detail-section">
                    <h2 className="section-title">📌 核心事实</h2>
                    <ul className="section-list">
                      {currentNews.core_facts.map((fact, idx) => (
                        <li key={idx} className="section-item">{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {currentNews.key_data && currentNews.key_data.length > 0 && (
                  <div className="detail-section">
                    <h2 className="section-title">📊 关键数据</h2>
                    <ul className="section-list">
                      {currentNews.key_data.map((data, idx) => (
                        <li key={idx} className="section-item">{data}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        
        {/* 底部信息 */}
        <footer className={`video-footer ${isNavbarHidden ? 'hidden' : ''}`}>
          <div className="footer-content">
            <span className="footer-title">{currentNews.title}</span>
            <div className="footer-brand">
              <Image
                src="/images/avatar-green.jpg"
                alt="绿"
                width={24}
                height={24}
                className="footer-avatar"
              />
              <span>🌿 新叶AI</span>
            </div>
          </div>
        </footer>
        
        {/* 快捷键提示 */}
        <div className={`shortcuts-hint ${isNavbarHidden ? 'hidden' : ''}`}>
          <span>← → 切换</span>
          <span>V 切换视图</span>
          <span>H 隐藏控制栏</span>
          <span>Home 返回首页</span>
        </div>
      </div>
    </div>
  );
}

export default function VideoPage() {
  return (
    <Suspense fallback={
      <div className="video-page">
        <div className="video-container">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-600">
              <div className="animate-pulse mb-2 text-xl font-medium">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    }>
      <VideoPageContent />
    </Suspense>
  );
}
