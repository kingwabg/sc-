"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileCheck2,
  Plus,
  Inbox,
  Send,
  Eye,
  Clock,
  FolderOpen,
  Archive,
  FileText,
  Bell,
  Building2,
  Settings,
  Search,
  LayoutGrid,
  ClipboardList,
  Users,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalView } from "@/lib/features/approval";

// ─── 메뉴 노드 타입 ───────────────────────────────────────
type MenuNode =
  | { kind: "header"; label: string }
  | {
      kind: "group";
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      children: MenuNode[];
      defaultOpen?: boolean;
    }
  | { kind: "item"; label: string; href: string; badge?: number };

// ─── 사이드바 메뉴 구성 (5그룹) ─────────────────────────
const SIDEBAR_MENU: MenuNode[] = [
  // 그룹 1: 결재하기
  { kind: "header", label: "결재하기" },
  { kind: "item", label: "결재 대기 문서", href: "/approval/standby", badge: 3 },
  { kind: "item", label: "결재 수신 문서", href: "/approval/inbox" },
  { kind: "item", label: "참조/열람 대기 문서", href: "/approval/cc" },
  { kind: "item", label: "결재 예정 문서", href: "/approval/expected" },

  // 그룹 2: 개인 문서함 (8개)
  { kind: "header", label: "개인 문서함" },
  {
    kind: "group",
    label: "개인 문서함",
    icon: FolderOpen,
    defaultOpen: true,
    children: [
      { kind: "item", label: "기본 문서함", href: "/approval/default" },
      { kind: "item", label: "기안 문서함", href: "/approval/draft" },
      { kind: "item", label: "임시 저장함", href: "/approval/temporary" },
      { kind: "item", label: "결재 문서함", href: "/approval/sign" },
      { kind: "item", label: "참조/열람 문서함", href: "/approval/ccbox" },
      { kind: "item", label: "수신 문서함", href: "/approval/inboxbox" },
      { kind: "item", label: "발송 문서함", href: "/approval/sendbox" },
      { kind: "item", label: "공문 문서함", href: "/approval/appr" },
    ],
  },

  // 그룹 3: 부서 문서함
  { kind: "header", label: "부서 문서함" },
  {
    kind: "group",
    label: "부서 문서함",
    icon: Building2,
    defaultOpen: true,
    children: [
      { kind: "item", label: "기본 문서함", href: "/approval/dept-default" },
      { kind: "item", label: "기안 완료함", href: "/approval/dept-draft" },
      { kind: "item", label: "부서 참조함", href: "/approval/dept-cc" },
      { kind: "item", label: "공문 발송함", href: "/approval/dept-send" },
    ],
  },

  // 그룹 4: 환경설정
  { kind: "header", label: "환경설정" },
  { kind: "item", label: "전자결재 환경설정", href: "/approval/config" },

  // 그룹 5: 전자결재 문서관리
  { kind: "header", label: "전자결재 문서관리" },
  { kind: "item", label: "양식별 문서 조회", href: "/approval/inquiry" },
  { kind: "item", label: "전사 공문 발송함", href: "/approval/dept-send" },
  { kind: "item", label: "운영자 작업기록", href: "/approval/config" },
];

// ─── 사이드바 컴포넌트 ───────────────────────────────────
interface ApprovalSidebarProps {
  /** 현재 선택된 폴더 (URL segment) */
  currentFolder: string;
}

export function ApprovalSidebar({ currentFolder }: ApprovalSidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "개인 문서함": true,
    "부서 문서함": true,
  });

  function toggleGroup(label: string) {
    setOpenGroups((p) => ({ ...p, [label]: !p[label] }));
  }

  const isActive = (href: string) => {
    // /approval/standby matches currentFolder === "standby"
    const folder = href.replace("/approval/", "");
    return currentFolder === folder || pathname === href;
  };

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden h-fit sticky top-[80px] w-[240px] shrink-0">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <FileCheck2 className="w-4 h-4 text-brand-600" />
        <h2 className="text-sm font-bold text-slate-900 m-0">전자결재</h2>
        <Link
          href="/approval/new"
          className="ml-auto flex items-center gap-1.5 h-7 px-3 rounded-lg bg-brand-600 text-white text-[12px] font-bold hover:bg-brand-700 transition shadow-sm"
        >
          <Plus className="w-3 h-3" />
          새 결재
        </Link>
      </div>

      <nav className="py-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {SIDEBAR_MENU.map((node, i) => (
          <SidebarNode
            key={i}
            node={node}
            isActive={isActive}
            openGroups={openGroups}
            toggleGroup={toggleGroup}
          />
        ))}
      </nav>

      <div className="px-4 py-2.5 border-t border-slate-100">
        <Link
          href="/approval/config"
          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-900 transition"
        >
          <Settings className="w-3 h-3" />
          전자결재 환경설정
        </Link>
      </div>
    </aside>
  );
}

// ─── 사이드바 노드 렌더러 ────────────────────────────────
function SidebarNode({
  node,
  isActive,
  openGroups,
  toggleGroup,
}: {
  node: MenuNode;
  isActive: (href: string) => boolean;
  openGroups: Record<string, boolean>;
  toggleGroup: (label: string) => void;
}) {
  if (node.kind === "header") {
    return (
      <div className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        {node.label}
      </div>
    );
  }

  if (node.kind === "item") {
    const active = isActive(node.href);
    return (
      <Link
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
        {node.badge != null && node.badge > 0 ? (
          <span className="min-w-[20px] h-4 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">
            {node.badge}
          </span>
        ) : null}
      </Link>
    );
  }

  // group (discriminated union — kind is "group")
  const groupNode = node as Extract<MenuNode, { kind: "group" }>;
  const open = openGroups[groupNode.label] ?? groupNode.defaultOpen;
  return (
    <>
      <button
        onClick={() => toggleGroup(groupNode.label)}
        className="w-full flex items-center gap-1.5 h-8 pl-4 pr-3 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition"
      >
        {open ? (
          <ChevronDown className="w-3 h-3 text-slate-400" />
        ) : (
          <ChevronRight className="w-3 h-3 text-slate-400" />
        )}
        <groupNode.icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="flex-1 text-left">{groupNode.label}</span>
      </button>
      {open && (
        <div className="space-y-0.5">
          {groupNode.children.map((child, i) => (
            <SidebarNode
              key={i}
              node={child}
              isActive={isActive}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
            />
          ))}
        </div>
      )}
    </>
  );
}
