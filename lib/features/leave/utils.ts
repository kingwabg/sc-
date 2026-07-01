/**
 * lib/features/leave/utils.ts — 휴가 일수 계산 유틸
 */

// ─── 공휴일 (2026년 기준 — 매년 갱신 필요) ──────────────────
const HOLIDAYS_2026 = new Set([
  "2026-01-01", // 신정
  "2026-01-28", // 설연휴
  "2026-01-29",
  "2026-01-30",
  "2026-03-01", // 삼일절
  "2026-03-14", // 대보름 (대체)
  "2026-05-05", // 어린이날
  "2026-05-06", // 대체공휴일
  "2026-06-06", // 현충일
  "2026-08-15", // 광복절
  "2026-08-16", // 대체공휴일
  "2026-10-03", // 개천절
  "2026-10-05", // 추석
  "2026-10-06",
  "2026-10-07",
  "2026-10-08",
  "2026-10-09", // 한글날
  "2026-12-25", // 크리스마스
]);

function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function isHoliday(dateStr: string): boolean {
  return HOLIDAYS_2026.has(dateStr);
}

/**
 * 두 날짜 사이의 근무일 수 (주말/공휴일 제외)
 * startDate <= endDate 가정
 */
export function calcWorkdays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const ymd = cur.toISOString().slice(0, 10);
    if (!isWeekend(cur) && !isHoliday(ymd)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/**
 * 연차 소진율 (%)
 */
export function calcUsedRate(usedDays: number, grantedDays: number): number {
  if (grantedDays <= 0) return 0;
  return Math.round((usedDays / grantedDays) * 100);
}
