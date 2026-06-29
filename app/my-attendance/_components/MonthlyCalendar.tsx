import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMonthMatrix,
  indexRowsByDate,
  STATUS_TONE,
  type AttendanceRow,
} from "@/lib/features/my-attendance";

type Props = {
  rows: AttendanceRow[];
  initialDate?: Date;
};

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export function MonthlyCalendar({ rows, initialDate }: Props) {
  const today = initialDate ?? new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const matrix = useMemo(() => getMonthMatrix(view.y, view.m), [view]);
  const idx = useMemo(() => indexRowsByDate(rows), [rows]);

  function shift(delta: number) {
    setView((v) => {
      const nm = v.m + delta;
      if (nm < 0) return { y: v.y - 1, m: 11 };
      if (nm > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m: nm };
    });
  }

  const monthLabel = `${view.y}.${String(view.m + 1).padStart(2, "0")}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900 m-0">월간 근태 현황</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="w-7 h-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] font-semibold text-slate-700 w-[60px] text-center tabular-nums">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => shift(1)}
            className="w-7 h-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500"
            aria-label="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-[11px] font-semibold py-1",
              i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : "text-slate-500",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 6주 매트릭스 */}
      <div className="grid grid-cols-7 gap-1">
        {matrix.map(({ date, key, inMonth }) => {
          const row = idx[key];
          const tone = row ? STATUS_TONE[row.status] : null;
          const isToday = key === today.toISOString().slice(0, 10);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          return (
            <div
              key={key}
              className={cn(
                "aspect-square rounded-lg p-1 flex flex-col items-center justify-start text-[11px] border transition",
                inMonth ? "border-transparent" : "border-transparent opacity-40",
                tone ? tone.bg : "",
                isToday ? "ring-2 ring-brand-400 " + (tone ? tone.ring : "ring-brand-200") : "",
              )}
            >
              <span
                className={cn(
                  "font-bold tabular-nums leading-none mb-0.5",
                  inMonth ? "text-slate-800" : "text-slate-400",
                  isToday && "text-brand-700",
                )}
              >
                {date.getDate()}
              </span>
              {tone && inMonth && row?.status !== "미체크" && (
                <span
                  className={cn("w-1.5 h-1.5 rounded-full mt-0.5", tone.dot)}
                  title={row?.status}
                />
              )}
              {isWeekend && !tone && inMonth && (
                <span className="text-[9px] text-slate-300 mt-0.5">주말</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
        {(Object.keys(STATUS_TONE) as Array<keyof typeof STATUS_TONE>).map((k) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className={cn("w-2.5 h-2.5 rounded-full", STATUS_TONE[k].dot)} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
