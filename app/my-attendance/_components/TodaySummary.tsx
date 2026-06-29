import { CalendarCheck } from "lucide-react";
import { formatWorkHours } from "@/lib/features/my-attendance";

type Props = {
  clockIn?: string;
  clockOut?: string;
};

export function TodaySummary({ clockIn, clockOut }: Props) {
  if (!clockIn) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CalendarCheck className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900 m-0">오늘 근태 요약</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-[11px] text-slate-500 mb-1">출근</div>
          <div className="text-lg font-bold text-emerald-600">{clockIn}</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 mb-1">퇴근</div>
          <div className="text-lg font-bold text-amber-600">{clockOut ?? "—"}</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 mb-1">근무시간</div>
          <div className="text-lg font-bold text-slate-700">
            {formatWorkHours(clockIn, clockOut)}
          </div>
        </div>
      </div>
    </div>
  );
}
