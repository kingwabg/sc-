"use client";

/**
 * ChildrenListToolbar — 검색 + 출석 필터 + 상세 필터 + 옵션
 */

import { Button, Input, InputGroup } from "rsuite";
import { Search, ListFilter, SlidersHorizontal } from "lucide-react";
import { StatusFilter } from "./StatusFilter";
import type { AttendanceStatus } from "@/lib/features/children/types";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  statusFilter: AttendanceStatus | "all";
  onStatusFilterChange: (s: AttendanceStatus | "all") => void;
  filterActive: boolean;
  onOpenFilter: () => void;
  tableOptions: TableOptions;
  tableOptionsChanged: boolean;
  onOpenTableOptions: () => void;
};

export function ChildrenListToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  filterActive,
  onOpenFilter,
  tableOptionsChanged,
  onOpenTableOptions,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <InputGroup style={{ flex: 1, minWidth: 200 }}>
        <InputGroup.Addon>
          <Search className="w-3.5 h-3.5 text-slate-400" />
        </InputGroup.Addon>
        <Input
          value={query}
          onChange={onQueryChange}
          placeholder="이름 또는 보호자 검색"
        />
      </InputGroup>
      <StatusFilter value={statusFilter} onChange={onStatusFilterChange} />
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
        onClick={onOpenTableOptions}
        startIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
      >
        옵션
      </Button>
    </div>
  );
}