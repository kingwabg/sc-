"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Child, AttendanceStatus, Attendance, CapacityGroup } from "@/lib/features/children/types";
import { ageFromBirthDate, statusTone, ATTENDANCE_STATUSES } from "@/lib/features/children/utils";

type SortKey = "name" | "grade" | "today" | "age";
type Props = {
  children: Child[];
  attendanceMap: Record<string, Attendance>;
  onStatusChange: (childId: string, status: AttendanceStatus, time?: string, reason?: string) => void;
};

export function ChildrenTable({ children: list, attendanceMap, onStatusChange }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th className="text-center">이름</Th>
              <Th className="text-center">보호자</Th>
              <Th className="text-center">알레르기</Th>
              <Th className="text-center">오늘</Th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-slate-400 text-sm">
                  검색 결과가 없습니다
                </td>
              </tr>
            ) : (
              list.map((child) => (
                <ChildRow
                  key={child.id}
                  child={child}
                  attendance={attendanceMap[child.id]}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>총 {list.length}명</span>
        <span>상태 배지를 클릭하면 출석을 변경할 수 있어요</span>
      </div>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────
function ChildRow({
  child,
  attendance,
  onStatusChange,
}: {
  child: Child;
  attendance?: Attendance;
  onStatusChange: (childId: string, status: AttendanceStatus, time?: string, reason?: string) => void;
}) {
  const tone = attendance ? statusTone(attendance.status) : null;

  return (
    <tr className="border-t border-slate-100 hover:bg-brand-50/30 transition group">
      {/* 이름 */}
      <td className="py-2.5 px-4">
        <Link href={`/children/${child.id}`} className="flex items-center gap-2.5 justify-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold shrink-0",
              child.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
            )}
          >
            {child.name[0]}
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900 text-[13px]">{child.name}</div>
            <div className="text-[10.5px] text-slate-400">
              {ageFromBirthDate(child.birthDate)}세 · {child.grade ?? "-"}
            </div>
          </div>
        </Link>
      </td>

      {/* 보호자 */}
      <td className="text-center">
        <div className="inline-block text-left">
          <div className="text-[13px] text-slate-900">{child.guardian.name}</div>
          <div className="text-[11px] text-slate-500">
            {child.guardian.relation} · {child.guardian.phone}
          </div>
        </div>
      </td>

      {/* 알레르기 */}
      <td className="text-center">
        {child.health.allergies.length > 0 ? (
          <div className="inline-flex items-center gap-1 flex-wrap justify-center">
            {child.health.allergies.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium"
              >
                <AlertTriangle className="w-3 h-3" />
                {a}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-slate-300 text-[12px]">없음</span>
        )}
      </td>

      {/* 오늘 출석 */}
      <td className="text-center pr-4">
        {tone && (
          <StatusEditor
            childId={child.id}
            attendance={attendance}
            onStatusChange={onStatusChange}
          />
        )}
      </td>
    </tr>
  );
}

// ─── Status Editor Popover ────────────────────────────────────
function StatusEditor({
  childId,
  attendance,
  onStatusChange,
}: {
  childId: string;
  attendance?: Attendance;
  onStatusChange: (childId: string, status: AttendanceStatus, time?: string, reason?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AttendanceStatus>(attendance?.status ?? "미등원");
  const [time, setTime] = useState(attendance?.arrivedAt ?? "09:00");
  const [reasonText, setReasonText] = useState(attendance?.reason ?? "");
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
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold transition hover:ring-2 hover:ring-brand-200 cursor-pointer",
          tone.bg, tone.text,
        )}
        title="클릭하여 출석 상태 변경"
      >
        {tone.label}
        {attendance?.arrivedAt && (
          <span className="text-slate-500 font-normal ml-0.5">{attendance.arrivedAt}</span>
        )}
        <Pencil className="w-3 h-3 opacity-40" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-64 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-2">출석 상태 변경</div>

          {/* Status buttons */}
          <div className="grid grid-cols-3 gap-1 mb-3">
            {ATTENDANCE_STATUSES.map((s) => {
              const t = statusTone(s);
              const active = status === s;
              return (
                <button
                  key={s}
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

          {/* Time input */}
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

          {/* Reason input */}
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

// ─── Sortable Header ──────────────────────────────────────────
function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide", className)}>
      {children}
    </th>
  );
}
