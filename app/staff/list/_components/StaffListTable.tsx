"use client";

/**
 * app/staff/list/_components/StaffListTable.tsx
 *
 * 직원 목록 테이블 — ResourceTable<T> 셸 어댑터 (AGENTS.md "공통 셸 사용")
 *
 * 책임:
 *  - StaffProfile[] → StaffRow[] 매핑
 *  - 8개 컬럼 정의 (직렬번호/직원명/부서/직위/호봉/근무상태/입사일/연락처)
 *  - 행 클릭 → /staff/[id]
 *  - 마스킹 토글 (이름/연락처)
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ResourceTable,
  type ColumnDef,
} from "@/components/ui/ResourceTable";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";
import {
  MOCK_STAFF_PROFILES,
  type StaffProfile,
} from "@/lib/features/staff";
import { maskName, formatPhone, calcYearsOfService } from "@/lib/features/staff/utils";

type StaffRow = {
  id: string;
  serialNo: string;
  name: string;
  nameCn: string;
  department: string;
  position: string;
  salaryStep: number;
  workStatus: string;
  joinDate: string;
  yearsOfService: number;
  mobile: string;
};

const STATUS_COLORS: Record<string, string> = {
  재직: "bg-green-50 text-green-700 border-green-200",
  휴직: "bg-yellow-50 text-yellow-700 border-yellow-200",
  퇴사: "bg-slate-100 text-slate-500 border-slate-200",
};

interface Props {
  filter: { query: string; dept: string; status: string };
  masking: boolean;
  options: TableOptions;
}

function toRow(p: StaffProfile): StaffRow {
  const yos = calcYearsOfService(p.basic.joinDate);
  return {
    id: p.id,
    serialNo: p.basic.serialNo,
    name: p.basic.nameKr,
    nameCn: p.basic.nameCn ?? "",
    department: p.basic.department,
    position: p.basic.position,
    salaryStep: p.basic.salaryStep,
    workStatus: p.basic.workStatus,
    joinDate: p.basic.joinDate,
    yearsOfService: yos.years,
    mobile: p.basic.mobile ?? "",
  };
}

export function StaffListTable({ filter, masking, options }: Props) {
  const router = useRouter();

  const data = useMemo(() => {
    return MOCK_STAFF_PROFILES.filter((p) => {
      const q = filter.query.toLowerCase();
      if (q &&
          !p.basic.serialNo.toLowerCase().includes(q) &&
          !p.basic.nameKr.toLowerCase().includes(q) &&
          !p.basic.department.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q)) return false;
      if (filter.dept && p.basic.department !== filter.dept) return false;
      if (filter.status !== "all" && p.basic.workStatus !== filter.status) return false;
      return true;
    }).map(toRow);
  }, [filter]);

  const columns: ColumnDef<StaffRow>[] = [
    { key: "serialNo", header: "직렬번호", width: 90, cell: (r) => <span className="text-slate-500">{r.serialNo}</span> },
    { key: "name", header: "직원명", width: 140, cell: (r) => (
      <div>
        <span className="font-medium text-slate-800">{masking ? maskName(r.name) : r.name}</span>
        {r.nameCn && <span className="ml-1 text-slate-400">{masking ? maskName(r.nameCn) : r.nameCn}</span>}
      </div>
    )},
    { key: "department", header: "부서", width: 140, cell: (r) => <span className="text-slate-600">{r.department}</span> },
    { key: "position", header: "직위", width: 100, cell: (r) => <span className="text-slate-600">{r.position}</span> },
    { key: "salaryStep", header: "호봉", width: 80, align: "center", cell: (r) => <span className="text-slate-600">{r.salaryStep}호봉</span> },
    { key: "workStatus", header: "근무상태", width: 90, align: "center", cell: (r) => (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium ${STATUS_COLORS[r.workStatus] ?? "bg-slate-50 text-slate-500"}`}>
        {r.workStatus}
      </span>
    )},
    { key: "joinDate", header: "입사일", width: 140, cell: (r) => (
      <span className="text-slate-500">
        {r.joinDate}
        <span className="ml-1 text-slate-400">({r.yearsOfService}년)</span>
      </span>
    )},
    { key: "mobile", header: "연락처", width: 130, cell: (r) => (
      <span className="text-slate-500">{masking ? "010-****-****" : r.mobile ? formatPhone(r.mobile) : "—"}</span>
    )},
  ];

  return (
    <ResourceTable<StaffRow>
      data={data}
      rowKey={(r) => r.id}
      columns={columns}
      options={options}
      locale={{ emptyMessage: "검색 결과가 없습니다", loading: "불러오는 중…" }}
    />
  );
}