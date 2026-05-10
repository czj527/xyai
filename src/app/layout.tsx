import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { SpringParticles } from "@/components/effects/SpringParticles";
import { GreenChatbot } from "@/components/ui/GreenChatbot";

export const metadata: Metadata = {
  title: "新叶AI - AI资讯早报",
  description: "新叶AI每日为您播报AI领域最新资讯，包括大模型发布、行业动态、技术突破等。视频品牌：新叶早报。",
  keywords: ["AI", "人工智能", "大模型", "GPT", "Claude", "AI资讯", "AI早报"],
  authors: [{ name: "新叶AI" }],
  openGraph: {
    title: "新叶AI - AI资讯早报",
    description: "每日AI资讯，助您紧跟AI发展前沿",
    type: "website",
    locale: "zh_CN",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {/* 春季粒子飘落效果 */}
        <SpringParticles />
        
        {/* 导航栏 */}
        <Navbar />
        
        {/* 主内容区 */}
        <main className="flex-1 relative z-10 pb-20 md:pb-0">
          {children}
        </main>
        
        {/* AI 对话助手 */}
        <GreenChatbot />
      </body>
    </html>
  );
}
