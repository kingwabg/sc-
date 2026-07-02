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
};

type AccountingTreeSection = {
  label: string;
  children: AccountingNavItem[];
};

type AccountingTreeRoot = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: AccountingTreeSection[];
};

type AccountingTreeGroup = {
  label: string;
  roots: AccountingTreeRoot[];
};

const SIDEBAR_GROUPS: AccountingTreeGroup[] = [
  {
    label: "회계관리",
    roots: [
      {
        label: "회계",
        icon: LayoutDashboard,
        children: [
          {
            label: "기본업무",
            children: [
              { label: "회계 대시보드", href: "/accounting" },
              { label: "수입 관리", href: "/accounting/income" },
              { label: "지출 관리", href: "/accounting/expense" },
              { label: "통장 입금", href: "/accounting/deposits" },
            ],
          },
          {
            label: "증빙·마감",
            children: [
              { label: "증빙 자료", href: "/accounting/receipts" },
              { label: "결산 리포트", href: "/accounting/reports" },
              { label: "회계 점검", href: "/accounting/checklist" },
            ],
          },
          {
            label: "설정",
            children: [
              { label: "결재 연동", href: "/accounting/approval" },
              { label: "계정 설정", href: "/accounting/settings" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "인사관리",
    roots: [
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
    ],
  },
];

export function AccountingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-[60px] left-0 bottom-0 w-[220px] border-r border-slate-200 bg-white flex flex-col py-3">
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 py-1">
        {SIDEBAR_GROUPS.map((group) => {
          return (
            <div key={group.label} className="mb-4">
              <h3 className="mb-1 flex items-center justify-between px-3 text-[11px] font-bold tracking-wide text-slate-400">
                <span>{group.label}</span>
                <ChevronDown className="h-3 w-3 text-slate-300" />
              </h3>
              <div className="space-y-1">
                {group.roots.map((root) => (
                  <AccountingTreeRootView key={root.label} root={root} pathname={pathname} />
                ))}
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

function AccountingTreeRootView({
  root,
  pathname,
}: {
  root: AccountingTreeRoot;
  pathname: string;
}) {
  const RootIcon = root.icon;

  return (
    <div>
      <div className="flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-bold text-slate-700">
        <RootIcon className="h-4 w-4 text-slate-500" />
        <span className="min-w-0 flex-1 truncate">{root.label}</span>
        <ChevronDown className="h-3 w-3 text-slate-300" />
      </div>

      <div className="ml-5 border-l border-slate-200 pl-3">
        {root.children.map((section) => (
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
                      active ? "text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/accounting") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
