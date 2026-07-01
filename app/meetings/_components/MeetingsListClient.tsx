/**
 * app/meetings/_components/MeetingsListClient.tsx
 *
 * Client wrapper — 탭(전체/아동자치/운영위원회/종사자) + 검색 + 테이블 옵션
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
import { MeetingStatsCards } from "./MeetingStatsCards";
import { MeetingTypeTabs, type MeetingTypeFilter } from "./MeetingTypeTabs";
import { MeetingsTable } from "./MeetingsTable";
import type { Meeting, MeetingStats } from "@/lib/features/meeting/types";

interface Props {
  initialMeetings: Meeting[];
  stats: MeetingStats;
}

export function MeetingsListClient({ initialMeetings, stats }: Props) {
  const [tab, setTab] = useState<MeetingTypeFilter>("ALL");
  const [query, setQuery] = useState("");
  const [tableOptions, setTableOptions] = useState<TableOptions>(
    DEFAULT_TABLE_OPTIONS,
  );
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);

  // 탭별 카운트
  const counts = useMemo<Record<MeetingTypeFilter, number>>(() => {
    return {
      ALL: initialMeetings.length,
      CHILD_COUNCIL: initialMeetings.filter((m) => m.type === "CHILD_COUNCIL").length,
      GOVERNANCE: initialMeetings.filter((m) => m.type === "GOVERNANCE").length,
      STAFF: initialMeetings.filter((m) => m.type === "STAFF").length,
    };
  }, [initialMeetings]);

  // 필터링
  const filtered = useMemo(() => {
    let list = initialMeetings;
    if (tab !== "ALL") list = list.filter((m) => m.type === tab);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.location ?? "").toLowerCase().includes(q) ||
          m.attendees.some((a) => a.toLowerCase().includes(q)) ||
          m.decisions.some((d) => d.toLowerCase().includes(q)) ||
          m.agenda.some((a) => a.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [initialMeetings, tab, query]);

  return (
    <div className="space-y-4">
      <MeetingStatsCards stats={stats} />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <MeetingTypeTabs value={tab} counts={counts} onChange={setTab} />
          <div className="flex items-center gap-2">
            <InputGroup style={{ minWidth: 240 }}>
              <InputGroup.Addon>
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </InputGroup.Addon>
              <Input
                value={query}
                onChange={setQuery}
                placeholder="제목, 장소, 참석자, 결정사항 검색"
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

        <MeetingsTable meetings={filtered} options={tableOptions} />
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