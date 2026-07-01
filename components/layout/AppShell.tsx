"use client";

import { useState, useEffect, type ReactNode } from "react";
import { CustomProvider } from "rsuite";
import koKR from "rsuite/locales/ko_KR";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";
import { ExecSidebar } from "./ExecSidebar";
import { getSidebarCollapsed } from "@/lib/store";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/auth/useRole";

/**
 * AppShell + rsuite <CustomProvider>로 전체 감싸기.
 *
 * CustomProvider가 있어야:
 *  - useToaster() 가 정상 동작 (없으면 "Feature is disabled" 경고)
 *  - DatePicker / Toggle / CheckPicker 등 hook 의존 컴포넌트 정상
 *  - locale 적용 (한국어)
 */
export function AppShell({
  children,
  mainClassName,
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const role = useRole();

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

  const isExec = role === "exec";

  return (
    <CustomProvider locale={koKR}>
      <ToastProvider>
        <TopHeader />
        <div className="pt-[60px] min-h-screen flex">
          {isExec ? <ExecSidebar /> : <Sidebar />}
          <main
            className={cn(
              "flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 min-w-0 transition-[margin] duration-200",
              mainClassName,
            )}
            style={{ marginLeft: isExec ? 220 : collapsed ? 64 : 220 }}
          >
            {children}
          </main>
        </div>
      </ToastProvider>
    </CustomProvider>
  );
}
