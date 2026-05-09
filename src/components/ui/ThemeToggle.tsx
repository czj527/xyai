'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // 初始化主题状态
    const savedTheme = localStorage.getItem('xyai-theme') as Theme | null;
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(savedTheme || (isDark ? 'dark' : 'light'));
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('xyai-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // SSR 阶段返回占位
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="切换主题"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-accent transition-colors"
      aria-label={`切换到${theme === 'light' ? '深色' : '浅色'}模式`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-foreground" />
      ) : (
        <Sun className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
}

export default ThemeToggle;
