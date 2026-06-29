"use client";

import { useState, useEffect } from "react";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";
import { getSidebarCollapsed } from "@/lib/tenant-store";
import { SessionProvider } from "@/lib/session";

export function AppShell({ children }: { children: React.ReactNode }) {
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
    // SessionProvider: 보호된 페이지에서 useSession()이 동작하도록 전역 마운트.
    // login/signup 페이지에도 자체적으로 SessionProvider가 있지만 거기선 페이지 단위로만 필요.
    // AppShell에 두면 SidebarUserMenu 같은 layout 컴포넌트가 user/tenant에 접근 가능.
    <SessionProvider>
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
    </SessionProvider>
  );
}
