"use client";

/**
 * 출석 상태 변경 popover — ChildrenTable ag-grid의 셀 렌더러에서도 재사용
 */
import { useRef, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusTone, ATTENDANCE_STATUSES } from "@/lib/features/children/utils";
import type { AttendanceStatus, Attendance } from "@/lib/features/children/types";

type Props = {
  childId: string;
  attendance: Attendance;
  onStatusChange: (childId: string, status: AttendanceStatus, time?: string, reason?: string) => void;
};

export function StatusEditor({ childId, attendance, onStatusChange }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AttendanceStatus>(attendance.status);
  const [time, setTime] = useState(attendance.arrivedAt ?? "09:00");
  const [reasonText, setReasonText] = useState(attendance.reason ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function apply() {
    const needsTime = status === "등원" || status === "조퇴";
    const needsReason = status === "결석" || status === "미등원" || status === "조퇴" || status === "보건휴식";
    onStatusChange(
      childId,
      status,
      needsTime ? time : undefined,
      needsReason ? reasonText : undefined,
    );
    setOpen(false);
  }

  const tone = statusTone(status);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold transition hover:ring-2 hover:ring-brand-200 cursor-pointer",
          tone.bg, tone.text,
        )}
        title="클릭하여 출석 상태 변경"
      >
        {tone.label}
        {attendance.arrivedAt && (
          <span className="text-slate-500 font-normal ml-0.5">{attendance.arrivedAt}</span>
        )}
        <Pencil className="w-3 h-3 opacity-40" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-64 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-2">출석 상태 변경</div>

          <div className="grid grid-cols-3 gap-1 mb-3">
            {ATTENDANCE_STATUSES.map((s) => {
              const t = statusTone(s);
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "px-2 py-1.5 rounded-md text-[11.5px] font-semibold transition",
                    active
                      ? cn(t.bg, t.text, "ring-2 ring-brand-400")
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {(status === "등원" || status === "조퇴") && (
            <div className="mb-2">
              <label className="text-[11px] text-slate-500 block mb-1">
                {status === "조퇴" ? "조퇴 시간" : "등원 시간"}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-8 px-2 border border-slate-200 rounded-md text-[13px]"
              />
            </div>
          )}

          {(status === "결석" || status === "미등원" || status === "조퇴" || status === "보건휴식") && (
            <div className="mb-2">
              <label className="text-[11px] text-slate-500 block mb-1">사유</label>
              <input
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="병원 진료, 가족 여행 등"
                className="w-full h-8 px-2 border border-slate-200 rounded-md text-[13px]"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
            <button onClick={() => setOpen(false)} className="h-7 px-2 text-[11.5px] text-slate-500 hover:text-slate-900">
              취소
            </button>
            <button
              type="button"
              onClick={apply}
              className="h-7 px-3 bg-brand-600 text-white text-[11.5px] font-semibold rounded-md hover:bg-brand-700"
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
