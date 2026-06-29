"use client";

import { Users, Plus, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { POSITION_LABELS } from "@/lib/staff";
import type { StaffPosition } from "@/lib/staff";

type Props = {
  selectedPosition: StaffPosition | "all";
  counts: Record<StaffPosition | "all", number>;
  onSelect: (position: StaffPosition | "all") => void;
  onAdd: () => void;
};

const ALL_POSITIONS: StaffPosition[] = Object.keys(POSITION_LABELS) as StaffPosition[];

export function StaffSidebar({ selectedPosition, counts, onSelect, onAdd }: Props) {
  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <h2 className="text-[13px] font-bold text-slate-900 m-0">종사자 관리</h2>
        </div>
        <button
          onClick={onAdd}
          className="w-7 h-7 rounded-lg bg-brand-600 text-white grid place-items-center hover:bg-brand-700 transition shrink-0"
          title="종사자 등록"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Position list */}
      <div className="px-2 py-2 flex-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
          직위 분류
        </div>
        {/* All */}
        <button
          onClick={() => onSelect("all")}
          className={cn(
            "w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 transition",
            selectedPosition === "all" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50",
          )}
        >
          {selectedPosition === "all"
            ? <FolderOpen className="w-4 h-4 shrink-0 text-indigo-500" />
            : <Folder className="w-4 h-4 shrink-0 text-slate-400" />}
          <span className="text-[13px] font-medium flex-1">전체</span>
          <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md",
            selectedPosition === "all" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>
            {counts.all}
          </span>
        </button>

        {ALL_POSITIONS.map((pos) => {
          const isActive = pos === selectedPosition;
          return (
            <button
              key={pos}
              onClick={() => onSelect(pos)}
              className={cn(
                "w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 transition",
                isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {isActive
                ? <FolderOpen className="w-4 h-4 shrink-0 text-indigo-500" />
                : <Folder className="w-4 h-4 shrink-0 text-slate-400" />}
              <span className="text-[13px] font-medium flex-1">{POSITION_LABELS[pos]}</span>
              <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md",
                isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>
                {counts[pos]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Total */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-slate-500 font-medium">총 종사자</span>
          <span className="font-bold text-slate-900">{counts.all}명</span>
        </div>
      </div>
    </aside>
  );
}
