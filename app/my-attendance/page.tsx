"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  MOCK_STAFF,
  POSITION_LABELS,
  type StaffAttendance,
} from "@/lib/staff";
import {
  getStaffAttendanceOverrides,
  setStaffAttendanceOverride,
} from "@/lib/store";
import {
  getMockMonthRows,
  indexRowsByDate,
  type AttendanceRow,
} from "@/lib/features/my-attendance";

import { MyAttendanceHeader } from "./_components/MyAttendanceHeader";
import { ClockCards } from "./_components/ClockCards";
import { TodaySummary } from "./_components/TodaySummary";
import { WeeklyStrip } from "./_components/WeeklyStrip";
import { MonthlyCalendar } from "./_components/MonthlyCalendar";
import { AttendanceStats } from "./_components/AttendanceStats";

const DEMO_STAFF_ID = "s02";

export default function MyAttendancePage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <MyAttendanceBody />
      </Suspense>
    </AppShell>
  );
}

function MyAttendanceBody() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const nowHHmm = today.toISOString().slice(11, 16);

  const demoStaff = MOCK_STAFF.find((s) => s.id === DEMO_STAFF_ID)!;
  const positionLabel = POSITION_LABELS[demoStaff.position];

  // Hydration-safe 로컬스토리지 읽기
  const [overrides, setOverrides] = useState<Record<string, StaffAttendance>>({});
  useEffect(() => {
    setOverrides(getStaffAttendanceOverrides());
  }, []);

  // 월간 mock — 1일 ~ 말일까지
  const monthRows = useMemo<AttendanceRow[]>(() => getMockMonthRows(), []);
  const rowsByDate = useMemo(() => indexRowsByDate(monthRows), [monthRows]);

  // 오늘 row는 mock + (출퇴근 버튼 처리 결과를 dynamic하게 반영)
  const stored = overrides[DEMO_STAFF_ID];
  const todayRow: AttendanceRow | undefined = useMemo(() => {
    const base = rowsByDate[todayStr];
    const merged: AttendanceRow = stored
      ? {
          ...base,
          date: todayStr,
          status: stored.clockIn ? "출근" : "미체크",
          clockIn: stored.clockIn,
          clockOut: stored.clockOut,
        }
      : base;
    return merged;
  }, [stored, rowsByDate, todayStr]);

  function handleClockIn() {
    const next: StaffAttendance = {
      id: `sa-${DEMO_STAFF_ID}-${todayStr}`,
      tenantId: "t_acme",
      staffId: DEMO_STAFF_ID,
      date: todayStr,
      clockIn: nowHHmm,
      authorId: DEMO_STAFF_ID,
    };
    const updated = setStaffAttendanceOverride(DEMO_STAFF_ID, next);
    setOverrides(updated);
  }
  function handleClockOut() {
    const existing = overrides[DEMO_STAFF_ID];
    const next: StaffAttendance = {
      ...(existing ?? {
        id: `sa-${DEMO_STAFF_ID}-${todayStr}`,
        tenantId: "t_acme",
        staffId: DEMO_STAFF_ID,
        date: todayStr,
        authorId: DEMO_STAFF_ID,
      }),
      clockOut: nowHHmm,
    };
    const updated = setStaffAttendanceOverride(DEMO_STAFF_ID, next);
    setOverrides(updated);
  }

  return (
    <div className="w-full max-w-[640px] lg:max-w-[960px] mx-auto space-y-5">
      <MyAttendanceHeader staff={demoStaff} todayStr={todayStr} positionLabel={positionLabel} />
      <ClockCards
        clockIn={todayRow?.clockIn}
        clockOut={todayRow?.clockOut}
        nowHHmm={nowHHmm}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
      />
      <TodaySummary clockIn={todayRow?.clockIn} clockOut={todayRow?.clockOut} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MonthlyCalendar rows={monthRows} />
        <AttendanceStats rows={monthRows} />
      </div>

      <WeeklyStrip todayRow={todayRow} nowHHmm={nowHHmm} />
    </div>
  );
}
