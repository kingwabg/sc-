"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  MOCK_CHILDREN,
  ageFromBirthDate,
} from "@/lib/children";
import {
  getAttendanceForMonth,
  monthlyStats,
  attendanceMap,
  businessDaysInMonth,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/attendance";
import type { AttendanceStatus } from "@/lib/children";
import { getTenantSettings } from "@/lib/store";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Printer,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const YEARS = [2026, 2025, 2024];

export default function AttendanceLedgerPage() {
  const today = new Date();
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(today.getMonth() + 1);

  // 시설 정원 (통합설정 > 사업사 설정에서 저장한 값)
  const facilityCapacity = (typeof window !== "undefined"
    ? getTenantSettings().capacity
    : 50) as 30 | 40 | 50;

  const monthRows = useMemo(() => getAttendanceForMonth(year, month), [year, month]);
  const map = useMemo(() => attendanceMap(monthRows), [monthRows]);
  const stats = useMemo(() => monthlyStats(monthRows), [monthRows]);
  const bizDays = useMemo(() => businessDaysInMonth(year, month), [year, month]);

  // 사업사 설정의 정원 기준 필터링
  const filteredChildren = useMemo(
    () => MOCK_CHILDREN.filter((c) => c.capacityGroup === facilityCapacity),
    [facilityCapacity],
  );

  const daysInMonth = new Date(year, month, 0).getDate();

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }
  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  return (
    <AppShell>
      <div className="w-full max-w-[1100px] lg:max-w-[1280px] xl:max-w-[1500px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 flex-wrap">
          <Link href="/children" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            아동 목록
          </Link>
          <span className="text-slate-300">·</span>
          <span className="text-slate-900 font-semibold">출결대장</span>
        </div>

        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">출결대장</h1>
            </div>
            <p className="text-sm text-slate-500 m-0">
              {year}년 {month}월 · 영업일 <b className="text-slate-900">{bizDays}일</b> ·
              정원 <b className="text-brand-600">{facilityCapacity}명</b> ·
              현재 <b className="text-slate-900">{filteredChildren.length}명</b> 재원
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 px-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-[10px] hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              내보내기
            </button>
            <button
              onClick={() => window.print()}
              className="h-10 px-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-[10px] hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              인쇄
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="card-base p-3 mb-4 flex items-center gap-2 flex-wrap">
          {/* Year */}
          <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-1 shadow-sm text-xs">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={cn(
                  "px-3 h-8 rounded-md font-medium transition",
                  year === y ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {y}년
              </button>
            ))}
          </div>

          {/* Month nav */}
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-[10px] shadow-sm">
            <button
              onClick={prevMonth}
              className="h-9 w-9 grid place-items-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-[10px]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 h-9 grid place-items-center text-sm font-semibold text-slate-900 min-w-[80px]">
              {month}월
            </span>
            <button
              onClick={nextMonth}
              className="h-9 w-9 grid place-items-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-[10px]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="ml-auto flex items-center gap-3 text-[12px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              등원 {stats.present}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              조퇴 {stats.leave}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
              보건 {stats.sick}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
              결석 {stats.absent}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              출석률 {stats.rate}%
            </span>
          </div>
        </div>

        {/* Ledger grid */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide min-w-[180px] border-r border-slate-200">
                    이름 / 나이
                  </th>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    const date = new Date(year, month - 1, d);
                    const dow = date.getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    return (
                      <th
                        key={d}
                        className={cn(
                          "px-0.5 py-2 text-center text-[10px] font-medium min-w-[26px]",
                          dow === 0 ? "text-red-400" : dow === 6 ? "text-blue-400" : "text-slate-600",
                        )}
                        title={`${month}/${d} (${["일", "월", "화", "수", "목", "금", "토"][dow]})`}
                      >
                        <div>{d}</div>
                        <div className="text-[8px] mt-0.5">{["일", "월", "화", "수", "목", "금", "토"][dow]}</div>
                      </th>
                    );
                  })}
                  <th className="px-3 py-2 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide min-w-[60px] border-l border-slate-200">
                    출석률
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredChildren.length === 0 ? (
                  <tr>
                    <td colSpan={daysInMonth + 2} className="py-12 text-center text-slate-400 text-sm">
                      해당 정원({facilityCapacity}명)에 등록된 아동이 없습니다.
                    </td>
                  </tr>
                ) : (
                  <CapacityGroup
                    cap={facilityCapacity}
                    list={filteredChildren}
                    year={year}
                    month={month}
                    daysInMonth={daysInMonth}
                    map={map}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend / hint */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              등원
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              조퇴
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
              보건휴식
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
              결석
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
              미등원
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-amber-600">
            <AlertTriangle className="w-3 h-3" />
            출석 데이터는 자동으로 생성된 mock입니다. 실제 데이터로 교체 필요.
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CapacityGroup({
  cap,
  list,
  year,
  month,
  daysInMonth,
  map,
}: {
  cap: number;
  list: typeof MOCK_CHILDREN;
  year: number;
  month: number;
  daysInMonth: number;
  map: Record<string, Record<string, ReturnType<typeof getAttendanceForMonth>[number]>>;
}) {
  return (
    <>
      <tr className="bg-brand-50/60">
        <td colSpan={daysInMonth + 2} className="px-3 py-1.5 text-[11px] font-bold text-brand-700 tracking-wide border-t border-slate-200">
          정원 {cap}명 ({list.length}명 재원)
        </td>
      </tr>
      {list.map((child) => (
        <ChildRow
          key={child.id}
          childId={child.id}
          childName={child.name}
          childAge={ageFromBirthDate(child.birthDate)}
          gender={child.gender}
          year={year}
          month={month}
          daysInMonth={daysInMonth}
          map={map}
        />
      ))}
    </>
  );
}

function ChildRow({
  childId,
  childName,
  childAge,
  gender,
  year,
  month,
  daysInMonth,
  map,
}: {
  childId: string;
  childName: string;
  childAge: number;
  gender: "M" | "F";
  year: number;
  month: number;
  daysInMonth: number;
  map: Record<string, Record<string, ReturnType<typeof getAttendanceForMonth>[number]>>;
}) {
  let present = 0;
  let valid = 0;

  const cells = Array.from({ length: daysInMonth }).map((_, i) => {
    const d = i + 1;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = new Date(year, month - 1, d).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const row = map[date]?.[childId];
    if (row && row.status !== "미등원") {
      valid++;
      if (row.status === "등원") present++;
      else if (row.status === "조퇴") present += 0.5;
    }
    if (isWeekend) {
      return (
        <td key={d} className="bg-slate-50/40 h-7 text-center text-[10px] text-slate-300">
          ·
        </td>
      );
    }
    if (!row || row.status === "미등원") {
      return (
        <td key={d} className="h-7 text-center text-[10px] text-slate-300">
          –
        </td>
      );
    }
    const tone = STATUS_TONE[row.status as AttendanceStatus];
    return (
      <td key={d} className="h-7 text-center p-0">
        <div
          className={cn(
            "h-6 mx-0.5 rounded-sm grid place-items-center text-[10px] font-bold",
            tone.cell,
          )}
          title={`${date} ${row.status}${row.arrivedAt ? ` ${row.arrivedAt}` : ""}${row.reason ? ` (${row.reason})` : ""}`}
        >
          {STATUS_LABEL[row.status as AttendanceStatus][0]}
        </div>
      </td>
    );
  });

  const rate = valid > 0 ? Math.round((present / valid) * 100) : 0;

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/50">
      <td className="sticky left-0 z-10 bg-white px-3 py-1.5 border-r border-slate-100">
        <Link href={`/children/${childId}`} className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0",
              gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
            )}
          >
            {childName[0]}
          </div>
          <div>
            <div className="font-medium text-slate-900 text-[13px]">{childName}</div>
            <div className="text-[10px] text-slate-500">{childAge}세</div>
          </div>
        </Link>
      </td>
      {cells}
      <td className="px-3 py-1.5 text-center border-l border-slate-100">
        <span
          className={cn(
            "text-[11px] font-bold",
            rate >= 90 ? "text-emerald-600" : rate >= 70 ? "text-amber-600" : "text-red-600",
          )}
        >
          {rate}%
        </span>
      </td>
    </tr>
  );
}