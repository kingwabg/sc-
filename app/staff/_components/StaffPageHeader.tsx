"use client";

/**
 * StaffPageHeader — 종사자 페이지 상단 헤더 (제목 + 통계 + 액션)
 */

import { Button } from "rsuite";
import { Plus, FileDown } from "lucide-react";
import { POSITION_LABELS, type StaffPosition } from "@/lib/staff";

type Props = {
  positionFilter: StaffPosition | "all";
  filteredCount: number;
  onAdd: () => void;
  onExport: () => void;
};

export function StaffPageHeader({ positionFilter, filteredCount, onAdd, onExport }: Props) {
  const title =
    positionFilter === "all"
      ? "전체 종사자"
      : POSITION_LABELS[positionFilter] ?? positionFilter;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
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
            종사자 추가
          </Button>
        </div>
      </div>
    </div>
  );
}