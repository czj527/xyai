'use client';

import { useEffect, useMemo, useState } from 'react';

// 春季emoji - 增加更多选择
const SPRING_EMOJIS = ['🌸', '🌿', '🌱', '🦋', '🌷', '💮', '🌻', '🍃'];

// 粒子数量（性能优先）
const PARTICLE_COUNT = 10;

// 确定性伪随机（基于索引）
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Particle {
  id: number;
  left: string;
  fontSize: number;
  opacity: number;
  duration: string;
  delay: string;
  emoji: string;
}

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r1 = seededRandom(i * 4 + 0); // left
    const r2 = seededRandom(i * 4 + 1); // fontSize
    const r3 = seededRandom(i * 4 + 2); // opacity
    const r4 = seededRandom(i * 4 + 3); // duration/delay
    
    particles.push({
      id: i,
      left: `${r1 * 95}%`,
      fontSize: 16 + r2 * 12,
      opacity: 0.3 + r3 * 0.3, // 浅色模式透明度更低
      duration: `${12 + r4 * 10}s`,
      delay: `${-r1 * 18}s`,
      emoji: SPRING_EMOJIS[Math.floor(r2 * SPRING_EMOJIS.length)],
    });
  }
  
  return particles;
}

interface SpringParticlesProps {
  /** 是否启用 */
  enabled?: boolean;
}

export function SpringParticles({ enabled = true }: SpringParticlesProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // 检测深色模式 - 检查多个来源确保准确
    const checkDarkMode = () => {
      const isDarkClass = document.documentElement.classList.contains('dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDarkClass || prefersDark;
    };
    
    setIsDark(checkDarkMode());
    
    // 监听 media query 变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // 只有当用户没有手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem('xyai-theme');
      if (!savedTheme) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handler);
    
    // 监听 html class 的 dark 变化
    const observer = new MutationObserver(() => {
      const savedTheme = localStorage.getItem('xyai-theme');
      if (!savedTheme) {
        setIsDark(checkDarkMode());
      } else {
        setIsDark(savedTheme === 'dark');
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
      observer.disconnect();
    };
  }, []);
  
  // 生成粒子（确定性，只在首次生成）
  const particles = useMemo(() => generateParticles(), []);
  
  // SSR 或 未启用 时不渲染
  if (!mounted || !enabled) {
    return null;
  }
  
  // 根据主题调整透明度
  const baseOpacity = isDark ? 0.7 : 0.4;
  
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={`spring-particle-${p.id}`}
          className="spring-particle"
          style={{
            left: p.left,
            fontSize: `${p.fontSize}px`,
            '--sp-opacity': Math.min(p.opacity * baseOpacity, 0.8),
            '--sp-duration': p.duration,
            '--sp-delay': p.delay,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export default SpringParticles;
