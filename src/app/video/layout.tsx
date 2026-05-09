import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新叶早报 - 新叶AI",
  description: "新叶AI早报视频录制页面",
};

export default function VideoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="video-page-body">
        {children}
      </body>
    </html>
  );
}
