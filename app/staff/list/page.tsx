"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  ResourceTable,
  type ColumnDef,
} from "@/components/ui/ResourceTable";
import {
  DEFAULT_TABLE_OPTIONS,
  type TableOptions,
} from "@/components/ui/TableOptionsDrawer";
import {
  MOCK_STAFF_PROFILES,
  type StaffProfile,
  type WorkStatus,
} from "@/lib/features/staff";
import { cn } from "@/lib/utils";
import { maskName, formatPhone, calcYearsOfService } from "@/lib/features/staff/utils";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Phone,
  Search,
  Shield,
  UserRound,
} from "lucide-react";

type WorkStatusFilter = "재직" | "휴직" | "퇴사";

const STATUS_COLORS: Record<string, string> = {
  "재직": "bg-green-50 text-green-700 border-green-200",
  "휴직": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "퇴사": "bg-slate-100 text-slate-500 border-slate-200",
};

interface Filter {
  query: string;
  dept: string;
  status: WorkStatusFilter | "all";
}

const EMPTY_FILTER: Filter = { query: "", dept: "", status: "all" };

type StaffListRow = Record<string, unknown> & {
  id: string;
  serialNo: string;
  name: string;
  nameCn?: string;
  department: string;
  position: string;
  salaryStep: number;
  workStatus: WorkStatus;
  joinDate: string;
  yearsOfService: number;
  mobile?: string;
};

const LIST_TABLE_OPTIONS: TableOptions = {
  ...DEFAULT_TABLE_OPTIONS,
  pageSize: 10,
  minHeight: 260,
  maxHeight: 640,
};

export default function StaffListPage() {
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [masking, setMasking] = useState(true);

  const filtered = useMemo(() => {
    return MOCK_STAFF_PROFILES.filter((p) => {
      const q = filter.query.toLowerCase();
      if (q && !p.basic.serialNo.toLowerCase().includes(q) &&
          !p.basic.nameKr.toLowerCase().includes(q) &&
          !p.basic.department.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q)) return false;
      if (filter.dept && p.basic.department !== filter.dept) return false;
      if (filter.status !== "all" && p.basic.workStatus !== filter.status) return false;
      return true;
    });
  }, [filter]);

  const departments = useMemo(() => {
    const set = new Set(MOCK_STAFF_PROFILES.map((p) => p.basic.department));
    return Array.from(set).sort();
  }, []);

  const displayName = (p: StaffProfile) =>
    masking ? maskName(p.basic.nameKr) : p.basic.nameKr;

  const rows = useMemo<StaffListRow[]>(
    () =>
      filtered.map((p) => ({
        id: p.id,
        serialNo: p.basic.serialNo,
        name: displayName(p),
        nameCn: p.basic.nameCn,
        department: p.basic.department,
        position: p.basic.position,
        salaryStep: p.basic.salaryStep,
        workStatus: p.basic.workStatus,
        joinDate: p.basic.joinDate,
        yearsOfService: calcYearsOfService(p.basic.joinDate).years,
        mobile: p.basic.mobile,
      })),
    [filtered, masking],
  );

  const columns = useMemo<ColumnDef<StaffListRow>[]>(
    () => [
      {
        key: "serialNo",
        header: "직렬번호",
        width: 120,
        minWidth: 96,
        cell: (row) => (
          <Link
            href={`/staff/${row.id}`}
            className="text-[12px] font-semibold tabular-nums text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-300"
          >
            {row.serialNo}
          </Link>
        ),
      },
      {
        key: "name",
        header: "직원명",
        flexGrow: 2,
        minWidth: 180,
        cell: (row) => (
          <Link
            href={`/staff/${row.id}`}
            className="inline-flex h-full min-w-0 items-center gap-2.5 text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-sky-300"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-[12px] font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/45 dark:text-blue-200 dark:ring-blue-900/70">
              {row.name.slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-bold">{row.name}</span>
              {row.nameCn && (
                <span className="block truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {row.nameCn}
                </span>
              )}
            </span>
          </Link>
        ),
      },
      {
        key: "department",
        header: "부서",
        width: 130,
        minWidth: 110,
        cell: (row) => (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
            <UserRound className="h-3.5 w-3.5 text-slate-400" />
            {row.department}
          </span>
        ),
      },
      {
        key: "position",
        header: "직위",
        width: 130,
        minWidth: 110,
        cell: (row) => (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[12px] font-bold text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            {row.position}
          </span>
        ),
      },
      {
        key: "salaryStep",
        header: "호봉",
        width: 86,
        align: "center",
        cell: (row) => (
          <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
            {row.salaryStep}호봉
          </span>
        ),
      },
      {
        key: "workStatus",
        header: "근무상태",
        width: 110,
        align: "center",
        cell: (row) => (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold",
              STATUS_COLORS[row.workStatus] ?? "bg-slate-50 text-slate-500 border-slate-200",
              row.workStatus === "재직" && "dark:border-emerald-900/70 dark:bg-emerald-950/35 dark:text-emerald-200",
              row.workStatus === "휴직" && "dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-200",
              row.workStatus === "퇴사" && "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
            )}
          >
            <BadgeCheck className="h-3 w-3" />
            {row.workStatus}
          </span>
        ),
      },
      {
        key: "joinDate",
        header: "입사일",
        width: 142,
        minWidth: 120,
        cell: (row) => (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            {row.joinDate}
            <span className="text-slate-400 dark:text-slate-500">({row.yearsOfService}년)</span>
          </span>
        ),
      },
      {
        key: "mobile",
        header: "연락처",
        width: 156,
        minWidth: 130,
        cell: (row) =>
          row.mobile ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-slate-50 px-2 text-[12px] font-semibold tabular-nums text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {masking ? "010-****-****" : formatPhone(row.mobile)}
            </span>
          ) : (
            <span className="text-slate-300 dark:text-slate-600">—</span>
          ),
      },
    ],
    [masking],
  );

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* ── 헤더 ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-50">직원 목록</h1>
              <p className="text-xs text-slate-400 mt-0.5 dark:text-slate-500">
                총 {filtered.length}명 / 전체 {MOCK_STAFF_PROFILES.length}명
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 transition-colors dark:border-blue-900/70 dark:text-sky-300 dark:hover:border-sky-700">
                + 직원 등록
              </button>
            </div>
          </div>
        </div>

        {/* ── 검색/필터 바 ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-3">
            {/* 키워드 검색 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="직원명 / 직원번호 / 부서 검색"
                value={filter.query}
                onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-sky-700 dark:focus:ring-sky-950"
              />
            </div>

            {/* 부서 필터 */}
            <select
              value={filter.dept}
              onChange={(e) => setFilter((f) => ({ ...f, dept: e.target.value }))}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:ring-sky-950"
            >
              <option value="">전체 부서</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* 근무상태 필터 */}
            <select
              value={filter.status}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as Filter["status"] }))}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:ring-sky-950"
            >
              <option value="all">전체 상태</option>
              <option value="재직">재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴사">퇴사</option>
            </select>

            {/* 초기화 */}
            {(filter.query || filter.dept || filter.status !== "all") && (
              <button
                onClick={() => setFilter(EMPTY_FILTER)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                초기화
              </button>
            )}

            {/* 개인정보 마스킹 토글 */}
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer ml-auto dark:text-slate-400">
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

        {/* ── 테이블 ── */}
        <div className="px-6 py-4">
          <ResourceTable
            data={rows}
            rowKey={(row) => row.id}
            options={LIST_TABLE_OPTIONS}
            columns={columns}
          />
        </div>
      </div>
    </AppShell>
  );
}
