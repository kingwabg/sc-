"use client";

import { useState, useEffect, type ReactNode } from "react";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";
import { getSidebarCollapsed } from "@/lib/tenant-store";

/**
 * 보호된 페이지의 layout shell.
 *
 * Provider 트리(CustomProvider > ToastProvider > SessionProvider)는
 * app/layout.tsx > app/providers.tsx에서 이미 모든 페이지를 감싸고 있음.
 * 여기서는 shell layout(헤더 + 사이드바 + 메인)만 담당.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const sync = () => setCollapsed(getSidebarCollapsed());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("officex:sidebar-collapsed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("officex:sidebar-collapsed", sync);
    };
  }, []);

  return (
    <>
      <TopHeader />
      <div className="pt-[60px] min-h-screen flex">
        <Sidebar />
        <main
          className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 min-w-0 transition-[margin] duration-200"
          style={{ marginLeft: collapsed ? 64 : 232 }}
        >
          {children}
        </main>
      </div>
    </>
  );
}