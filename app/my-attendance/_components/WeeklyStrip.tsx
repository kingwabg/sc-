import { History, CheckCircle2, LogIn, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWeekLabels, type AttendanceRow } from "@/lib/features/my-attendance";

type Props = {
  todayRow?: AttendanceRow;       // 오늘 row
  nowHHmm: string;                // 오늘 퇴근 안 했을 때 현재시간
};

export function WeeklyStrip({ todayRow, nowHHmm }: Props) {
  const week = getWeekLabels();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900 m-0">이번 주</h2>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {week.map(({ label, date, isToday }) => {
          const cellRow: AttendanceRow | null = isToday
            ? (todayRow ?? null)
            : null;
          const ci = cellRow?.clockIn;
          const co = cellRow?.clockOut;
          const isDone = !!(ci && co);
          const isPartial = !!(ci && !co);
          return (
            <div key={date}>
              <div
                className={cn(
                  "text-[11px] font-semibold mb-1",
                  isToday ? "text-brand-600" : "text-slate-500",
                )}
              >
                {label}
              </div>
              <div
                className={cn(
                  "w-full aspect-square rounded-lg grid place-items-center text-[11px] font-semibold",
                  isDone
                    ? "bg-emerald-100 text-emerald-700"
                    : isPartial
                      ? "bg-amber-100 text-amber-700"
                      : isToday
                        ? "bg-brand-50 text-brand-600 ring-2 ring-brand-300"
                        : "bg-slate-50 text-slate-300",
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isPartial ? (
                  <LogIn className="w-3 h-3" />
                ) : isToday ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  "—"
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {ci?.slice(0, 5) ?? (isToday ? nowHHmm.slice(0, 5) : "—")}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-100" />
          완근
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100" />
          출근만
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-50" />
          미출근
        </span>
      </div>
    </div>
  );
}
