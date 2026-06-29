"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MailSidebar } from "./_components/MailSidebar";
import { ComposeMailModal } from "./_components/ComposeMailModal";
import {
  Mail,
  Star,
  X,
  AlertOctagon,
  Search,
  RefreshCw,
  Paperclip,
  MailOpen,
  FolderInput,
  Reply,
  Forward,
  MoreHorizontal,
  Trash2,
  Tag,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FolderKey, MailRow } from "@/lib/types/mail";
import { MOCK_MAILS, FOLDER_TITLE } from "@/lib/data/mail-detail";

const FOLDER_KEYS: FolderKey[] = [
  "received", "sent", "drafts", "scheduled", "trash",
  "important", "unread", "today", "read", "yesterday", "week", "month", "mine", "wrote",
];

const BACKUP_FOLDERS: FolderKey[] = [
  "important", "unread", "read", "today", "yesterday", "week", "month", "mine", "wrote",
];

export default function MailPage() {
  const router = useRouter();
  const [folder, setFolder] = useState<FolderKey>("received");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);

  const mails: MailRow[] = MOCK_MAILS[folder] ?? [];
  const totalUnread = MOCK_MAILS.received.filter((m) => !m.read).length;
  const allSelected = mails.length > 0 && selected.size === mails.length;
  const someSelected = selected.size > 0 && !allSelected;

  function handleSelect(f: FolderKey) {
    if (BACKUP_FOLDERS.includes(f) || ["received", "sent", "drafts", "scheduled", "trash"].includes(f)) {
      setFolder(f);
    }
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(mails.map((m) => m.id)));
  }
  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  return (
    <AppShell>
      <>
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          <MailSidebar
            current={folder}
            onSelect={handleSelect}
            onWrite={() => setComposeOpen(true)}
          />

          <section className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
            {/* 헤더 */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 m-0">{FOLDER_TITLE[folder]}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                전체메일함 {MOCK_MAILS.received.length} / 안읽은 메일 {totalUnread}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="flex items-center h-8 px-3 bg-slate-50 border border-slate-200 rounded-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                  <input placeholder="검색" className="bg-transparent outline-none text-[12px] w-32" />
                </div>
              </div>
            </div>

            {/* 알림 배너 */}
            <div className="px-5 py-2 border-b border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">상반기 끝자락, 새로운 행가는 작은 여유</span>
              <button className="ml-auto text-slate-400 hover:text-slate-900"><X className="w-3 h-3" /></button>
            </div>

            {/* 툴바 */}
            <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1 flex-wrap">
              <ToolBtn icon={<input type="checkbox" className="w-3.5 h-3.5" checked={allSelected} onChange={toggleAll} />} title="전체 선택" />
              <ToolBtn icon={<AlertOctagon className="w-4 h-4" />} title="스팸신고" />
              <ToolBtn icon={<Reply className="w-4 h-4" />} title="답장" />
              <ToolBtn icon={<ChevronDown className="w-3 h-3 ml-0.5" />} title="답장 옵션" inline />
              <ToolBtn icon={<Trash2 className="w-4 h-4" />} title="삭제" />
              <ToolBtn icon={<Tag className="w-4 h-4" />} title="태그" />
              <ToolBtn icon={<ChevronDown className="w-3 h-3 ml-0.5" />} title="태그 옵션" inline />
              <ToolBtn icon={<FolderInput className="w-4 h-4" />} title="이동" />
              <ToolBtn icon={<Forward className="w-4 h-4" />} title="전달" />
              <ToolBtn icon={<MailOpen className="w-4 h-4" />} title="읽음" />
              <ToolBtn icon={<FolderInput className="w-4 h-4" />} title="이동" />
              <ToolBtn icon={<MoreHorizontal className="w-4 h-4" />} title="더보기" />

              <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
                <button className="w-7 h-7 grid place-items-center rounded hover:bg-slate-100"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 grid place-items-center rounded hover:bg-slate-100"><RefreshCw className="w-3.5 h-3.5" /></button>
                <select className="h-7 px-2 text-[11px] border border-slate-200 rounded">
                  <option>20</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>

            {/* 메일 목록 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 text-[10px] text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="w-[40px] py-1.5 text-center">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5"
                        checked={allSelected}
                        onChange={toggleAll}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                      />
                    </th>
                    <th className="w-[24px] py-1.5"></th>
                    <th className="w-[24px] py-1.5"></th>
                    <th className="text-left px-2 py-1.5">보낸 사람</th>
                    <th className="text-left px-2 py-1.5">제목</th>
                    <th className="w-[110px] text-left px-2 py-1.5">날짜</th>
                    <th className="w-[60px] text-right px-3 py-1.5">크기</th>
                  </tr>
                </thead>
                <tbody>
                  {mails.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                        메일이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    mails.map((m) => (
                      <MailRowComp key={m.id} mail={m} selected={selected.has(m.id)} onToggle={() => toggleOne(m.id)} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs">
              <button className="w-7 h-7 grid place-items-center rounded text-slate-400 hover:bg-slate-100">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 grid place-items-center rounded bg-brand-50 text-brand-700 font-bold border border-brand-300">1</button>
              <button className="w-7 h-7 grid place-items-center rounded text-slate-400 hover:bg-slate-100">
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </div>

      <ComposeMailModal open={composeOpen} onClose={() => setComposeOpen(false)} />
      </>
    </AppShell>
  );
}

function ToolBtn({ icon, title, inline }: { icon: React.ReactNode; title: string; inline?: boolean }) {
  return (
    <button
      title={title}
      className={cn(
        "h-8 px-2 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition inline-flex items-center gap-0.5",
        inline && "px-1.5",
      )}
    >
      {icon}
    </button>
  );
}

function MailRowComp({ mail, selected, onToggle }: { mail: MailRow; selected: boolean; onToggle: () => void }) {
  return (
    <tr
      onClick={onToggle}
      className={cn(
        "border-b border-slate-100 cursor-pointer transition",
        selected ? "bg-brand-50/40" : "hover:bg-slate-50",
        !mail.read && "bg-slate-50/40",
      )}
    >
      <td className="py-2 text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="w-3.5 h-3.5"
        />
      </td>
      <td className="py-2 text-center">
        <button onClick={(e) => e.stopPropagation()}>
          <Paperclip className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </td>
      <td className="py-2 text-center">
        <button onClick={(e) => e.stopPropagation()}>
          <MailOpen className={cn("w-3.5 h-3.5", mail.read ? "text-slate-300" : "text-slate-500")} />
        </button>
      </td>
      <td className={cn("px-2 py-2 text-[12.5px] truncate", !mail.read && "font-bold text-slate-900")}>
        {mail.from}
      </td>
      <td className="px-2 py-2 truncate">
        <span className={cn("text-[12.5px]", !mail.read ? "font-bold text-slate-900" : "text-slate-700")}>
          {mail.subject}
        </span>
        <span className="ml-2 inline-block align-middle">
          <Paperclip className="w-3 h-3 text-slate-300 inline" />
        </span>
      </td>
      <td className={cn("px-2 py-2 text-[11.5px]", !mail.read ? "font-semibold text-slate-700" : "text-slate-500")}>
        {mail.date}
      </td>
      <td className="px-3 py-2 text-[11.5px] text-slate-500 text-right">{mail.size}</td>
    </tr>
  );
}