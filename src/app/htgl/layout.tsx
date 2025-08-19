import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BuildBridge - 管理后台",
  description: "BuildBridge管理员后台系统",
};

export default function HtglLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 不包含主站的Navigation，完全独立的布局
    <div className="antialiased">
      {children}
    </div>
  );
}