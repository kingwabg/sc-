"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarCheck } from "lucide-react";
import {
  MOCK_STAFF,
  getStaffAttendanceByDate,
} from "@/lib/staff";
import {
  MOCK_VOLUNTEERS,
  getVolunteerAttendanceByDate,
} from "@/lib/volunteer";
import {
  getExtraStaff,
  getStaffAttendanceOverrides,
  setStaffAttendanceOverride,
  getExtraVolunteers,
  getVolunteerAttendanceOverrides,
  setVolunteerAttendanceOverride,
} from "@/lib/store";
import type { StaffAttendance } from "@/lib/staff";
import type { VolunteerAttendance } from "@/lib/volunteer";
import { AttendanceMonthNav } from "./_components/AttendanceMonthNav";
import { AttendanceTabs, type AttendanceTab } from "./_components/AttendanceTabs";
import { StaffAttendanceTable } from "./_components/StaffAttendanceTable";
import { VolunteerAttendanceTable } from "./_components/VolunteerAttendanceTable";

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
  // ── State ─────────────────────────────────────────────────
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [activeTab, setActiveTab] = useState<AttendanceTab>("staff");
  const [staffAttOverrides, setStaffAttOverrides] = useState<Record<string, StaffAttendance>>({});
  const [volAttOverrides, setVolAttOverrides] = useState<Record<string, VolunteerAttendance>>({});

  useEffect(() => {
    setStaffAttOverrides(getStaffAttendanceOverrides());
    setVolAttOverrides(getVolunteerAttendanceOverrides());
  }, []);

  const daysInMonth = new Date(year, month, 0).getDate();
  const dateStr = `${year}-${String(month).padStart(2, "0")}`;

  // ── Derived ──────────────────────────────────────────────
  const staffRows = useMemo(
    () =>
      MOCK_STAFF.concat(getExtraStaff()).map((s) => {
        const override = staffAttOverrides[s.id];
        const fromMock = getStaffAttendanceByDate(s.id, dateStr);
        return { staff: s, att: override ?? fromMock };
      }),
    [staffAttOverrides, dateStr],
  );

  const volRows = useMemo(
    () =>
      MOCK_VOLUNTEERS.concat(getExtraVolunteers()).map((v) => {
        const override = volAttOverrides[v.id];
        const fromMock = getVolunteerAttendanceByDate(v.id, dateStr);
        return { vol: v, att: override ?? fromMock };
      }),
    [volAttOverrides, dateStr],
  );

  // ── Handlers ─────────────────────────────────────────────
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }
  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function updateStaffAtt(staffId: string, field: "clockIn" | "clockOut", value: string) {
    const existing = staffAttOverrides[staffId] ?? {
      id: `sa-${staffId}-${dateStr}`,
      tenantId: "t_acme",
      staffId,
      date: dateStr,
      authorId: "u_admin",
    };
    const next = { ...existing, [field]: value };
    setStaffAttOverrides((prev) => ({ ...prev, [staffId]: next }));
    setStaffAttendanceOverride(staffId, next);
  }

  function updateVolAtt(volunteerId: string, present: boolean) {
    const existing = volAttOverrides[volunteerId] ?? {
      id: `va-${volunteerId}-${dateStr}`,
      tenantId: "t_acme",
      volunteerId,
      date: dateStr,
      authorId: "u_admin",
    };
    const next = { ...existing, present };
    setVolAttOverrides((prev) => ({ ...prev, [volunteerId]: next }));
    setVolunteerAttendanceOverride(volunteerId, next);
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1100px] lg:max-w-[1280px] xl:max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">구성원 출결 관리</h1>
          </div>
          <p className="text-sm text-slate-500 m-0">관리자 권한 · 전체 출결 입력 및 수정</p>
        </div>
        <AttendanceMonthNav year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />
      </div>

      <AttendanceTabs
        active={activeTab}
        staffCount={staffRows.length}
        volunteerCount={volRows.length}
        onChange={setActiveTab}
      />

      {activeTab === "staff" ? (
        <StaffAttendanceTable rows={staffRows} onUpdate={updateStaffAtt} />
      ) : (
        <VolunteerAttendanceTable rows={volRows} onUpdate={updateVolAtt} />
      )}
    </div>
  );
}