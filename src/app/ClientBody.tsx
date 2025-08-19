"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  // 如果是管理后台路径，不显示主站导航
  const isAdminPath = pathname?.startsWith('/htgl');

  return (
    <div className="antialiased">
      {!isAdminPath && <Navigation />}
      {children}
    </div>
  );
}
