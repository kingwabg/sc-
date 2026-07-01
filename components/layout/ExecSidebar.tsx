"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Calculator,
  BarChart3,
  FileSearch,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { label: "대시보드",    href: "/exec/dashboard",         icon: LayoutDashboard },
  { label: "수입 (후원금)", href: "/exec/accounting/donations", icon: TrendingUp },
  { label: "지출 관리",    href: "/exec/accounting/expenses",   icon: Receipt },
  { label: "예산 관리",    href: "/exec/accounting/budget",     icon: Calculator },
  { label: "월별 결산",    href: "/exec/accounting/settlement",  icon: BarChart3 },
  { label: "감사 이력",    href: "/exec/audit-trail",            icon: FileSearch },
];

export function ExecSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-[60px] left-0 bottom-0 w-[220px] bg-slate-900 text-white flex flex-col py-4 transition-[width] duration-200">
      {/* 헤더 */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-white">임원 포털</span>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-400">회계 · 예산 · 감사</p>
      </div>

      {/* 구분선 */}
      <div className="mx-4 border-t border-slate-700 mb-4" />

      {/* 메뉴 */}
      <nav className="flex-1 px-2 space-y-0.5">
        {MENU_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-lg text-[13.5px] font-medium transition",
                isActive
                  ? "bg-amber-500/20 text-amber-300"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0",
                  isActive ? "text-amber-400" : "text-slate-500",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 하단 정보 */}
      <div className="px-4 py-3 border-t border-slate-700 mt-2">
        <p className="text-[11px] text-slate-500">회계연도 2026</p>
        <p className="text-[11px] text-slate-500">양산가족친화기업</p>
      </div>
    </aside>
  );
}
