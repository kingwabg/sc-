"use client";

/**
 * StaffAttendanceTable — 종사자 출결 인라인 편집 테이블
 *
 * 출근/퇴근 시간을 클릭하면 input으로 바뀌고, blur 시 저장.
 */

import { useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { POSITION_LABELS, workHours, type Staff, type StaffAttendance } from "@/lib/staff";

type StaffRow = {
  staff: Staff;
  att: StaffAttendance | undefined;
};

type Props = {
  rows: StaffRow[];
  onUpdate: (staffId: string, field: "clockIn" | "clockOut", value: string) => void;
};

export function StaffAttendanceTable({ rows, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th>이름</Th>
              <Th>직위</Th>
              <Th className="text-center">출근 시간</Th>
              <Th className="text-center">퇴근 시간</Th>
              <Th className="text-center">근무시간</Th>
              <Th className="text-center">수정</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ staff, att }) => {
              const isEditing = editingId === staff.id;
              return (
                <tr
                  key={staff.id}
                  className="border-t border-slate-100 hover:bg-brand-50/20 transition"
                >
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold",
                          staff.gender === "M"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-pink-100 text-pink-700",
                        )}
                      >
                        {staff.name[0]}
                      </div>
                      <div className="font-semibold text-slate-900 text-[13px]">
                        {staff.name}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-[12px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                      {POSITION_LABELS[staff.position]}
                    </span>
                  </td>
                  <td className="text-center">
                    {isEditing ? (
                      <input
                        type="time"
                        defaultValue={att?.clockIn ?? "09:00"}
                        className="h-8 px-2 border border-slate-200 rounded-md text-sm"
                        onBlur={(e) => onUpdate(staff.id, "clockIn", e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={cn(
                          "text-[13px] font-semibold",
                          att?.clockIn ? "text-emerald-600" : "text-slate-300",
                        )}
                      >
                        {att?.clockIn ?? "—"}
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {isEditing ? (
                      <input
                        type="time"
                        defaultValue={att?.clockOut ?? "18:00"}
                        className="h-8 px-2 border border-slate-200 rounded-md text-sm"
                        onBlur={(e) => onUpdate(staff.id, "clockOut", e.target.value)}
                      />
                    ) : (
                      <span
                        className={cn(
                          "text-[13px] font-semibold",
                          att?.clockOut ? "text-amber-600" : "text-slate-300",
                        )}
                      >
                        {att?.clockOut ?? "—"}
                      </span>
                    )}
                  </td>
                  <td className="text-center text-[13px] font-bold text-slate-700">
                    {workHours(att?.clockIn, att?.clockOut)}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditingId(isEditing ? null : staff.id)}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-[12px] font-semibold transition bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Pencil className="w-3 h-3" />
                      {isEditing ? "완료" : "수정"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
        총 {rows.length}명 · 출근/퇴근 시간을 클릭하여 수정
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