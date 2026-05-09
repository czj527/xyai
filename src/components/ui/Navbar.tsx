'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Archive, Info, Leaf } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/rankings', label: '榜单', icon: BarChart3 },
  { href: '/archive', label: '归档', icon: Archive },
  { href: '/about', label: '关于', icon: Info },
];

export function Navbar() {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-50">
      {/* 毛玻璃背景导航栏 */}
      <nav className="glass-card border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                新叶AI
              </span>
            </Link>
            
            {/* 导航链接 - 桌面端 */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link px-4 py-2 rounded-lg ${
                      isActive ? 'nav-link-active font-medium' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {/* 主题切换 */}
            <ThemeToggle />
          </div>
        </div>
      </nav>
      
      {/* 移动端导航 - 底部固定 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
