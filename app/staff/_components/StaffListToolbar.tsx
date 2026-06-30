"use client";

/**
 * StaffListToolbar — 종사자 목록 툴바 (검색 + 필터 + 옵션)
 */

import { Button, Input, InputGroup } from "rsuite";
import { Search, ListFilter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  filterActive: boolean;
  onOpenFilter: () => void;
  tableOptions: TableOptions;
  tableOptionsChanged: boolean;
  onOpenTableOptions: () => void;
};

export function StaffListToolbar({
  query,
  onQueryChange,
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
          placeholder="이름 또는 연락처 검색"
        />
      </InputGroup>
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