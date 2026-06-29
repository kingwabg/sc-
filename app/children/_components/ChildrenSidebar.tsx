"use client";

import { Users, Plus, Folder, FolderOpen, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { CapacityGroup } from "@/lib/features/children/types";

type Props = {
  selectedGroup: CapacityGroup | "all";
  counts: Record<CapacityGroup | "all", number>;
  onSelect: (group: CapacityGroup | "all") => void;
  onAdd: () => void;
};

const GROUP_LABELS: Record<CapacityGroup | "all", string> = {
  all: "전체",
  30: "30명 그룹",
  40: "40명 그룹",
  50: "50명 그룹",
};

const GROUP_ICONS: Record<CapacityGroup | "all", string> = {
  all: "📋",
  30: "30️⃣",
  40: "4️⃣0️⃣",
  50: "5️⃣0️⃣",
};

export function ChildrenSidebar({ selectedGroup, counts, onSelect, onAdd }: Props) {
  const groups: (CapacityGroup | "all")[] = ["all", 30, 40, 50];

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-600" />
          <h2 className="text-[13px] font-bold text-slate-900 m-0">아동 관리</h2>
        </div>
        <button
          onClick={onAdd}
          className="w-7 h-7 rounded-lg bg-brand-600 text-white grid place-items-center hover:bg-brand-700 transition shrink-0"
          title="아동 등록"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Group list */}
      <div className="px-2 py-2 flex-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
          정원 그룹
        </div>
        {groups.map((group) => {
          const isActive = group === selectedGroup;
          return (
            <button
              key={group}
              onClick={() => onSelect(group)}
              className={cn(
                "w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 transition",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {isActive ? (
                <FolderOpen className="w-4 h-4 shrink-0 text-brand-500" />
              ) : (
                <Folder className="w-4 h-4 shrink-0 text-slate-400" />
              )}
              <span className="text-[13px] font-medium flex-1">{GROUP_LABELS[group]}</span>
              <span
                className={cn(
                  "text-[11px] font-bold px-1.5 py-0.5 rounded-md",
                  isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500",
                )}
              >
                {counts[group]}
              </span>
            </button>
          );
        })}

        {/* 하위 메뉴 — 출결대장 */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
            출결
          </div>
          <Link
            href="/children/attendance"
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition"
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span className="flex-1">출결대장</span>
          </Link>
        </div>
      </div>

      {/* Total */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-slate-500 font-medium">총 아동</span>
          <span className="font-bold text-slate-900">{counts.all}명</span>
        </div>
      </div>
    </aside>
  );
}
