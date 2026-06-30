"use client";

/**
 * VolunteerAttendanceTable — 비종사자 출결 (등원/결석 토글) 테이블
 */

import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { VOLUNTEER_TYPE_LABELS, type Volunteer, type VolunteerAttendance } from "@/lib/volunteer";

type VolunteerRow = {
  vol: Volunteer;
  att: VolunteerAttendance | undefined;
};

type Props = {
  rows: VolunteerRow[];
  onUpdate: (volunteerId: string, present: boolean) => void;
};

export function VolunteerAttendanceTable({ rows, onUpdate }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th>이름</Th>
              <Th>유형</Th>
              <Th>소속</Th>
              <Th className="text-center">등원 / 결석</Th>
              <Th>비고</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ vol, att }) => (
              <tr
                key={vol.id}
                className="border-t border-slate-100 hover:bg-brand-50/20 transition"
              >
                <td className="py-3 pl-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold",
                        vol.gender === "M"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-pink-100 text-pink-700",
                      )}
                    >
                      {vol.name[0]}
                    </div>
                    <div className="font-semibold text-slate-900 text-[13px]">
                      {vol.name}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="text-[12px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                    {VOLUNTEER_TYPE_LABELS[vol.type]}
                  </span>
                </td>
                <td className="text-slate-600 text-[13px]">
                  {vol.organization ?? "—"}
                </td>
                <td className="text-center">
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => onUpdate(vol.id, true)}
                      className={cn(
                        "h-8 px-3 rounded-md text-[12px] font-semibold transition",
                        att?.present
                          ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400"
                          : "bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      등원
                    </button>
                    <button
                      onClick={() => onUpdate(vol.id, false)}
                      className={cn(
                        "h-8 px-3 rounded-md text-[12px] font-semibold transition",
                        att && !att.present
                          ? "bg-red-100 text-red-700 ring-2 ring-red-400"
                          : "bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-700",
                      )}
                    >
                      <X className="w-3.5 h-3.5 inline mr-1" />
                      결석
                    </button>
                  </div>
                </td>
                <td className="text-slate-500 text-[12px] pr-4">
                  {att?.reason && <span className="text-amber-600">{att.reason}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
        총 {rows.length}명 · 등원/결석 버튼 클릭하여 상태 변경
      </div>
    </div>
  );
}

function Th({
  children,
  className,
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <th
      colSpan={colSpan}
      className={cn(
        "px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}