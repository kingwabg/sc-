/**
 * app/donations/_components/DonationsListClient.tsx
 *
 * Client wrapper — list 페이지의 인터랙티브 부분
 *  - 검색어 / 타입 필터 / 테이블 옵션
 *  - ResourceTable (DonationsTable) 사용
 */

"use client";

import { useMemo, useState } from "react";
import { Input, InputGroup, Button } from "rsuite";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  TableOptionsDrawer,
  DEFAULT_TABLE_OPTIONS,
  type TableOptions,
} from "@/components/ui/TableOptionsDrawer";
import { DonationStatsCards } from "./DonationStatsCards";
import { DonationTypeFilterChips } from "./DonationTypeFilter";
import { DonationsTable } from "./DonationsTable";
import type {
  Donation,
  DonationStats,
  DonationType,
} from "@/lib/features/donation/types";

interface Props {
  initialDonations: Donation[];
  stats: DonationStats;
}

type Filter = "all" | DonationType;

export function DonationsListClient({ initialDonations, stats }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [tableOptions, setTableOptions] = useState<TableOptions>(
    DEFAULT_TABLE_OPTIONS,
  );
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);

  // 타입별 카운트
  const typeCounts = useMemo(() => {
    const counts: Record<Filter, number> = { all: initialDonations.length, CASH: 0, GOODS: 0 };
    for (const d of initialDonations) counts[d.type]++;
    return counts;
  }, [initialDonations]);

  // 필터링
  const filtered = useMemo(() => {
    let list = initialDonations;
    if (filter !== "all") list = list.filter((d) => d.type === filter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.donorName.toLowerCase().includes(q) ||
          (d.donorContact ?? "").toLowerCase().includes(q) ||
          (d.itemName ?? "").toLowerCase().includes(q) ||
          (d.notes ?? "").toLowerCase().includes(q) ||
          (d.receiptNumber ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [initialDonations, filter, query]);

  return (
    <div className="space-y-4">
      <DonationStatsCards stats={stats} />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <DonationTypeFilterChips
            value={filter}
            counts={typeCounts}
            onChange={setFilter}
          />
          <div className="flex items-center gap-2">
            <InputGroup style={{ minWidth: 240 }}>
              <InputGroup.Addon>
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </InputGroup.Addon>
              <Input
                value={query}
                onChange={setQuery}
                placeholder="후원자, 연락처, 물품, 영수증 번호"
              />
            </InputGroup>
            <Button
              size="sm"
              appearance={tableOptions !== DEFAULT_TABLE_OPTIONS ? "primary" : "default"}
              onClick={() => setTableOptionsOpen(true)}
              startIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            >
              옵션
            </Button>
          </div>
        </div>

        <DonationsTable donations={filtered} options={tableOptions} />
      </div>

      <TableOptionsDrawer
        open={tableOptionsOpen}
        value={tableOptions}
        onChange={setTableOptions}
        onClose={() => setTableOptionsOpen(false)}
      />
    </div>
  );
}
