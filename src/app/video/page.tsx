'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  Calendar,
  Eye,
  FileText,
  EyeOff,
  Menu
} from 'lucide-react';
import type { NewsItem } from '@/lib/supabase';
import './video.css';

interface ExtendedNewsItem extends NewsItem {
  core_facts?: string[];
  key_data?: string[];
}

type ViewMode = 'summary' | 'detail';

const priorityConfig = {
  SSS: { label: 'SSS', bgColor: 'bg-amber-500', textColor: 'text-amber-950' },
  SS: { label: 'SS', bgColor: 'bg-pink-500', textColor: 'text-pink-950' },
  S: { label: 'S', bgColor: 'bg-emerald-500', textColor: 'text-emerald-950' },
  A: { label: 'A', bgColor: 'bg-blue-500', textColor: 'text-blue-950' },
  B: { label: 'B', bgColor: 'bg-gray-500', textColor: 'text-gray-950' },
};

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 ' + weekdays[date.getDay()];
}

function VideoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [allNews, setAllNews] = useState<ExtendedNewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [displayedDate, setDisplayedDate] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentNews = allNews[currentIndex];
  const totalNews = allNews.length;
  
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/news?type=daily&sort=priority&limit=10')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const newsData = data.data as ExtendedNewsItem[];
          setAllNews(newsData);
          
          const urlIndex = searchParams.get('index');
          if (urlIndex) {
            const idx = parseInt(urlIndex) - 1;
            if (idx >= 0 && idx < newsData.length) {
              setCurrentIndex(idx);
            }
          }
          
          const urlDate = searchParams.get('date');
          setDisplayedDate(urlDate || new Date().toISOString().split('T')[0]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
        setIsLoading(false);
      });
  }, [searchParams]);
  
  const updateUrlParams = useCallback((index: number) => {
    const params = new URLSearchParams();
    if (displayedDate) params.set('date', displayedDate);
    params.set('index', String(index + 1));
    router.push('/video?' + params.toString(), { scroll: false });
  }, [displayedDate, router]);
  
  const goToNext = useCallback(() => {
    if (isAnimating || currentIndex >= totalNews - 1) return;
    
    setIsAnimating(true);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      updateUrlParams(currentIndex + 1);
      setIsAnimating(false);
      
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  }, [currentIndex, totalNews, isAnimating, updateUrlParams]);
  
  const goToPrev = useCallback(() => {
    if (isAnimating || currentIndex <= 0) return;
    
    setIsAnimating(true);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      updateUrlParams(currentIndex - 1);
      setIsAnimating(false);
      
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  }, [currentIndex, isAnimating, updateUrlParams]);
  
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
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);
  
  const getPriorityStyle = (priority: string) => {
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.B;
  };
  
  const newsNumber = String(currentIndex + 1).padStart(2, '0');
  
  if (isLoading) {
    return (
      <div className="video-page">
        <div className="video-container">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-emerald-800">
              <div className="animate-pulse mb-2 text-xl font-medium">加载中...</div>
              <div className="text-sm text-emerald-600">正在准备视频素材</div>
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
              <p className="text-xl text-emerald-800 mb-4">暂无数据</p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const priority = getPriorityStyle(currentNews.priority);
  
  return (
    <div className="video-page">
      <div className="petals-container">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="petal"
            style={{
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: (10 + Math.random() * 8) + 's',
            }}
          />
        ))}
      </div>
      
      <div className="video-container">
        <header className={'video-navbar ' + (isNavbarHidden ? 'hidden' : '')}>
          <div className="navbar-content">
            <Link href="/" className="nav-link nav-home">
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>
            
            <div className="nav-center">
              <span className="nav-date flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {displayedDate ? formatDateDisplay(displayedDate) : formatDateDisplay(new Date().toISOString())}
              </span>
              <span className="nav-progress">
                第 <span className="font-bold text-primary">{currentIndex + 1}</span> / <span className="font-bold">{totalNews}</span> 条
              </span>
            </div>
            
            <div className="nav-right">
              <button
                onClick={() => setViewMode('summary')}
                className={'nav-view-btn ' + (viewMode === 'summary' ? 'active' : '')}
                title="摘要模式 (V)"
              >
                <Eye className="w-4 h-4" />
                <span>摘要</span>
              </button>
              <button
                onClick={() => setViewMode('detail')}
                className={'nav-view-btn ' + (viewMode === 'detail' ? 'active' : '')}
                title="详情模式 (V)"
              >
                <FileText className="w-4 h-4" />
                <span>详情</span>
              </button>
              <button
                onClick={() => setIsNavbarHidden(true)}
                className="nav-icon-btn"
                title="隐藏导航栏 (H)"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {isNavbarHidden && (
            <button
              onClick={() => setIsNavbarHidden(false)}
              className="show-navbar-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </header>
        
        <button
          onClick={goToPrev}
          disabled={currentIndex <= 0}
          className="nav-arrow nav-arrow-left"
          title="上一条 (←)"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <button
          onClick={goToNext}
          disabled={currentIndex >= totalNews - 1}
          className="nav-arrow nav-arrow-right"
          title="下一条 (→)"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        
        <main className={'video-main ' + (isTransitioning ? 'transitioning' : '')}>
          <div className="avatar-section">
            <div className="avatar-container">
              <Image
                src="/images/avatar-green.jpg"
                alt="绿"
                width={100}
                height={100}
                className="avatar-image"
              />
            </div>
            <div className="avatar-label">
              <span className="avatar-name">新叶早报</span>
            </div>
          </div>
          
          <div className="content-section">
            {viewMode === 'summary' && (
              <div className="summary-card animate-fade-in">
                <div className="summary-header">
                  <span className="summary-number">{newsNumber}</span>
                  <span className={'priority-badge ' + priority.bgColor + ' ' + priority.textColor}>
                    {priority.label}
                  </span>
                </div>
                
                <div className="summary-divider" />
                
                <h1 className="summary-title">{currentNews.title}</h1>
                <p className="summary-text">{currentNews.summary}</p>
                
                <div className="summary-meta">
                  <span className="meta-source">📰 {currentNews.source}</span>
                  <span className="meta-category">{currentNews.category}</span>
                </div>
              </div>
            )}
            
            {viewMode === 'detail' && (
              <div className="detail-card animate-fade-in">
                <div className="detail-header">
                  <span className="detail-number">{newsNumber}</span>
                  <span className={'priority-badge ' + priority.bgColor + ' ' + priority.textColor}>
                    {priority.label}
                  </span>
                </div>
                
                <div className="detail-divider" />
                
                <h1 className="detail-title">{currentNews.title}</h1>
                
                <div className="detail-meta">
                  <span className="meta-source">📰 {currentNews.source}</span>
                  <span className="meta-category">{currentNews.category}</span>
                </div>
                
                <section className="detail-section">
                  <h2 className="section-title">
                    <span className="section-icon">📌</span>
                    核心事实
                  </h2>
                  <ul className="section-list">
                    {currentNews.core_facts?.map((fact, idx) => (
                      <li key={idx} className="section-item">
                        <span className="item-bullet" />
                        {fact}
                      </li>
                    ))}
                  </ul>
                </section>
                
                <section className="detail-section">
                  <h2 className="section-title">
                    <span className="section-icon">📊</span>
                    关键数据
                  </h2>
                  <ul className="section-list">
                    {currentNews.key_data?.map((data, idx) => (
                      <li key={idx} className="section-item">
                        <span className="item-bullet text-primary">·</span>
                        {data}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </div>
        </main>
        
        <footer className={'video-footer ' + (isNavbarHidden ? 'hidden' : '')}>
          <div className="footer-content">
            <span className="footer-title truncate flex-1 mr-4">
              {currentNews.title}
            </span>
            <div className="footer-brand">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-300">
                <Image
                  src="/images/avatar-green.jpg"
                  alt="绿"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium">🌿 新叶AI</span>
            </div>
          </div>
        </footer>
        
        <div className={'shortcuts-hint ' + (isNavbarHidden ? 'hidden' : '')}>
          <span>← → 切换</span>
          <span>V 切换视图</span>
          <span>H 隐藏导航</span>
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
            <div className="text-center text-emerald-800">
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
