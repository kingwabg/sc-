"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  MOCK_STAFF,
  POSITION_LABELS,
  workHours,
  type StaffAttendance,
} from "@/lib/staff";
import {
  getStaffAttendanceOverrides,
  setStaffAttendanceOverride,
} from "@/lib/tenant-store";
import {
  Clock,
  LogIn,
  LogOut,
  CalendarCheck,
  CheckCircle2,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const now = today.toISOString().slice(11, 16);

  // 데모: 현재 로그인한 직원을 s02(박은수, 지원교사)로 고정
  const DEMO_STAFF_ID = "s02";
  const demoStaff = MOCK_STAFF.find((s) => s.id === DEMO_STAFF_ID)!;

  const [staffAttOverrides, setStaffAttOverrides] = useState<Record<string, StaffAttendance>>({});

  useEffect(() => {
    setStaffAttOverrides(getStaffAttendanceOverrides());
  }, []);

  const att = useMemo(
    () =>
      (staffAttOverrides as Record<string, StaffAttendance>)[DEMO_STAFF_ID] ??
      ({ clockIn: undefined, clockOut: undefined } as Partial<StaffAttendance>),
    [staffAttOverrides],
  );

  const hasClockIn = !!att?.clockIn;
  const hasClockOut = !!att?.clockOut;
  const isCheckedOut = hasClockIn && hasClockOut;

  function handleClockIn() {
    const next: StaffAttendance = {
      id: `sa-${DEMO_STAFF_ID}-${todayStr}`,
      tenantId: "t_acme",
      staffId: DEMO_STAFF_ID,
      date: todayStr,
      clockIn: now,
      authorId: DEMO_STAFF_ID,
    };
    const newOverrides = { ...staffAttOverrides, [DEMO_STAFF_ID]: next };
    setStaffAttOverrides(newOverrides);
    setStaffAttendanceOverride(DEMO_STAFF_ID, next);
  }

  function handleClockOut() {
    const existing = staffAttOverrides[DEMO_STAFF_ID];
    const next: StaffAttendance = {
      ...(existing ?? {
        id: `sa-${DEMO_STAFF_ID}-${todayStr}`,
        tenantId: "t_acme",
        staffId: DEMO_STAFF_ID,
        date: todayStr,
        authorId: DEMO_STAFF_ID,
      }),
      clockOut: now,
    };
    const newOverrides = { ...staffAttOverrides, [DEMO_STAFF_ID]: next };
    setStaffAttOverrides(newOverrides);
    setStaffAttendanceOverride(DEMO_STAFF_ID, next);
  }

  // 이번주 근태 요약 (mock)
  const weekSummary = useMemo(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days.map((d, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const isToday = dateStr === todayStr;
      const att2 = isToday ? att : null;
      return { day: d, date: dateStr, isToday, att: att2 };
    });
  }, [att, todayStr]);

  return (
    <div className="w-full max-w-[640px] lg:max-w-[720px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">나의 근태</h1>
        </div>
        <p className="text-sm text-slate-500 m-0">
          {POSITION_LABELS[demoStaff.position]} {demoStaff.name}님 · {todayStr}
        </p>
      </div>

      {/* Clock In/Out Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 출근 */}
        <div className={cn(
          "bg-white border rounded-2xl shadow-card p-6 text-center transition",
          hasClockIn
            ? "border-emerald-300 bg-emerald-50/50"
            : "border-slate-200 hover:border-brand-400 hover:shadow-card-hover",
        )}>
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <div className="text-[13px] font-semibold text-slate-700 mb-1">출근</div>
          {hasClockIn ? (
            <>
              <div className="text-2xl font-bold text-emerald-600">{att!.clockIn}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                출근 완료
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-slate-700">{now}</div>
              <button
                onClick={handleClockIn}
                className="mt-3 h-10 px-6 bg-emerald-600 text-white text-[13px] font-bold rounded-[10px] hover:bg-emerald-700 transition shadow-sm"
              >
                출근打刻
              </button>
            </>
          )}
        </div>

        {/* 퇴근 */}
        <div className={cn(
          "bg-white border rounded-2xl shadow-card p-6 text-center transition",
          isCheckedOut
            ? "border-amber-300 bg-amber-50/50"
            : !hasClockIn
              ? "border-slate-100 opacity-60"
              : "border-slate-200 hover:border-brand-400 hover:shadow-card-hover",
        )}>
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 grid place-items-center mx-auto mb-3">
            <LogOut className="w-6 h-6" />
          </div>
          <div className="text-[13px] font-semibold text-slate-700 mb-1">퇴근</div>
          {isCheckedOut ? (
            <>
              <div className="text-2xl font-bold text-amber-600">{att!.clockOut}</div>
              <div className="mt-2 text-[13px] text-amber-700 font-semibold">
                근무 {workHours(att!.clockIn, att!.clockOut)}
              </div>
            </>
          ) : hasClockIn ? (
            <>
              <div className="text-2xl font-bold text-slate-400">—</div>
              <button
                onClick={handleClockOut}
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

      {/* 오늘 요약 */}
      {hasClockIn && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900 m-0">오늘 근태 요약</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] text-slate-500 mb-1">출근</div>
              <div className="text-lg font-bold text-emerald-600">{att!.clockIn ?? "—"}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-1">퇴근</div>
              <div className="text-lg font-bold text-amber-600">{att!.clockOut ?? "—"}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-1">근무시간</div>
              <div className="text-lg font-bold text-slate-700">
                {workHours(att!.clockIn, att!.clockOut)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이번주 요약 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900 m-0">이번 주</h2>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {weekSummary.map(({ day, date, isToday, att: wAtt }) => (
            <div key={date}>
              <div className={cn(
                "text-[11px] font-semibold mb-1",
                isToday ? "text-brand-600" : "text-slate-500",
              )}>
                {day}
              </div>
              <div className={cn(
                "w-full aspect-square rounded-lg grid place-items-center text-[11px] font-semibold",
                wAtt?.clockIn && wAtt?.clockOut
                  ? "bg-emerald-100 text-emerald-700"
                  : wAtt?.clockIn
                    ? "bg-amber-100 text-amber-700"
                    : isToday
                      ? "bg-brand-50 text-brand-600 ring-2 ring-brand-300"
                      : "bg-slate-50 text-slate-300",
              )}>
                {wAtt?.clockIn && wAtt?.clockOut ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : wAtt?.clockIn ? (
                  <LogIn className="w-3 h-3" />
                ) : isToday ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  "—"
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {wAtt?.clockIn?.slice(0, 5) ?? (isToday ? now.slice(0, 5) : "—")}
              </div>
            </div>
          ))}
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
    </div>
  );
}
