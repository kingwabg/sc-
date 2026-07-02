"use client";

/**
 * WorkStatusTab — 종사자 상세 > 근무현황 탭
 *
 * 월별 출근현황(게이지 바) + 잔여휴가 + 월별 근무시간 표시
 * div 막대 차트 (출근율 시각화)
 */

import { useMemo } from "react";
import { Clock4, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── mock: 최근 6개월 ────────────────────────────────────────
type Month = {
  key: string;
  workDays: number;          // 근무일수
  presentDays: number;       // 출근일수
  absentDays: number;        // 결근일수
  leaveDays: number;         // 휴가
  overtimeHours: number;     // 잔업시간
};

const MONTHS: Month[] = [
  { key: "2026-01", workDays: 22, presentDays: 22, absentDays: 0, leaveDays: 0, overtimeHours: 4 },
  { key: "2026-02", workDays: 20, presentDays: 19, absentDays: 0, leaveDays: 1, overtimeHours: 6 },
  { key: "2026-03", workDays: 22, presentDays: 21, absentDays: 0, leaveDays: 1, overtimeHours: 8 },
  { key: "2026-04", workDays: 22, presentDays: 22, absentDays: 0, leaveDays: 0, overtimeHours: 5 },
  { key: "2026-05", workDays: 21, presentDays: 20, absentDays: 0, leaveDays: 1, overtimeHours: 12 },
  { key: "2026-06", workDays: 22, presentDays: 22, absentDays: 0, leaveDays: 0, overtimeHours: 6 },
];

function rateTone(rate: number): string {
  if (rate >= 95) return "bg-emerald-500";
  if (rate >= 85) return "bg-amber-500";
  return "bg-rose-500";
}

export function WorkStatusTab() {
  const totals = useMemo(() => {
    let work = 0, present = 0, leave = 0, overtime = 0;
    for (const m of MONTHS) {
      work += m.workDays;
      present += m.presentDays;
      leave += m.leaveDays;
      overtime += m.overtimeHours;
    }
    return {
      work,
      present,
      leave,
      overtime,
      rate: work > 0 ? Math.round((present / work) * 100) : 0,
    };
  }, []);

  const maxOt = Math.max(1, ...MONTHS.map((m) => m.overtimeHours));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock4 className="w-4 h-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-800">월별 근무현황</h3>
        <span className="text-xs text-slate-500">최근 6개월</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-brand-50 rounded-lg p-3 text-brand-700">
          <div className="text-[11px]">누적 출근율</div>
          <div className="text-2xl font-bold">{totals.rate}%</div>
          <div className="text-[11px] mt-1">{totals.present}/{totals.work}일</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-amber-700">
          <div className="text-[11px]">누적 휴가</div>
          <div className="text-2xl font-bold">{totals.leave}일</div>
          <div className="text-[11px] mt-1">연차 기준</div>
        </div>
        <div className="bg-violet-50 rounded-lg p-3 text-violet-700">
          <div className="text-[11px]">잔업시간 합계</div>
          <div className="text-2xl font-bold">{totals.overtime}h</div>
          <div className="text-[11px] mt-1">6개월 누적</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-emerald-700">
          <div className="text-[11px]">월 평균 근무일</div>
          <div className="text-2xl font-bold">
            {(totals.work / MONTHS.length).toFixed(1)}
          </div>
          <div className="text-[11px] mt-1">총 {totals.work}일</div>
        </div>
      </div>

      {/* ─── 출근율 막대 차트 ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> 월별 출근율
        </h4>
        <div className="space-y-2">
          {MONTHS.map((m) => {
            const rate =
              m.workDays > 0 ? Math.round((m.presentDays / m.workDays) * 100) : 0;
            const tone = rateTone(rate);
            return (
              <div key={m.key} className="flex items-center gap-3 text-xs">
                <div className="w-20 text-slate-500 font-medium">{m.key}</div>
                <div className="flex-1 h-5 bg-slate-100 rounded relative overflow-hidden">
                  <div
                    className={cn("h-full transition-all", tone)}
                    style={{ width: `${rate}%` }}
                  />
                  {m.leaveDays > 0 && (
                    <div
                      className="absolute top-0 h-full bg-amber-400/60"
                      style={{
                        left: `${(m.presentDays / m.workDays) * 100}%`,
                        width: `${(m.leaveDays / m.workDays) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <div className="w-14 text-right tabular-nums text-slate-700">
                  {rate}%
                </div>
                <div className="w-28 text-[11px] text-slate-500">
                  출근 {m.presentDays}/{m.workDays} · 휴가 {m.leaveDays}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 잔업시간 막대 차트 ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-3">월별 잔업시간</h4>
        <div className="flex items-end gap-3 h-32">
          {MONTHS.map((m) => {
            const h = (m.overtimeHours / maxOt) * 100;
            return (
              <div key={`ot-${m.key}`} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-slate-500 tabular-nums">
                  {m.overtimeHours}h
                </div>
                <div
                  className="w-full bg-violet-500 rounded-t min-h-[4px]"
                  style={{ height: `${h}%` }}
                />
                <div className="text-[10px] text-slate-500">{m.key.slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
