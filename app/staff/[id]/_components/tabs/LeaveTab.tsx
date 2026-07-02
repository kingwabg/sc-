"use client";

/**
 * LeaveTab — 종사자 상세 > 휴가 탭 (P12-3 leave-mock 연동)
 *
 * 컬럼: 휴가종류 / 기간 / 일수 / 사유 / 신청일 / 상태 / 결재 ID
 * 합계: 연차 잔여 / 사용 (P12 잔여내역 바인딩)
 */

import { useMemo, useState } from "react";
import { Umbrella, CalendarRange } from "lucide-react";
import {
  LEAVE_KIND_LABELS,
  LEAVE_KIND_EMOJIS,
  type LeaveKind,
  type LeaveBalance,
} from "@/lib/features/leave-mock";

type LeaveRow = {
  id: string;
  staffId: string;
  kind: LeaveKind;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedAt: string;
  status: "대기" | "승인" | "반려" | "취소";
  approvalId: string; // 결재 ID
};

const STATUS_TONE: Record<LeaveRow["status"], string> = {
  대기: "bg-amber-100 text-amber-700",
  승인: "bg-emerald-100 text-emerald-700",
  반려: "bg-rose-100 text-rose-700",
  취소: "bg-slate-100 text-slate-600",
};

const BAL_SEED: LeaveBalance[] = [
  { kind: "annual", total: 15, used: 5, remaining: 10 },
  { kind: "half", total: 4, used: 1, remaining: 3 },
  { kind: "sick", total: 30, used: 0, remaining: 30 },
  { kind: "condolence", total: 5, used: 0, remaining: 5 },
  { kind: "public", total: 1, used: 0, remaining: 1 },
];

const ROWS_SEED: LeaveRow[] = [
  { id: "stl1", staffId: "s05", kind: "annual", startDate: "2025-07-14", endDate: "2025-07-16", days: 3, reason: "여름 휴가", appliedAt: "2025-07-01", status: "대기", approvalId: "APR-2025-0188" },
  { id: "stl2", staffId: "s05", kind: "half", startDate: "2025-05-10", endDate: "2025-05-10", days: 0.5, reason: "개인 사정", appliedAt: "2025-05-03", status: "승인", approvalId: "APR-2025-0091" },
  { id: "stl3", staffId: "s05", kind: "sick", startDate: "2025-04-22", endDate: "2025-04-22", days: 1, reason: "감기", appliedAt: "2025-04-22", status: "승인", approvalId: "APR-2025-0062" },
  { id: "stl4", staffId: "s05", kind: "condolence", startDate: "2025-03-15", endDate: "2025-03-16", days: 2, reason: "친척 경조", appliedAt: "2025-03-14", status: "승인", approvalId: "APR-2025-0044" },
];

export function LeaveTab() {
  const [rows] = useState<LeaveRow[]>(ROWS_SEED);
  const [balances] = useState<LeaveBalance[]>(BAL_SEED);
  const annual = balances.find((b) => b.kind === "annual");
  const totalAnnualRemaining = annual?.remaining ?? 0;
  const totalAnnualUsed = annual?.used ?? 0;
  const totalAnnualTotal = annual?.total ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Umbrella className="w-4 h-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-800">휴가 현황</h3>
        <span className="text-xs text-slate-500">총 {rows.length}건</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-emerald-50 rounded-lg p-3 text-emerald-700">
          <div className="text-[11px]">연차 잔여</div>
          <div className="text-2xl font-bold">{totalAnnualRemaining}일</div>
          <div className="text-[11px] mt-1">총 {totalAnnualTotal}일 부여</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-amber-700">
          <div className="text-[11px]">연차 사용</div>
          <div className="text-2xl font-bold">{totalAnnualUsed}일</div>
          <div className="text-[11px] mt-1">당해 연도 기준</div>
        </div>
        <div className="bg-brand-50 rounded-lg p-3 text-brand-700">
          <div className="text-[11px]">휴가 종류별 잔여</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {balances
              .filter((b) => b.total > 0)
              .map((b) => (
                <span
                  key={b.kind}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded text-[11px]"
                >
                  <span>{LEAVE_KIND_EMOJIS[b.kind]}</span>
                  <span className="font-medium">{LEAVE_KIND_LABELS[b.kind]}</span>
                  <span className="text-slate-500">{b.remaining}/{b.total}</span>
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["휴가종류", "기간", "일수", "사유", "신청일", "상태", "결재 ID"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <span>{LEAVE_KIND_EMOJIS[r.kind]}</span>
                      <span>{LEAVE_KIND_LABELS[r.kind]}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <CalendarRange className="w-3 h-3 text-slate-400" />
                      {r.startDate === r.endDate
                        ? r.startDate
                        : `${r.startDate} ~ ${r.endDate}`}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.days}일
                  </td>
                  <td className="px-3 py-2 text-slate-700 max-w-[200px] truncate">
                    {r.reason}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">{r.appliedAt}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_TONE[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                    {r.approvalId}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-400">
                    휴가 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        휴가 신청/승인은 <a className="underline" href="/leave/apply">/leave/apply</a> 에서 진행됩니다.
        잔여 일수는 P12-3 휴가 mock 데이터와 동기화됩니다.
      </p>
    </div>
  );
}
