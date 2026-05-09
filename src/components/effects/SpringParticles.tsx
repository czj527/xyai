'use client';

import { useEffect, useMemo, useState } from 'react';

// 春季emoji
const SPRING_EMOJIS = ['🌸', '🌿', '🌱', '🦋', '🌷', '💮'];

// 粒子数量（性能优先，少量即可）
const PARTICLE_COUNT = 8;

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
      opacity: 0.4 + r3 * 0.4,
      duration: `${12 + r4 * 10}s`,
      delay: `${-r1 * 18}s`,
      emoji: SPRING_EMOJIS[Math.floor(r2 * SPRING_EMOJIS.length)],
    });
  }
  
  return particles;
}

interface SpringParticlesProps {
  /** 是否启用（深色模式且用户未禁用） */
  enabled?: boolean;
}

export function SpringParticles({ enabled = true }: SpringParticlesProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // 检测深色模式
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    // 监听主题变化
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    // 也监听 html class 的 dark 变化
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
      observer.disconnect();
    };
  }, []);
  
  // 生成粒子（确定性，只在首次生成）
  const particles = useMemo(() => generateParticles(), []);
  
  // SSR 或 未启用 或 浅色模式时不渲染
  if (!mounted || !enabled || !isDark) {
    return null;
  }
  
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
            '--sp-opacity': p.opacity,
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
