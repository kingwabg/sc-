"use client";

import { Calendar, Download, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatsPeriod } from "../_lib/stats";

type Props = {
  period: StatsPeriod;
  onPeriodChange: (p: StatsPeriod) => void;
  totalRows: number;
};

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: "week", label: "주간" },
  { value: "month", label: "월간" },
  { value: "year", label: "연간" },
];

export function StatsToolbar({ period, onPeriodChange, totalRows }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 grid place-items-center">
            <BarChart3 className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">일지별 집계</h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>총 {totalRows}일</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Period toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={cn(
                  "px-3 h-7 text-[12px] font-semibold rounded-md transition",
                  period === p.value
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            className="h-8 px-3 bg-white border border-slate-200 text-slate-700 text-[12px] font-medium rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
            onClick={() => alert("엑셀 다운로드 — 추후 구현")}
          >
            <Download className="w-3.5 h-3.5" />
            엑셀 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}