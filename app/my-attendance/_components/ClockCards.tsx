import { LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatWorkHours } from "@/lib/features/my-attendance";

type Props = {
  clockIn?: string;
  clockOut?: string;
  nowHHmm: string;
  onClockIn: () => void;
  onClockOut: () => void;
};

export function ClockCards({
  clockIn,
  clockOut,
  nowHHmm,
  onClockIn,
  onClockOut,
}: Props) {
  const hasIn = !!clockIn;
  const hasOut = !!clockOut;
  const isDone = hasIn && hasOut;
  const canClockOut = hasIn && !hasOut;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* 출근 */}
      <div
        className={cn(
          "bg-white border rounded-2xl shadow-card p-6 text-center transition",
          hasIn
            ? "border-emerald-300 bg-emerald-50/50"
            : "border-slate-200 hover:border-brand-400 hover:shadow-card-hover",
        )}
      >
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <div className="text-[13px] font-semibold text-slate-700 mb-1">출근</div>
        {hasIn ? (
          <>
            <div className="text-2xl font-bold text-emerald-600">{clockIn}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              출근 완료
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-slate-700">{nowHHmm}</div>
            <button
              type="button"
              onClick={onClockIn}
              className="mt-3 h-10 px-6 bg-emerald-600 text-white text-[13px] font-bold rounded-[10px] hover:bg-emerald-700 transition shadow-sm"
            >
              출근打刻
            </button>
          </>
        )}
      </div>

      {/* 퇴근 */}
      <div
        className={cn(
          "bg-white border rounded-2xl shadow-card p-6 text-center transition",
          isDone
            ? "border-amber-300 bg-amber-50/50"
            : !hasIn
              ? "border-slate-100 opacity-60"
              : "border-slate-200 hover:border-brand-400 hover:shadow-card-hover",
        )}
      >
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 grid place-items-center mx-auto mb-3">
          <LogOut className="w-6 h-6" />
        </div>
        <div className="text-[13px] font-semibold text-slate-700 mb-1">퇴근</div>
        {isDone ? (
          <>
            <div className="text-2xl font-bold text-amber-600">{clockOut}</div>
            <div className="mt-2 text-[13px] text-amber-700 font-semibold">
              근무 {formatWorkHours(clockIn, clockOut)}
            </div>
          </>
        ) : canClockOut ? (
          <>
            <div className="text-2xl font-bold text-slate-400">—</div>
            <button
              type="button"
              onClick={onClockOut}
              className="mt-3 h-10 px-6 bg-amber-600 text-white text-[13px] font-bold rounded-[10px] hover:bg-amber-700 transition shadow-sm"
            >
              퇴근打刻
            </button>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-slate-300">—</div>
            <div className="mt-3 text-[12px] text-slate-400">출근 후 퇴근 가능</div>
          </>
        )}
      </div>
    </div>
  );
}
