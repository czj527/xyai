'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/ui/Navbar";
import { SpringParticles } from "@/components/effects/SpringParticles";
import { GreenChatbot } from "@/components/ui/GreenChatbot";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isVideoPage = pathname?.startsWith('/video');
  
  return (
    <>
      {/* 春季粒子飘落效果 - 视频页不显示 */}
      {!isVideoPage && <SpringParticles />}
      
      {/* 导航栏 - 视频页不显示 */}
      {!isVideoPage && <Navbar />}
      
      {/* 主内容区 */}
      <main className={`flex-1 relative z-10 ${isVideoPage ? '' : 'pb-20 md:pb-0'}`}>
        {children}
      </main>
      
      {/* AI 对话助手 - 视频页不显示 */}
      {!isVideoPage && <GreenChatbot />}
    </>
  );
}
