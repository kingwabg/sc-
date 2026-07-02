"use client";

/**
 * app/staff/list/page.tsx — 직원 목록 (Mavis 직접 fix)
 *
 * ResourceTable 셸 사용 (AGENTS.md §1 "공통 셸 사용"). 자체 table 금지.
 */

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MOCK_STAFF_PROFILES } from "@/lib/features/staff";
import { Search, Shield } from "lucide-react";
import { StaffListTable } from "./_components/StaffListTable";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";

type WorkStatus = "재직" | "휴직" | "퇴사";

interface Filter {
  query: string;
  dept: string;
  status: WorkStatus | "all";
}

const EMPTY_FILTER: Filter = { query: "", dept: "", status: "all" };

const DEFAULT_OPTIONS: TableOptions = {
  bordered: true,
  cellBordered: false,
  hover: true,
  resizable: true,
  sortable: true,
  paginated: true,
  pageSize: 50,
  wordWrap: false,
  fullText: false,
  expandable: false,
  density: "normal",
  loading: false,
  autoHeight: false,
  height: 600,
  minHeight: 400,
  maxHeight: 1200,
  pageSizeRows: 50,
};

export default function StaffListPage() {
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [masking, setMasking] = useState(true);

  const departments = useMemo(() => {
    const set = new Set(MOCK_STAFF_PROFILES.map((p) => p.basic.department));
    return Array.from(set).sort();
  }, []);

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        {/* ── 헤더 ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-800">직원 목록</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                인사카드 관리 — 검색 / 필터 / 마스킹
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 transition-colors">
              + 직원 등록
            </button>
          </div>
        </div>

        {/* ── 검색/필터 바 ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="직원명 / 직원번호 / 부서 검색"
                value={filter.query}
                onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
              />
            </div>
            <select
              value={filter.dept}
              onChange={(e) => setFilter((f) => ({ ...f, dept: e.target.value }))}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">전체 부서</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as Filter["status"] }))}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">전체 상태</option>
              <option value="재직">재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴사">퇴사</option>
            </select>
            {(filter.query || filter.dept || filter.status !== "all") && (
              <button
                onClick={() => setFilter(EMPTY_FILTER)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                초기화
              </button>
            )}
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={masking}
                onChange={(e) => setMasking(e.target.checked)}
                className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-200"
              />
              <Shield className="w-3 h-3" />
              개인정보 마스킹
            </label>
          </div>
        </div>

        {/* ── 테이블 (ResourceTable 셸) ── */}
        <div className="px-6 py-4">
          <StaffListTable filter={filter} masking={masking} options={DEFAULT_OPTIONS} />
        </div>
      </div>
    </AppShell>
  );
}