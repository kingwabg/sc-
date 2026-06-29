import { Calculator, Hourglass, Briefcase } from "lucide-react";
import {
  calcMonthlyStats,
  formatMinutes,
  type AttendanceRow,
} from "@/lib/features/my-attendance";

type Props = {
  rows: AttendanceRow[];
};

/** 다우오피스 스타일 — 누계/기본/연장/주휴 카드 */
export function AttendanceStats({ rows }: Props) {
  const stats = calcMonthlyStats(rows);
  const remaining = Math.max(0, stats.baseWorkMinutes - stats.totalWorkMinutes);

  const items = [
    {
      label: "누적 근무",
      value: formatMinutes(stats.totalWorkMinutes),
      icon: <Hourglass className="w-4 h-4" />,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "기본 근무",
      value: formatMinutes(stats.baseWorkMinutes),
      icon: <Briefcase className="w-4 h-4" />,
      tone: "bg-slate-50 text-slate-700",
    },
    {
      label: "연장 근무",
      value: formatMinutes(stats.overtimeMinutes),
      icon: <Calculator className="w-4 h-4" />,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "잔여 시간",
      value: formatMinutes(remaining),
      icon: <Hourglass className="w-4 h-4" />,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900 m-0">이번 달 근태 통계</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl border border-slate-100 p-3">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold mb-2 ${it.tone}`}>
              {it.icon}
              {it.label}
            </div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">{it.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-slate-100">
        <div>
          <div className="text-[11px] text-slate-500 mb-0.5">근무일수</div>
          <div className="text-base font-bold text-slate-800 tabular-nums">{stats.workDays}일</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 mb-0.5">결근</div>
          <div className="text-base font-bold text-rose-600 tabular-nums">{stats.absentDays}일</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 mb-0.5">휴가</div>
          <div className="text-base font-bold text-violet-600 tabular-nums">{stats.leaveDays}일</div>
        </div>
      </div>
    </div>
  );
}
