"use client";

/**
 * app/console/layout.tsx — 운영자 super-admin 레이아웃
 *
 * AppShell 과 분리 — 좌측 사이드바 (tenant 관리 / billing / audit) + 상단 운영자 헤더
 */

import Link from "next/link";
import { Building2, Globe, CreditCard, FileText, Shield, Server } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/console", label: "대시보드", icon: Server, exact: true },
  { href: "/console/tenants", label: "센터 관리", icon: Building2 },
  { href: "/console/domains", label: "도메인 관리", icon: Globe },
  { href: "/console/billing", label: "요금제/결제", icon: CreditCard },
  { href: "/console/audit", label: "감사 이력", icon: Shield },
];

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 상단 헤더 */}
      <header className="bg-slate-900 text-white border-b border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Officex Console</span>
            <span className="text-[10px] text-slate-400 ml-1 px-1.5 py-0.5 bg-slate-800 rounded">SUPER-ADMIN</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Link href="/" className="hover:text-white transition">업무포털로</Link>
            <span className="text-slate-600">|</span>
            <span>운영자 (owner)</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 좌측 사이드바 */}
        <aside className="w-56 bg-white border-r border-slate-200 min-h-[calc(100vh-49px)]">
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition",
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-3 mx-3 mt-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-[11px] text-amber-900 font-medium">⚠️ 운영자 영역</p>
            <p className="text-[10px] text-amber-700 mt-1">모든 작업은 감사 로그에 기록됩니다.</p>
          </div>
        </aside>

        {/* 메인 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}