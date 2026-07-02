"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Calculator,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  LayoutDashboard,
  ReceiptText,
  Settings,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarUserMenu } from "./SidebarUserMenu";

type AccountingNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

const ACCOUNTING_GROUPS: { label: string; items: AccountingNavItem[] }[] = [
  {
    label: "회계",
    items: [
      { label: "회계 대시보드", href: "/accounting", icon: LayoutDashboard },
      { label: "수입 관리", href: "/accounting/income", icon: Banknote },
      { label: "지출 관리", href: "/accounting/expense", icon: WalletCards },
      { label: "통장 입금", href: "/accounting/deposits", icon: Landmark },
    ],
  },
  {
    label: "증빙·마감",
    items: [
      { label: "증빙 자료", href: "/accounting/receipts", icon: ReceiptText, badge: 7 },
      { label: "결산 리포트", href: "/accounting/reports", icon: Calculator },
      { label: "회계 점검", href: "/accounting/checklist", icon: ClipboardCheck, badge: 3 },
    ],
  },
  {
    label: "설정",
    items: [
      { label: "결재 연동", href: "/accounting/approval", icon: FileCheck2 },
      { label: "계정 설정", href: "/accounting/settings", icon: Settings },
    ],
  },
];

export function AccountingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-[60px] left-0 bottom-0 w-[220px] border-r border-slate-200 bg-white flex flex-col py-3">
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 py-1">
        {ACCOUNTING_GROUPS.map((group) => {
          const isGroupActive = group.items.some((item) => isActivePath(pathname, item.href));
          return (
            <div key={group.label} className="mb-4">
              <h3
                className={cn(
                  "mb-1 flex items-center gap-1.5 px-3 text-[11px] font-bold tracking-wide",
                  isGroupActive ? "text-brand-600" : "text-slate-400",
                )}
              >
                {group.label}
                {isGroupActive && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className={cn(
                        "flex h-9 items-center gap-2.5 rounded-lg pl-3 pr-2 text-[13.5px] font-semibold transition",
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                      )}
                    >
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-brand-600" : "text-slate-500")} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="grid min-w-[18px] h-[18px] place-items-center rounded-full bg-red-50 px-1 text-[10px] font-black text-red-600">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mx-3 border-t border-slate-100" />

      <div className="px-2 py-3">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/accounting") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
