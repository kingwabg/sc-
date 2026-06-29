"use client";

import { useState } from "react";
import {
  FileCheck2,
  Plus,
  Inbox,
  Send,
  Eye,
  Clock,
  CalendarRange,
  Search,
  Archive,
  FolderOpen,
  Users,
  Settings,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalView } from "@/lib/types/approval";

type MenuNode =
  | { kind: "header"; label: string; action?: React.ReactNode }
  | { kind: "action"; label: string; icon: React.ComponentType<{ className?: string }>; view: ApprovalView; highlight?: boolean }
  | { kind: "item"; label: string; icon: React.ComponentType<{ className?: string }>; view: ApprovalView; badge?: number; badgeAction?: string }
  | { kind: "group"; label: string; icon: React.ComponentType<{ className?: string }>; children: MenuNode[]; defaultOpen?: boolean };

const SIDEBAR: MenuNode[] = [
  { kind: "action", label: "새 결재 진행", icon: Plus, view: "new", highlight: true },
  { kind: "header", label: "결재하기" },
  { kind: "item", label: "결재 대기 문서", icon: Inbox, view: "pending", badge: 3 },
  { kind: "item", label: "결재 수신 문서", icon: Send, view: "received" },
  { kind: "item", label: "참조/열람 대기 문서", icon: Eye, view: "cc" },
  { kind: "item", label: "결재 예정 문서", icon: Clock, view: "scheduled" },
  {
    kind: "group",
    label: "개인문서함",
    icon: FolderOpen,
    defaultOpen: true,
    children: [
      { kind: "item", label: "기간 문서함", icon: CalendarRange, view: "period" },
      { kind: "item", label: "임시 저장함", icon: Archive, view: "draft" },
      { kind: "item", label: "검색 문서함", icon: Search, view: "search" },
      { kind: "item", label: "결재 문서함", icon: Inbox, view: "approved" },
    ],
  },
  {
    kind: "group",
    label: "부서문서함",
    icon: Users,
    defaultOpen: true,
    children: [{ kind: "item", label: "사회복지사", icon: Users, view: "dept" }],
  },
  { kind: "header", label: "환경설정" },
  { kind: "item", label: "전자결재 환경설정", icon: Settings, view: "home" },
  { kind: "header", label: "문서관리" },
  { kind: "item", label: "양식별 문서 조회", icon: FileCheck2, view: "home" },
];

export function ApprovalSidebar({
  current,
  onSelect,
  onWrite,
}: {
  current: ApprovalView;
  onSelect: (v: ApprovalView) => void;
  onWrite: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    개인문서함: true,
    부서문서함: true,
  });

  function toggleGroup(label: string) {
    setOpenGroups((p) => ({ ...p, [label]: !p[label] }));
  }

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden h-fit sticky top-[80px]">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <FileCheck2 className="w-4 h-4 text-brand-600" />
        <h2 className="text-sm font-bold text-slate-900 m-0">전자결재</h2>
        <button className="ml-auto w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-slate-100">
          ⋮
        </button>
      </div>

      <nav className="py-2">
        {SIDEBAR.map((node, i) => (
          <SidebarNode
            key={i}
            node={node}
            currentView={current}
            onSelect={onSelect}
            openGroups={openGroups}
            toggleGroup={toggleGroup}
            onWrite={onWrite}
          />
        ))}
      </nav>

      <div className="px-4 py-2.5 border-t border-slate-100">
        <button className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-900 transition">
          <Settings className="w-3 h-3" />
          전자결재 환경설정
        </button>
      </div>
    </aside>
  );
}

function SidebarNode({
  node,
  currentView,
  onSelect,
  openGroups,
  toggleGroup,
  onWrite,
}: {
  node: MenuNode;
  currentView: ApprovalView;
  onSelect: (v: ApprovalView) => void;
  openGroups: Record<string, boolean>;
  toggleGroup: (label: string) => void;
  onWrite: () => void;
}) {
  if (node.kind === "header") {
    return (
      <div className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
        <span>{node.label}</span>
        {node.action}
      </div>
    );
  }
  if (node.kind === "action") {
    return (
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onWrite}
          className={cn(
            "w-full h-9 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold transition",
            node.highlight
              ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          <node.icon className="w-4 h-4" />
          {node.label}
        </button>
      </div>
    );
  }
  if (node.kind === "item") {
    const active = currentView === node.view;
    return (
      <button
        onClick={() => onSelect(node.view)}
        className={cn(
          "w-full flex items-center gap-2 h-8 pl-9 pr-3 text-[12.5px] transition relative",
          active
            ? "text-brand-700 font-semibold bg-brand-50/40"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        {active && <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-3 bg-brand-600 rounded-full" />}
        <span className="flex-1 text-left truncate">{node.label}</span>
        {node.badge ? (
          <span className="min-w-[20px] h-4 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">
            {node.badge}
          </span>
        ) : null}
        {node.badgeAction && <span className="text-[10px] text-slate-400 hover:text-brand-600">{node.badgeAction}</span>}
      </button>
    );
  }
  // group
  const open = openGroups[node.label] ?? node.defaultOpen;
  return (
    <>
      <button
        onClick={() => toggleGroup(node.label)}
        className="w-full flex items-center gap-1.5 h-8 pl-4 pr-3 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition"
      >
        <ChevronRight className={cn("w-3 h-3 text-slate-400 transition", open && "rotate-90")} />
        <node.icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="flex-1 text-left">{node.label}</span>
      </button>
      {open && (
        <div className="space-y-0.5">
          {node.children.map((child, i) => (
            <SidebarNode
              key={i}
              node={child}
              currentView={currentView}
              onSelect={onSelect}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
              onWrite={onWrite}
            />
          ))}
        </div>
      )}
    </>
  );
}