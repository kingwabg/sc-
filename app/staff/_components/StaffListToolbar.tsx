"use client";

/**
 * StaffListToolbar — 검색 + 출근 chip + 필터 + 옵션 (아동관리 페이지 패턴)
 */

import { Button, Input, InputGroup } from "rsuite";
import { Search, ListFilter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";

export type StaffAttendanceChip = "all" | "present" | "absent";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  attendanceChip: StaffAttendanceChip;
  onAttendanceChipChange: (c: StaffAttendanceChip) => void;
  filterActive: boolean;
  onOpenFilter: () => void;
  tableOptions: TableOptions;
  tableOptionsChanged: boolean;
  onOpenTableOptions: () => void;
};

export function StaffListToolbar({
  query,
  onQueryChange,
  attendanceChip,
  onAttendanceChipChange,
  filterActive,
  onOpenFilter,
  tableOptionsChanged,
  onOpenTableOptions,
}: Props) {
  const chips: { v: StaffAttendanceChip; l: string }[] = [
    { v: "all", l: "전체" },
    { v: "present", l: "출근" },
    { v: "absent", l: "미출근" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <InputGroup style={{ flex: 1, minWidth: 200 }}>
        <InputGroup.Addon>
          <Search className="w-3.5 h-3.5 text-slate-400" />
        </InputGroup.Addon>
        <Input
          value={query}
          onChange={onQueryChange}
          placeholder="이름 또는 연락처 검색"
        />
      </InputGroup>
      <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-0.5 shadow-sm text-xs dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
        {chips.map((o) => (
          <button
            key={o.v}
            onClick={() => onAttendanceChipChange(o.v)}
            className={cn(
              "px-2.5 h-8 rounded-md font-medium transition",
              attendanceChip === o.v
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {o.l}
          </button>
        ))}
      </div>
      <Button
        size="sm"
        appearance={filterActive ? "primary" : "default"}
        onClick={onOpenFilter}
        startIcon={<ListFilter className="w-3.5 h-3.5" />}
      >
        필터{filterActive && <span className="ml-1 text-[10px]">●</span>}
      </Button>
      <Button
        size="sm"
        appearance={tableOptionsChanged ? "primary" : "default"}
        onClick={() => onOpenTableOptions()}
        startIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
      >
        옵션
      </Button>
    </div>
  );
}
