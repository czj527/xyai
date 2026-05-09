'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Info, 
  Leaf, 
  Video, 
  Heart, 
  ExternalLink,
  Sparkles,
  Zap,
  Users,
  Code,
  Rocket
} from 'lucide-react';

export default function AboutPage() {
  const [showAvatarGlow, setShowAvatarGlow] = useState(true);
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* 项目介绍 */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden mb-6 shadow-lg shadow-green-500/30 border-2 border-green-400/30">
            <Image src="/images/avatar-green.jpg" alt="绿" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            关于新叶AI
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            新叶AI是一个AI资讯聚合网站，致力于为AI从业者和爱好者提供
            最新、最有价值的行业资讯。每天自动更新，帮助你紧跟AI发展前沿。
          </p>
        </div>
        
        {/* 特色标签 */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {[
            { icon: Rocket, text: '全新上线' },
            { icon: Sparkles, text: '持续进化中' },
            { icon: Zap, text: '每日更新' },
          ].map((item, i) => (
            <span 
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-sm font-medium"
            >
              <item.icon className="w-4 h-4" />
              {item.text}
            </span>
          ))}
        </div>
      </section>
      
      {/* 绿的角色介绍 */}
      <section className="glass-card-enhanced p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* 头像 - 使用真实头像图片 */}
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => setShowAvatarGlow(!showAvatarGlow)}
            title="点击切换光晕效果"
          >
            <div className={`relative ${showAvatarGlow ? 'avatar-glow' : ''}`}>
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <Image 
                  src="/images/avatar-green.jpg" 
                  alt="绿的头像"
                  width={128}
                  height={128}
                  className="object-cover"
                  onError={() => {
                    // 如果图片加载失败，使用emoji
                    const img = document.querySelector('img[alt="绿的头像"]');
                    if (img) {
                      (img as HTMLImageElement).style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) parent.innerHTML = '<span class="text-6xl">🌿</span>';
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* 文字介绍 */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <h2 className="text-xl font-bold text-foreground">
                看板娘：绿（Midori）
              </h2>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-full text-xs font-medium">
                AI助手
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              新叶AI的AI资讯播音员 · 每天准备最新素材
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-accent/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-1.5">性格特点</h3>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• 元气满满、乐观积极</li>
                  <li>• 信息敏感度高</li>
                  <li>• 善于提炼重点</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-1.5">口头禅</h3>
                <p className="text-muted-foreground italic">
                  「今天的AI圈又有大事了！」
                </p>
                <p className="text-muted-foreground italic mt-1">
                  「这条资讯一定要看哦~」
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 视频品牌 */}
      <section className="glass-card-enhanced p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/30">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">
              视频品牌：新叶早报
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              在B站、小红书等视频平台发布AI资讯视频，每天3-4分钟，
              快速了解AI圈大事，轻松掌握行业动态。
            </p>
            <div className="flex flex-wrap gap-2">
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 rounded-full text-sm font-medium hover:bg-pink-200 dark:hover:bg-pink-800/50 transition-colors"
              >
                <span>视频平台</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
              >
                <span>社交媒体</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* 技术栈 */}
      <section className="glass-card-enhanced p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          技术栈
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { name: 'Next.js 16', color: 'bg-black/10 dark:bg-white/10' },
            { name: 'TypeScript', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
            { name: 'Tailwind CSS', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' },
            { name: 'Supabase', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
            { name: 'Vercel', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
          ].map((tech) => (
            <span
              key={tech.name}
              className={`px-3 py-1 rounded-full text-sm font-medium ${tech.color}`}
            >
              {tech.name}
            </span>
          ))}
        </div>
        
        {/* 开源信息 */}
        <div className="p-4 bg-accent/50 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-medium text-foreground mb-1">开源项目</h3>
              <p className="text-sm text-muted-foreground">
                本网站代码已开源，欢迎Star和贡献
              </p>
            </div>
            <a
              href="https://github.com/czj527/xyai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#24292e] text-white rounded-lg hover:bg-[#1b1f23] transition-colors font-medium"
            >
              <Code className="w-5 h-5" />
              <span>GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
      
      {/* 致谢 */}
      <section className="text-center py-6 border-t border-border/50">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
          用
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          和
          <Leaf className="w-4 h-4 text-green-500" />
          打造
        </p>
        <p className="text-xs text-muted-foreground/70 mt-2">
          © 2026 新叶AI · 专注于AI资讯聚合
        </p>
      </section>
    </div>
  );
}
