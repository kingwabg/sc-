/**
 * My Attendance — 유틸 함수
 *
 * 시간 계산, 월간 캘린더 그리드, 통계 산출.
 */
import type { AttendanceRow, AttendanceStatus, AttendanceMonthlyStats } from "./types";

/** HH:mm 두 시각의 차이를 분 단위로 반환 (양수만) */
export function diffMinutes(a?: string, b?: string): number {
  if (!a || !b) return 0;
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  if (Number.isNaN(ah) || Number.isNaN(bh)) return 0;
  const m = (bh * 60 + bm) - (ah * 60 + am);
  return m > 0 ? m : 0;
}

/** 분 → "Xh Ym" 표시 */
export function formatMinutes(min: number): string {
  if (!min) return "0h";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** HH:mm 계산 — 두 시각이 있으면 표시, 없으면 — */
export function formatWorkHours(a?: string, b?: string): string {
  return a && b ? formatMinutes(diffMinutes(a, b)) : "—";
}

/** 오늘 기준 이번주 일~토 7일 라벨 */
export function getWeekLabels(reference: Date = new Date()): { label: string; date: string; isToday: boolean }[] {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const todayStr = reference.toISOString().slice(0, 10);
  return days.map((d, i) => {
    const dt = new Date(reference);
    dt.setDate(reference.getDate() - reference.getDay() + i);
    const ds = dt.toISOString().slice(0, 10);
    return { label: d, date: ds, isToday: ds === todayStr };
  });
}

/** 월간 캘린더 그리드 — 6주(42셀) 매트릭스로 반환 */
export function getMonthMatrix(year: number, month0: number): { date: Date; key: string; inMonth: boolean }[] {
  const first = new Date(year, month0, 1);
  const startDow = first.getDay(); // 0(일) ~ 6(토)
  const start = new Date(first);
  start.setDate(first.getDate() - startDow); // 1일의 일요일로 이동
  const cells: { date: Date; key: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    cells.push({
      date: dt,
      key: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`,
      inMonth: dt.getMonth() === month0,
    });
  }
  return cells;
}

/** 상태별 Tailwind 색상 클래스 — dot / badge / 배경에 재사용 */
export const STATUS_TONE: Record<AttendanceStatus, { dot: string; bg: string; text: string; ring: string }> = {
  출근: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  결근: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200" },
  휴가: { dot: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200" },
  외출: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  미체크: { dot: "bg-slate-300", bg: "bg-slate-50", text: "text-slate-500", ring: "ring-slate-200" },
};

/** rows 기반 월간 통계 산출 — 기본근무 = 근무일 × 8h, 초과 = (실근무 - 기본) */
export function calcMonthlyStats(rows: AttendanceRow[], baseWorkHoursPerDay = 8): AttendanceMonthlyStats {
  let workDays = 0, absentDays = 0, leaveDays = 0, totalWorkMinutes = 0;
  let overtimeMinutes = 0;
  for (const r of rows) {
    if (r.status === "출근") {
      workDays++;
      if (r.workMinutes) totalWorkMinutes += r.workMinutes;
    } else if (r.status === "결근") {
      absentDays++;
    } else if (r.status === "휴가") {
      leaveDays++;
    }
  }
  const baseMins = workDays * baseWorkHoursPerDay * 60;
  overtimeMinutes = Math.max(0, totalWorkMinutes - baseMins);
  return {
    workDays,
    absentDays,
    leaveDays,
    totalWorkMinutes,
    baseWorkMinutes: baseMins,
    overtimeMinutes,
  };
}

/** 빠른 lookup: 날짜 → row */
export function indexRowsByDate(rows: AttendanceRow[]): Record<string, AttendanceRow> {
  const idx: Record<string, AttendanceRow> = {};
  for (const r of rows) idx[r.date] = r;
  return idx;
}
