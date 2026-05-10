import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";

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
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
