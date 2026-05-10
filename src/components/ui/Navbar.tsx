'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Archive, Info, Video, FileText, History, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/history', label: '历史', icon: History },
  { href: '/rankings', label: '榜单', icon: BarChart3 },
  { href: '/video', label: '视频', icon: Video },
  { href: '/report', label: '日报', icon: FileText },
  { href: '/about', label: '关于', icon: Info },
];

// 管理员入口（不在主导航显示，通过特定方式访问）
const adminPath = '/admin/dashboard';

export function Navbar() {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-50">
      {/* 毛玻璃背景导航栏 - 增强版 */}
      <nav className="navbar-glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo区域 - 圆形头像+文字 */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="navbar-avatar-container">
                <Image
                  src="/images/avatar-green.jpg"
                  alt="新叶AI Logo"
                  width={36}
                  height={36}
                  className="navbar-avatar"
                />
                <div className="navbar-avatar-glow" />
              </div>
              <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                新叶AI
              </span>
            </Link>
            
            {/* 导航链接 - 桌面端增强版 */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link-enhanced px-4 py-2 rounded-lg ${
                      isActive ? 'nav-link-active-enhanced font-medium' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {/* 主题切换 + 管理员入口 */}
            <div className="flex items-center gap-2">
              <Link
                href={adminPath}
                className={`p-2 rounded-lg transition-colors ${
                  pathname === adminPath
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                title="管理后台"
              >
                <Shield className="w-5 h-5" />
              </Link>
              <ThemeToggle />
            </div>
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
