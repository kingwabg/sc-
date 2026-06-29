"use client";

import Link from "next/link";
import {
  Mail,
  Star,
  ChevronDown,
  ChevronRight,
  Tag,
  Inbox,
  Send,
  Save,
  Trash2,
  Calendar,
  AlertOctagon,
  Search,
  RefreshCw,
  Settings,
  Pencil,
  Globe,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FolderKey } from "@/lib/types/mail";

type SidebarNode =
  | { kind: "header"; label: string; action?: React.ReactNode }
  | { kind: "item"; label: string; icon: React.ComponentType<{ className?: string }>; folder: FolderKey; badge?: number; badgeAction?: string };

export const MAIL_SIDEBAR: SidebarNode[] = [
  { kind: "header", label: "메일" },
  { kind: "item", label: "메일쓰기", icon: Plus, folder: "received" },
  { kind: "header", label: "즐겨찾기" },
  { kind: "item", label: "중요 메일", icon: Star, folder: "important" },
  { kind: "item", label: "안읽은 메일", icon: Mail, folder: "unread", badge: 5 },
  { kind: "item", label: "오늘온 메일", icon: Inbox, folder: "today" },
  { kind: "header", label: "태그", action: <button className="text-slate-400 hover:text-slate-900"><Plus className="w-3 h-3" /></button> },
  { kind: "header", label: "메일함", action: <button className="text-[10px] text-slate-400 hover:text-brand-600">+ 추가</button> },
  { kind: "item", label: "받은메일함", icon: Inbox, folder: "received", badge: 5 },
  { kind: "item", label: "보낼메일함", icon: Send, folder: "sent", badgeAction: "수신확인" },
  { kind: "item", label: "임시보관함", icon: Save, folder: "drafts" },
  { kind: "item", label: "예약메일함", icon: Calendar, folder: "scheduled" },
  { kind: "item", label: "스팸메일함", icon: AlertOctagon, folder: "trash", badgeAction: "비우기" },
  { kind: "item", label: "휴지통", icon: Trash2, folder: "trash", badgeAction: "비우기" },
  { kind: "header", label: "백업검색" },
  { kind: "item", label: "중요 메일", icon: Star, folder: "important" },
  { kind: "item", label: "안읽은 메일", icon: Mail, folder: "unread" },
  { kind: "item", label: "읽은 메일", icon: Inbox, folder: "read" },
  { kind: "item", label: "오늘온 메일", icon: Inbox, folder: "today" },
  { kind: "item", label: "어제온 메일", icon: Inbox, folder: "yesterday" },
  { kind: "item", label: "이번주 메일", icon: Inbox, folder: "week" },
  { kind: "item", label: "이번달 메일", icon: Inbox, folder: "month" },
  { kind: "item", label: "담당한 메일", icon: Mail, folder: "mine" },
  { kind: "item", label: "내가 쓴 메일", icon: Send, folder: "wrote" },
];

export function MailSidebar({
  current,
  onSelect,
  onWrite,
}: {
  current: FolderKey;
  onSelect: (f: FolderKey) => void;
  onWrite: () => void;
}) {
  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden h-fit sticky top-[80px]">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Mail className="w-4 h-4 text-brand-600" />
        <h2 className="text-sm font-bold text-slate-900 m-0">메일</h2>
        <button className="ml-auto w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-slate-100">
          ⋮
        </button>
      </div>

      <nav className="py-2 text-[12.5px]">
        {MAIL_SIDEBAR.map((node, i) => (
          <SidebarNode key={i} node={node} current={current} onSelect={onSelect} onWrite={onWrite} />
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-500">
          <span>1024.0MB중 30.2KB 사용</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-slate-300 rounded-full" style={{ width: "0.5%" }} />
        </div>
        <button className="mt-2 text-[10px] text-slate-400 hover:text-slate-900">
          환경 추가 요청
        </button>
      </div>

      {/* 외부 메일 연동 진입점 */}
      <div className="px-3 py-3 border-t border-slate-100">
        <Link
          href="/mail/connect"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Globe className="w-3.5 h-3.5 text-brand-600" />
          외부 메일 연동
          <ChevronRight className="w-3 h-3 ml-auto text-slate-400" />
        </Link>
      </div>
    </aside>
  );
}

function SidebarNode({
  node,
  current,
  onSelect,
  onWrite,
}: {
  node: SidebarNode;
  current: FolderKey;
  onSelect: (f: FolderKey) => void;
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
  const active = current === node.folder;
  if (node.label === "메일쓰기") {
    return (
      <div className="px-3 pt-2 pb-3">
        <button
          onClick={onWrite}
          className="w-full h-9 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          <Pencil className="w-3.5 h-3.5" />
          메일쓰기
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => onSelect(node.folder)}
      className={cn(
        "w-full flex items-center gap-1.5 h-7 pl-4 pr-3 text-[12px] transition",
        active ? "text-brand-700 font-semibold bg-brand-50/40" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      <node.icon className={cn("w-3.5 h-3.5", active ? "text-brand-600" : "text-slate-400")} />
      <span className="flex-1 text-left truncate">{node.label}</span>
      {node.badge !== undefined && (
        <span className={cn(
          "min-w-[18px] h-4 px-1 rounded text-[10px] font-bold grid place-items-center bg-brand-100 text-brand-700",
        )}>
          {node.badge}
        </span>
      )}
      {node.badgeAction && <span className="text-[10px] text-slate-400 hover:text-brand-600">{node.badgeAction}</span>}
    </button>
  );
}