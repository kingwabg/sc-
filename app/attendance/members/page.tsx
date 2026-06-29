"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  MOCK_STAFF,
  POSITION_LABELS,
  workHours,
  getStaffAttendanceByDate,
  MOCK_STAFF_ATTENDANCES,
} from "@/lib/staff";
import {
  MOCK_VOLUNTEERS,
  VOLUNTEER_TYPE_LABELS,
  getVolunteerAttendanceByDate,
} from "@/lib/volunteer";
import {
  getExtraStaff,
  getStaffAttendanceOverrides,
  setStaffAttendanceOverride,
  getExtraVolunteers,
  getVolunteerAttendanceOverrides,
  setVolunteerAttendanceOverride,
} from "@/lib/tenant-store";
import {
  CalendarCheck,
  Users,
  Clock,
  CheckCircle2,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffAttendance } from "@/lib/staff";
import type { VolunteerAttendance } from "@/lib/volunteer";

export default function AttendanceMembersPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <AttendanceBody />
      </Suspense>
    </AppShell>
  );
}

function AttendanceBody() {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);

  const [staffAttOverrides, setStaffAttOverrides] = useState<Record<string, StaffAttendance>>({});
  const [volAttOverrides, setVolAttOverrides] = useState<Record<string, VolunteerAttendance>>({});

  useEffect(() => {
    setStaffAttOverrides(getStaffAttendanceOverrides());
    setVolAttOverrides(getVolunteerAttendanceOverrides());
  }, []);

  const [activeTab, setActiveTab] = useState<"staff" | "volunteer">("staff");
  const [editingId, setEditingId] = useState<string | null>(null);

  const daysInMonth = new Date(year, month, 0).getDate();
  const dateStr = `${year}-${String(month).padStart(2, "0")}`;

  // 종사자 출석
  const staffRows = useMemo(() => {
    return MOCK_STAFF.concat(getExtraStaff()).map((s) => {
      const override = staffAttOverrides[s.id];
      const fromMock = getStaffAttendanceByDate(s.id, dateStr);
      const att = override ?? fromMock;
      return { staff: s, att };
    });
  }, [staffAttOverrides, dateStr]);

  // 비종사자 출석
  const volRows = useMemo(() => {
    return MOCK_VOLUNTEERS.concat(getExtraVolunteers()).map((v) => {
      const override = volAttOverrides[v.id];
      const fromMock = getVolunteerAttendanceByDate(v.id, dateStr);
      const att = override ?? fromMock;
      return { vol: v, att };
    });
  }, [volAttOverrides, dateStr]);



  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }
  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  // Staff 출석 변경
  function updateStaffAtt(staffId: string, field: "clockIn" | "clockOut", value: string) {
    const existing = staffAttOverrides[staffId] ?? {
      id: `sa-${staffId}-${dateStr}`,
      tenantId: "t_acme",
      staffId,
      date: dateStr,
      authorId: "u_admin",
    };
    const next = { ...existing, [field]: value };
    setStaffAttOverrides(prev => ({ ...prev, [staffId]: next }));
    setStaffAttendanceOverride(staffId, next);
    setEditingId(null);
  }

  // Volunteer 출석 변경
  function updateVolAtt(volunteerId: string, present: boolean) {
    const existing = volAttOverrides[volunteerId] ?? {
      id: `va-${volunteerId}-${dateStr}`,
      tenantId: "t_acme",
      volunteerId,
      date: dateStr,
      authorId: "u_admin",
    };
    const next = { ...existing, present };
    setVolAttOverrides(prev => ({ ...prev, [volunteerId]: next }));
    setVolunteerAttendanceOverride(volunteerId, next);
    setEditingId(null);
  }



  return (
    <div className="w-full max-w-[1100px] lg:max-w-[1280px] xl:max-w-[1400px]">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">구성원 출결 관리</h1>
          </div>
          <p className="text-sm text-slate-500 m-0">관리자 권한 · 전체 출결 입력 및 수정</p>
        </div>

        {/* Month nav */}
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-[10px] shadow-sm">
          <button onClick={prevMonth} className="h-9 w-9 grid place-items-center text-slate-500 hover:text-slate-900 rounded-l-[10px]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 h-9 grid place-items-center text-sm font-bold text-slate-900">
            {year}년 {month}월
          </span>
          <button onClick={nextMonth} className="h-9 w-9 grid place-items-center text-slate-500 hover:text-slate-900 rounded-r-[10px]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-1 shadow-sm text-sm mb-4">
        {([
          { id: "staff" as const, icon: <Users className="w-4 h-4" />, label: "종사자", count: staffRows.length },
          { id: "volunteer" as const, icon: <Clock className="w-4 h-4" />, label: "비종사자", count: volRows.length },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 h-10 rounded-[8px] font-semibold transition",
              activeTab === tab.id
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {tab.icon}
            {tab.label}
            <span className={cn(
              "text-[11px] px-1.5 py-0.5 rounded-full font-bold",
              activeTab === tab.id ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500",
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 종사자 출결 */}
      {activeTab === "staff" && (
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
                {staffRows.map(({ staff, att }) => {
                  const isEditing = editingId === staff.id;
                  return (
                    <tr key={staff.id} className="border-t border-slate-100 hover:bg-brand-50/20 transition">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold",
                            staff.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
                          )}>
                            {staff.name[0]}
                          </div>
                          <div className="font-semibold text-slate-900 text-[13px]">{staff.name}</div>
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
                            onBlur={(e) => updateStaffAtt(staff.id, "clockIn", e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span className={cn(
                            "text-[13px] font-semibold",
                            att?.clockIn ? "text-emerald-600" : "text-slate-300",
                          )}>
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
                            onBlur={(e) => updateStaffAtt(staff.id, "clockOut", e.target.value)}
                          />
                        ) : (
                          <span className={cn(
                            "text-[13px] font-semibold",
                            att?.clockOut ? "text-amber-600" : "text-slate-300",
                          )}>
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
            총 {staffRows.length}명 · 출근/퇴근 시간을 클릭하여 수정
          </div>
        </div>
      )}

      {/* 비종사자 출결 */}
      {activeTab === "volunteer" && (
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
                {volRows.map(({ vol, att }) => (
                  <tr key={vol.id} className="border-t border-slate-100 hover:bg-brand-50/20 transition">
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold",
                          vol.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
                        )}>
                          {vol.name[0]}
                        </div>
                        <div className="font-semibold text-slate-900 text-[13px]">{vol.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[12px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                        {VOLUNTEER_TYPE_LABELS[vol.type]}
                      </span>
                    </td>
                    <td className="text-slate-600 text-[13px]">{vol.organization ?? "—"}</td>
                    <td className="text-center">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => updateVolAtt(vol.id, true)}
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
                          onClick={() => updateVolAtt(vol.id, false)}
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
            총 {volRows.length}명 · 등원/결석 버튼 클릭하여 상태 변경
          </div>
        </div>
      )}

    </div>
  );
}

function Th({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <th
      colSpan={colSpan}
      className={cn("px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-left", className)}
    >
      {children}
    </th>
  );
}
