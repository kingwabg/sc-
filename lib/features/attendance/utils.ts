/**
 * Attendance Feature — Utility Functions
 */
import type { AttendanceRow } from "./types";
import { cache, genMonth } from "./data";

export function getAttendanceForYear(year: number): AttendanceRow[] {
  if (cache.has(year)) return cache.get(year)!;
  const all: AttendanceRow[] = [];
  for (let m = 1; m <= 12; m++) {
    all.push(...genMonth(year, m));
  }
  cache.set(year, all);
  return all;
}

export function getAttendanceForMonth(year: number, month1to12: number): AttendanceRow[] {
  return genMonth(year, month1to12);
}

/** 한 달 출석률 통계 */
export function monthlyStats(
  rows: AttendanceRow[],
): { present: number; absent: number; leave: number; sick: number; rate: number } {
  const present = rows.filter((r) => r.status === "등원").length;
  const leave = rows.filter((r) => r.status === "조퇴").length;
  const sick = rows.filter((r) => r.status === "보건휴식").length;
  const absent = rows.filter((r) => r.status === "결석" || r.status === "미등원").length;
  const valid = present + leave + sick + absent;
  const rate = valid > 0 ? Math.round(((present + leave * 0.5) / valid) * 100) : 0;
  return { present, absent, leave, sick, rate };
}

/** 일자별 × 아동 매트릭스용 빠른 조회 */
export function attendanceMap(rows: AttendanceRow[]): Record<string, Record<string, AttendanceRow>> {
  const m: Record<string, Record<string, AttendanceRow>> = {};
  for (const r of rows) {
    if (!m[r.date]) m[r.date] = {};
    m[r.date][r.childId] = r;
  }
  return m;
}

/** 월의 영업일 수 (월~금) */
export function businessDaysInMonth(year: number, month1to12: number): number {
  const daysInMonth = new Date(year, month1to12, 0).getDate();
  let n = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month1to12 - 1, d).getDay();
    if (dow !== 0 && dow !== 6) n++;
  }
  return n;
}
