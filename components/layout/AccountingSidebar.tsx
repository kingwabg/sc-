"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Calculator,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  IdCard,
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

const HR_TREE = [
  {
    label: "인사",
    icon: IdCard,
    children: [
      {
        label: "인사관리",
        children: [
          { label: "사업장관리", href: "/accounting/hr-workplace" },
          { label: "계정상태관리", href: "/accounting/hr-account-status" },
          { label: "인사발령", href: "/accounting/hr-appointment" },
        ],
      },
      {
        label: "조직관리",
        children: [
          { label: "조직설계", href: "/accounting/org-design" },
          { label: "직위체계", href: "/accounting/org-position" },
          { label: "조직일괄등록", href: "/accounting/org-bulk-register" },
          { label: "조직삭제관리", href: "/accounting/org-delete" },
        ],
      },
      {
        label: "증명서발급",
        children: [
          { label: "증명발급현황", href: "/accounting/certificate-issue-status" },
        ],
      },
    ],
  },
];

export function AccountingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-[60px] left-0 bottom-0 w-[220px] border-r border-slate-200 bg-white flex flex-col py-3">
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 py-1">
        <div className="mb-4">
          <h3 className="mb-1 flex items-center justify-between px-3 text-[11px] font-bold tracking-wide text-slate-400">
            <span>인사관리</span>
            <ChevronDown className="h-3 w-3 text-slate-300" />
          </h3>
          <div className="space-y-1">
            {HR_TREE.map((root) => {
              const RootIcon = root.icon;
              const activeRoot = root.children.some((section) =>
                section.children.some((item) => isActivePath(pathname, item.href)),
              );

              return (
                <div key={root.label}>
                  <div
                    className={cn(
                      "flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-bold",
                      activeRoot ? "bg-slate-100 text-slate-900" : "text-slate-700",
                    )}
                  >
                    <RootIcon className="h-4 w-4 text-slate-500" />
                    <span className="min-w-0 flex-1 truncate">{root.label}</span>
                    <ChevronDown className="h-3 w-3 text-slate-300" />
                  </div>

                  <div className="ml-5 border-l border-slate-200 pl-3">
                    {root.children.map((section) => {
                      const activeSection = section.children.some((item) => isActivePath(pathname, item.href));
                      return (
                        <div key={section.label} className="py-0.5">
                          <div className="flex h-7 items-center justify-between text-[12px] font-bold text-slate-700">
                            <span>{section.label}</span>
                            <ChevronDown className="h-3 w-3 text-slate-300" />
                          </div>
                          <div className="ml-4 border-l border-slate-100 pl-3">
                            {section.children.map((item) => {
                              const active = isActivePath(pathname, item.href);
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  prefetch={false}
                                  className={cn(
                                    "flex h-7 items-center rounded-md px-2 text-[12px] font-semibold transition",
                                    active
                                      ? "bg-cyan-600 text-white shadow-sm"
                                      : activeSection
                                        ? "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                                  )}
                                >
                                  <span className="min-w-0 truncate">{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
