"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Palmtree, CalendarCheck, CalendarRange, Building2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";

// ─── 메뉴 노드 ─────────────────────────────────────────
type MenuNode =
  | { kind: "header"; label: string }
  | { kind: "item"; label: string; href: string; adminOnly?: boolean; badge?: number };

const SIDEBAR_MENU: MenuNode[] = [
  // ── 내 휴가 ──────────────────────────────
  { kind: "header", label: "내 휴가" },
  { kind: "item", label: "휴가현황",   href: "/leave" },
  { kind: "item", label: "연차내역",   href: "/leave/annual" },
  { kind: "item", label: "휴가 통계",   href: "/leave/stats" },

  // ── 전사 휴가관리 (admin only) ─────────
  { kind: "header", label: "전사 휴가관리" },
  { kind: "item", label: "전사 휴가현황", href: "/leave/company", adminOnly: true },
];

// ─── LeaveSidebar ──────────────────────────────────────
interface LeaveSidebarProps {
  /** 현재 선택된 경로 (子경로 highlight) */
  currentPath?: string;
}

export function LeaveSidebar({ currentPath }: LeaveSidebarProps) {
  const pathname = usePathname() ?? currentPath ?? "";
  const { user } = useSession();
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden h-fit sticky top-[80px] w-[240px] shrink-0">
      {/* 헤더 + CTA */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Palmtree className="w-4 h-4 text-brand-600" />
        <h2 className="text-sm font-bold text-slate-900 m-0">휴가</h2>
        <Link
          href="/leave/apply"
          className="ml-auto flex items-center gap-1.5 h-7 px-3 rounded-lg bg-brand-600 text-white text-[12px] font-bold hover:bg-brand-700 transition shadow-sm"
        >
          <Plus className="w-3 h-3" />
          휴가 신청
        </Link>
      </div>

      <nav className="py-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {SIDEBAR_MENU.map((node, i) => {
          if (node.kind === "header") {
            return (
              <div key={i} className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {node.label}
              </div>
            );
          }
          // admin-only 항목: 권한 없으면 숨김
          if (node.adminOnly && !isAdmin) return null;

          const active = isActive(node.href);
          return (
            <Link
              key={node.href}
              href={node.href}
              className={cn(
                "w-full flex items-center gap-2 h-8 pl-9 pr-3 text-[12.5px] transition relative",
                active
                  ? "text-brand-700 font-semibold bg-brand-50/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {active && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-3 bg-brand-600 rounded-full" />
              )}
              <span className="flex-1 text-left truncate">{node.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
