"use client";

/**
 * StaffPageHeader — 종사자 페이지 상단 헤더 (아동관리 페이지와 동일 패턴)
 *
 * 타이틀 + 인원 + 진행률 원형(오늘 출근율) + 출근/퇴근/외출/미출근 카운트 + 액션
 */

import { Button } from "rsuite";
import { Plus, FileDown, CheckCircle2, Clock, LogIn, LogOut, X } from "lucide-react";
import { POSITION_LABELS, type StaffPosition } from "@/lib/staff";

type Stats = {
  present: number;   // 오늘 clockIn O
  clockedOut: number; // 오늘 clockIn O + clockOut O
  outside: number;    // note에 외출
  absent: number;     // 오늘 clockIn X
};

type Props = {
  positionFilter: StaffPosition | "all";
  filteredCount: number;
  totalCount: number;
  fillPct: number;
  stats: Stats;
  onAdd: () => void;
  onExport: () => void;
};

export function StaffPageHeader({
  positionFilter,
  filteredCount,
  totalCount,
  fillPct,
  stats,
  onAdd,
  onExport,
}: Props) {
  const title =
    positionFilter === "all"
      ? "전체 종사자"
      : POSITION_LABELS[positionFilter] ?? positionFilter;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4 dark:bg-slate-900/95 dark:border-slate-800 dark:shadow-none">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
            {title}
          </h1>
          <span className="text-[12px] text-slate-400">
            {filteredCount}명
            {filteredCount !== totalCount && (
              <span className="text-slate-300"> / {totalCount}명</span>
            )}
          </span>
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
            종사자 추가
          </Button>
        </div>
      </div>

      {/* 출근 진행률 + 상태 카운트 (아동관리 페이지 패턴) */}
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
              출근 {stats.present} / {totalCount}
            </div>
            <div className="text-[10px] text-slate-500">오늘 출근율</div>
          </div>
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-3 text-[12px]">
          <StatChip icon={LogIn} color="emerald" label="출근" count={stats.present} />
          <StatChip icon={LogOut} color="amber" label="퇴근" count={stats.clockedOut} />
          <StatChip icon={Clock} color="blue" label="외출" count={stats.outside} />
          <StatChip icon={X} color="red" label="미출근" count={stats.absent} />
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  color,
  label,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "amber" | "blue" | "red";
  label: string;
  count: number;
}) {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
  } as const;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-4 h-4 rounded grid place-items-center ${colorMap[color]}`}>
        <Icon className="w-3 h-3" />
      </span>
      <span className="text-slate-600 text-[12px]">{label}</span>
      <span className="font-bold text-slate-900 text-[12px]">{count}</span>
    </div>
  );
}
