"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ConditionalAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 如果是管理后台路径，不使用主站的AuthProvider
  const isAdminPath = pathname?.startsWith('/htgl');

  if (isAdminPath) {
    // 管理后台直接返回children，不包装AuthProvider
    return <>{children}</>;
  }

  // 主站使用AuthProvider
  return <AuthProvider>{children}</AuthProvider>;
}