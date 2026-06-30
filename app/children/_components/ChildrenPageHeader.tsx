"use client";

/**
 * ChildrenPageHeader — 아동 페이지 상단 헤더 (타이틀 + 진행률 + 출석 통계 + 액션)
 */

import { Button } from "rsuite";
import { Plus, FileDown, Baby, CheckCircle2, Clock, X } from "lucide-react";
import { StatusCount } from "./StatusCount";

type Props = {
  title: string;
  filteredCount: number;
  fillPct: number;
  /** "등원 N / K" 형태로 capacity 표시 */
  capacityLabel: string;
  stats: {
    present: number;
    earlyLeave: number;
    sick: number;
    absent: number;
  };
  onAdd: () => void;
  onExport: () => void;
};

export function ChildrenPageHeader({
  title,
  filteredCount,
  fillPct,
  capacityLabel,
  stats,
  onAdd,
  onExport,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-0">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
            {title}
          </h1>
          <span className="text-[12px] text-slate-400">{filteredCount}명</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            appearance="subtle"
            onClick={onExport}
            startIcon={<FileDown className="w-3.5 h-3.5" />}
          >
            내보내기
          </Button>
          <Button
            size="sm"
            appearance="primary"
            onClick={onAdd}
            startIcon={<Plus className="w-3.5 h-3.5" />}
          >
            아동 추가
          </Button>
        </div>
      </div>

      {/* 정원 진행률 + 출석 통계 */}
      <div className="flex items-center gap-6 mt-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke={fillPct >= 90 ? "#ef4444" : fillPct >= 70 ? "#f59e0b" : "#10b981"}
                strokeWidth="3"
                strokeDasharray={`${fillPct * 0.94} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-[10px] font-bold text-slate-700">
              {fillPct}%
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-[12px] font-semibold text-slate-900">
              등원 {stats.present}
              {capacityLabel}
            </div>
            <div className="text-[10px] text-slate-500">정원 진행률</div>
          </div>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-3 text-[12px]">
          <StatusCount icon={CheckCircle2} color="emerald" label="등원" count={stats.present} />
          <StatusCount icon={Clock} color="amber" label="조퇴" count={stats.earlyLeave} />
          <StatusCount icon={Clock} color="blue" label="보건" count={stats.sick} />
          <StatusCount icon={X} color="red" label="결석" count={stats.absent} />
        </div>
      </div>
    </div>
  );
}